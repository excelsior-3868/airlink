<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'invoice', 'username', 'plan_name', 'price', 'recharged_on', 'expiration',
        'time', 'method', 'router_name', 'type', 'legacy_id',
    ];

    protected function casts(): array
    {
        return [
            'recharged_on' => 'date',
            'expiration' => 'date',
        ];
    }
}
