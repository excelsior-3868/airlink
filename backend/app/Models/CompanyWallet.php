<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyWallet extends Model
{
    protected $table = 'walletCompany';

    public $timestamps = false;

    protected $fillable = ['account_balance', 'balance_to_collect', 'last_loaded_date'];

    protected function casts(): array
    {
        return [
            'account_balance' => 'integer',
            'balance_to_collect' => 'integer',
            'last_loaded_date' => 'date',
        ];
    }
}
