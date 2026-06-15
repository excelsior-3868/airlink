<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IpBinding extends Model
{
    protected $fillable = ['mac_address', 'address', 'nas', 'consumer_name', 'registered_by', 'legacy_id'];
}
