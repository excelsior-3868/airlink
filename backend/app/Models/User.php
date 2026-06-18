<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Staff / operator account (legacy tbl_users). Authenticates by username.
 *
 * @property string $username
 * @property string $name
 * @property UserRole $role
 * @property string $status
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'tbl_users';

    public $timestamps = false;

    protected $fillable = [
        'username',
        'fullname',
        'name',
        'password',
        'user_type',
        'role',
        'access_control',
        'status',
        'last_login',
        'creationdate',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'last_login' => 'datetime',
            'creationdate' => 'datetime',
            'user_type' => UserRole::class,
        ];
    }

    public function getRememberToken()
    {
        return null;
    }

    public function setRememberToken($value)
    {
        // no-op
    }

    public function getRememberTokenName()
    {
        return '';
    }

    public function isAdmin(): bool
    {
        return $this->user_type === UserRole::Admin;
    }

    public function hasRole(UserRole ...$roles): bool
    {
        return in_array($this->user_type, $roles, true);
    }

    public function isActive(): bool
    {
        return strtolower($this->status ?? 'active') === 'active';
    }

    public function createToken(string $name): object
    {
        $token = \Illuminate\Support\Str::random(40);
        \Illuminate\Support\Facades\Cache::put("api_token:{$token}", $this->id, now()->addYear());

        return new class($token) {
            public string $plainTextToken;
            public function __construct(string $token) {
                $this->plainTextToken = $token;
            }
        };
    }

    public function getNameAttribute()
    {
        return $this->fullname;
    }

    public function setNameAttribute($value)
    {
        $this->attributes['fullname'] = $value;
    }

    public function getRoleAttribute()
    {
        return $this->user_type;
    }

    public function setRoleAttribute($value)
    {
        $this->attributes['user_type'] = $value;
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
