<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Plan extends Model
{
    protected $fillable = [
        'name', 'bandwidth_id', 'price', 'type', 'bandwidth_policy', 'limit_type',
        'time_limit', 'time_unit', 'data_limit', 'data_unit', 'validity', 'validity_unit',
        'shared_users', 'router_name', 'pool', 'access_control', 'data_usage_gb', 'daily_quota',
        'legacy_id',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'access_control' => 'integer',
            'data_usage_gb' => 'integer',
            'daily_quota' => 'integer',
        ];
    }

    public function bandwidth(): BelongsTo
    {
        return $this->belongsTo(Bandwidth::class);
    }
}
