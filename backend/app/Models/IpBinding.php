<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IpBinding extends Model
{
    protected $table = 'tbl_ip_binding';

    public $timestamps = false;

    protected $fillable = ['mac_address', 'address', 'nas', 'consumer_name', 'registered_by'];
}
