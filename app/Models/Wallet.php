<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    protected $fillable = [
        'username', 'user_type', 'credit_limit', 'credit_balance', 'available_balance',
        'last_loaded_date', 'loaded_by', 'last_collected_by', 'last_registered_by', 'legacy_id',
    ];

    protected function casts(): array
    {
        return [
            'credit_limit' => 'integer',
            'credit_balance' => 'integer',
            'available_balance' => 'integer',
            'last_loaded_date' => 'date',
        ];
    }
}
