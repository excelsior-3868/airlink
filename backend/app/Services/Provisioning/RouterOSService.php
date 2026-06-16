<?php

namespace App\Services\Provisioning;

use App\Models\Bandwidth;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Router;
use RouterOS\Client;
use RouterOS\Query;
use RuntimeException;

/**
 * Direct MikroTik RouterOS API provisioning (used when a plan targets a specific
 * router instead of the shared FreeRADIUS DB). Replaces the legacy PEAR2 client
 * and class.mikrotik.php with the maintained evilfreelancer/routeros-api-php.
 *
 * Mirrors the legacy operations: create hotspot user / PPPoE secret with the
 * plan's rate-limit + limits, disable + kill active session on expiry.
 */
class RouterOSService
{
    /** @var callable|null Test seam: override how a Client is built. */
    public static $clientFactory = null;

    public function connect(Router $router): Client
    {
        if (self::$clientFactory) {
            return (self::$clientFactory)($router);
        }

        try {
            return new Client([
                'host' => $router->ip_address,
                'user' => $router->username,
                'pass' => $router->password,
                'port' => (int) $router->api_port,
                'ssl' => (bool) $router->use_ssl,
                'timeout' => 5,
                'attempts' => 2,
            ]);
        } catch (\Throwable $e) {
            throw new RuntimeException("Unable to connect to router {$router->name}: {$e->getMessage()}", previous: $e);
        }
    }

    public function provision(Router $router, Customer $customer, Plan $plan, ?string $plainPassword = null): void
    {
        $client = $this->connect($router);
        $password = $plainPassword ?: $customer->username;
        $rate = $plan->bandwidth ? $this->rateLimit($plan->bandwidth) : '';

        if ($plan->type === 'PPPOE') {
            $this->upsertPppoeSecret($client, $customer->username, $password, $plan, $rate);
        } else {
            $this->upsertHotspotUser($client, $customer->username, $password, $plan, $rate);
        }
    }

    /** Disable the user and kill any active session (expiry path). */
    public function deprovision(Router $router, string $username, string $type): void
    {
        $client = $this->connect($router);

        if ($type === 'PPPOE') {
            $this->disableById($client, '/ppp/secret', 'name', $username);
            $this->removeActive($client, '/ppp/active', 'name', $username);
        } else {
            $this->disableById($client, '/ip/hotspot/user', 'name', $username);
            $this->removeActive($client, '/ip/hotspot/active', 'user', $username);
        }
    }

    private function upsertHotspotUser(Client $client, string $user, string $pass, Plan $plan, string $rate): void
    {
        $this->removeById($client, '/ip/hotspot/user', 'name', $user);
        $client->query((new Query('/ip/hotspot/user/add'))
            ->equal('name', $user)
            ->equal('password', $pass)
            ->equal('profile', $plan->name)
            ->equal('limit-uptime', $this->uptime($plan))
            ->equal('rate-limit', $rate))->read();
    }

    private function upsertPppoeSecret(Client $client, string $user, string $pass, Plan $plan, string $rate): void
    {
        $this->removeById($client, '/ppp/secret', 'name', $user);
        $client->query((new Query('/ppp/secret/add'))
            ->equal('name', $user)
            ->equal('password', $pass)
            ->equal('profile', $plan->name)
            ->equal('rate-limit', $rate))->read();
    }

    private function disableById(Client $client, string $path, string $key, string $value): void
    {
        $id = $this->findId($client, $path, $key, $value);
        if ($id) {
            $client->query((new Query("{$path}/set"))->equal('.id', $id)->equal('disabled', 'yes'))->read();
        }
    }

    private function removeById(Client $client, string $path, string $key, string $value): void
    {
        $id = $this->findId($client, $path, $key, $value);
        if ($id) {
            $client->query((new Query("{$path}/remove"))->equal('.id', $id))->read();
        }
    }

    private function removeActive(Client $client, string $path, string $key, string $value): void
    {
        $id = $this->findId($client, $path, $key, $value);
        if ($id) {
            $client->query((new Query("{$path}/remove"))->equal('.id', $id))->read();
        }
    }

    private function findId(Client $client, string $path, string $key, string $value): ?string
    {
        $rows = $client->query((new Query("{$path}/print"))->where($key, $value))->read();

        return $rows[0]['.id'] ?? null;
    }

    private function rateLimit(Bandwidth $bw): string
    {
        $u = $bw->rate_up . ($bw->rate_up_unit === 'Mbps' ? 'M' : 'k');
        $d = $bw->rate_down . ($bw->rate_down_unit === 'Mbps' ? 'M' : 'k');

        return "{$u}/{$d}";
    }

    private function uptime(Plan $plan): string
    {
        if ($plan->limit_type === 'Data_Limit' || ! $plan->time_limit) {
            return '0';
        }
        $minutes = $plan->time_unit === 'Hrs' ? $plan->time_limit * 60 : $plan->time_limit;

        return sprintf('%02d:%02d:00', intdiv($minutes, 60), $minutes % 60);
    }

    public function getLogs(Router $router): array
    {
        $client = $this->connect($router);
        $rows = $client->query((new Query('/log/print')))->read();
        
        // Reverse so the newest logs are first
        return array_reverse($rows);
    }
}
