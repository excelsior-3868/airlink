<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $table = 'tbl_transactions';

    public $timestamps = false;

    protected $appends = [
        'router_name',
    ];

    protected $fillable = [
        'invoice', 'username', 'plan_name', 'price', 'recharged_on', 'expiration',
        'time', 'method', 'routers', 'router_name', 'type',
    ];

    protected function casts(): array
    {
        return [
            'recharged_on' => 'date',
            'expiration' => 'date',
        ];
    }

    public function getRouterNameAttribute()
    {
        return $this->routers;
    }

    public function setRouterNameAttribute($value)
    {
        $this->attributes['routers'] = $value;
    }
}
