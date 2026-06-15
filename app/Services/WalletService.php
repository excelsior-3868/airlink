<?php

namespace App\Services;

use App\Models\Wallet;

/**
 * Seller/POS credit ledger. Mirrors legacy wallet handling: loading credit
 * raises both credit_balance and available_balance and stamps who/when.
 */
class WalletService
{
    public function load(string $username, int $amount, string $loadedBy, ?string $userType = null): Wallet
    {
        $wallet = Wallet::firstOrNew(['username' => $username]);

        $wallet->credit_balance = ($wallet->credit_balance ?? 0) + $amount;
        $wallet->available_balance = ($wallet->available_balance ?? 0) + $amount;
        $wallet->last_loaded_date = now()->toDateString();
        $wallet->loaded_by = $loadedBy;
        if ($userType) {
            $wallet->user_type = $userType;
        }
        $wallet->save();

        return $wallet;
    }
}
