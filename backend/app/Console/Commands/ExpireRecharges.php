<?php

namespace App\Console\Commands;

use App\Models\Recharge;
use App\Models\Router;
use App\Services\Provisioning\RadiusService;
use App\Services\Provisioning\RouterOSService;
use Illuminate\Console\Command;

/**
 * Expire active subscriptions whose validity has lapsed. Replaces the legacy
 * system/cron.php: for each expired recharge it de-provisions the subscriber
 * (RADIUS rows removed, or RouterOS user disabled + session killed) and flips
 * the recharge status to 'off'. Scheduled every minute (see routes/console.php).
 */
class ExpireRecharges extends Command
{
    protected $signature = 'airlink:expire-recharges {--dry-run}';

    protected $description = 'Disable subscribers whose recharge has expired';

    public function handle(RadiusService $radius, RouterOSService $routerOs): int
    {
        $now = now();
        $dryRun = $this->option('dry-run');

        $due = Recharge::where('status', 'on')
            ->whereNotNull('expiration')
            ->where('expiration', '<=', $now->toDateString())
            ->get();

        $expired = 0;

        foreach ($due as $recharge) {
            // Same-day expiry respects the recorded time-of-day.
            $expiresAt = $recharge->expiration->copy()->setTimeFromTimeString($recharge->time ?? '00:00:00');
            if ($now->lt($expiresAt)) {
                continue;
            }

            $this->line("EXPIRED: {$recharge->username} ({$recharge->plan_name}) on {$recharge->router_name}");

            if ($dryRun) {
                $expired++;
                continue;
            }

            try {
                if (in_array($recharge->router_name, ['0', '', null], true)) {
                    $radius->deprovision($recharge->username);
                } else {
                    $router = Router::where('name', $recharge->router_name)->first();
                    if ($router) {
                        $routerOs->deprovision($router, $recharge->username, $recharge->type);
                    }
                }
            } catch (\Throwable $e) {
                $this->warn("  de-provision failed for {$recharge->username}: {$e->getMessage()}");
            }

            $recharge->update(['status' => 'off']);
            $expired++;
        }

        $this->info(($dryRun ? '[dry-run] ' : '') . "{$expired} subscription(s) expired.");

        return self::SUCCESS;
    }
}
