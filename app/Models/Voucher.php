<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Voucher extends Model
{
    protected $fillable = [
        'type', 'router_name', 'plan_id', 'code', 'batch', 'user', 'status',
        'generated_by', 'generated_for', 'expired', 'allocation', 'issued_on', 'user_status',
        'legacy_id',
    ];

    protected function casts(): array
    {
        return [
            'expired' => 'boolean',
            'issued_on' => 'date',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function isUsed(): bool
    {
        return $this->status !== '0' && $this->status !== '';
    }
}
