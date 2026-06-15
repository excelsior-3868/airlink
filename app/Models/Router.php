<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Router extends Model
{
    protected $fillable = [
        'name', 'ip_address', 'username', 'password', 'api_port', 'use_ssl', 'description', 'legacy_id',
    ];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return [
            'password' => 'encrypted',   // AES-256 via APP_KEY
            'use_ssl' => 'boolean',
            'api_port' => 'integer',
        ];
    }
}
