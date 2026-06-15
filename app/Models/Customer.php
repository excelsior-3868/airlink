<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Subscriber account (legacy tbl_customers). Authenticates by username on the customer portal.
 */
class Customer extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'password',
        'fullname',
        'batch',
        'address',
        'phonenumber',
        'validity',
        'validity_unit',
        'profile',
        'type',
        'generated_by',
        'generated_for',
        'status',
        'last_login_at',
        'legacy_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function recharges(): HasMany
    {
        return $this->hasMany(Recharge::class);
    }

    public function activeRecharge(): ?Recharge
    {
        return $this->recharges()->where('status', 'on')->latest('expiration')->first();
    }
}
