<?php

namespace App\Services\Provisioning;

use App\Models\Customer;
use App\Models\Plan;
use App\Models\RadCheck;
use App\Models\RadReply;

/**
 * FreeRADIUS shared-DB provisioning. Mirrors the legacy PHPMixBill prepaid.php
 * recharge block: writes radcheck (Cleartext-Password, User-Profile, Expire-After,
 * Total-Volume-Limit, Daily-Quota-Limit). radreply logic is handled by group observers.
 */
class RadiusService
{
    /**
     * Provision (or re-provision) a subscriber in FreeRADIUS for a plan.
     * Existing rows for the user are cleared first so a recharge is idempotent.
     *
     * RADIUS needs the plaintext password for Cleartext-Password. Since the new
     * schema bcrypt-hashes customer passwords, the caller passes the plaintext
     * (the voucher code, or an admin-entered password). Falls back to the
     * username (the common hotspot convention where code == user == password).
     */
    public function provision(Customer $customer, Plan $plan, ?string $plainPassword = null): void
    {
        $username = $customer->username;
        $password = $plainPassword ?: $username;
        $this->deprovision($username);

        RadCheck::insert([
            ['username' => $username, 'attribute' => 'Cleartext-Password', 'op' => ':=', 'value' => $password],
            ['username' => $username, 'attribute' => 'User-Profile', 'op' => ':=', 'value' => $plan->name],
            ['username' => $username, 'attribute' => 'Expire-After', 'op' => ':=', 'value' => (string) ($plan->validity * 24 * 60 * 60)],
            ['username' => $username, 'attribute' => 'Total-Volume-Limit', 'op' => ':=', 'value' => (string) (($plan->data_usage_gb ?? 0) * 1024 * 1024 * 1024)],
            ['username' => $username, 'attribute' => 'Daily-Quota-Limit', 'op' => ':=', 'value' => (string) (($plan->daily_quota ?? 0) * 1024 * 1024 * 1024)],
        ]);
    }

    /** Remove all RADIUS auth/reply rows for a user (used on expiry/deletion). */
    public function deprovision(string $username): void
    {
        RadCheck::where('username', $username)->delete();
        RadReply::where('username', $username)->delete();
    }
}
