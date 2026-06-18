<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Router extends Model
{
    protected $table = 'tbl_routers';

    public $timestamps = false;

    protected $fillable = [
        'name', 'ip_address', 'username', 'password', 'description',
    ];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return [
            'password' => 'encrypted',
        ];
    }
}
