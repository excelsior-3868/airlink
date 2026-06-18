<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pool extends Model
{
    protected $table = 'tbl_pool';

    public $timestamps = false;

    protected $fillable = ['pool_name', 'range_ip', 'routers', 'router_name'];

    public function getRouterNameAttribute()
    {
        return $this->routers;
    }

    public function setRouterNameAttribute($value)
    {
        $this->attributes['routers'] = $value;
    }
}
