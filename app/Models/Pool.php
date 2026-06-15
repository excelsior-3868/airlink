<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pool extends Model
{
    protected $fillable = ['pool_name', 'range_ip', 'router_name', 'legacy_id'];
}
