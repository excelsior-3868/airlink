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

    protected $table = 'tbl_customers';

    public $timestamps = false;

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
        'last_login',
        'created_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'last_login' => 'datetime',
            'created_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function recharges(): HasMany
    {
        return $this->hasMany(Recharge::class, 'username', 'username');
    }

    public function activeRecharge(): ?Recharge
    {
        return $this->recharges()->where('status', 'on')->latest('expiration')->first();
    }

    public function getLastLoginAtAttribute()
    {
        return $this->last_login;
    }

    public function setLastLoginAtAttribute($value)
    {
        $this->attributes['last_login'] = $value;
    }
}
