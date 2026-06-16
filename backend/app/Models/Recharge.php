<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recharge extends Model
{
    protected $fillable = [
        'customer_id', 'customer_ref', 'username', 'plan_id', 'plan_name',
        'recharged_on', 'expiration', 'time', 'status', 'method', 'router_name', 'type',
        'legacy_id',
    ];

    protected function casts(): array
    {
        return [
            'recharged_on' => 'date',
            'expiration' => 'date',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
}
