<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Plan;
use App\Models\Recharge;
use App\Models\Transaction;
use App\Services\Provisioning\RadiusService;
use App\Services\Provisioning\RouterOSService;
use App\Models\Router;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Recharge a subscriber onto a plan. Mirrors legacy prepaid.php:
 *  - expiration = today + plan.validity days
 *  - create tbl_user_recharges + tbl_transactions rows
 *  - update the customer's profile/type/validity
 *  - provision on FreeRADIUS (router '0'/empty) or the target RouterOS device
 */
class RechargeService
{
    public function __construct(
        private readonly RadiusService $radius,
        private readonly RouterOSService $routerOs,
    ) {}

    public function recharge(Customer $customer, Plan $plan, array $opts = []): Recharge
    {
        $method = $opts['method'] ?? 'admin';
        $plainPassword = $opts['password'] ?? null;
        $routerName = $plan->router_name ?: '0';

        $today = now()->toDateString();
        $time = now()->format('H:i:s');
        $expiration = now()->addDays($plan->validity)->toDateString();

        return DB::transaction(function () use ($customer, $plan, $method, $routerName, $today, $time, $expiration, $plainPassword) {
            $recharge = Recharge::create([
                'customer_id' => $customer->id,
                'customer_ref' => (string) $customer->id,
                'username' => $customer->username,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'recharged_on' => $today,
                'expiration' => $expiration,
                'time' => $time,
                'status' => 'on',
                'method' => $method,
                'router_name' => $routerName,
                'type' => $plan->type,
            ]);

            Transaction::create([
                'invoice' => 'INV-' . $this->invoiceDigits(),
                'username' => $customer->username,
                'plan_name' => $plan->name,
                'price' => (string) ($plan->price ?? 0),
                'recharged_on' => $today,
                'expiration' => $expiration,
                'time' => $time,
                'method' => $method,
                'router_name' => $routerName,
                'type' => $plan->type,
            ]);

            $customer->update([
                'validity' => $plan->validity,
                'validity_unit' => $plan->validity_unit,
                'type' => $plan->type,
                'profile' => $plan->name,
                'generated_for' => $method,
            ]);

            // Provision: FreeRADIUS for shared/no router, else the RouterOS device.
            if ($routerName === '0' || $routerName === '') {
                $this->radius->provision($customer, $plan->loadMissing('bandwidth'), $plainPassword);
            } else {
                $router = Router::where('name', $routerName)->first();
                if ($router) {
                    $this->routerOs->provision($router, $customer, $plan->loadMissing('bandwidth'), $plainPassword);
                }
            }

            return $recharge;
        });
    }

    /** 5-digit invoice suffix, matching legacy _raid(5). */
    private function invoiceDigits(): string
    {
        return str_pad((string) random_int(0, 99999), 5, '0', STR_PAD_LEFT);
    }
}
