<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Plan extends Model
{
    protected $table = 'tbl_plans';

    public $timestamps = false;

    protected $fillable = [
        'name_plan', 'name', 'id_bw', 'bandwidth_id', 'price', 'type', 'typebp', 'bandwidth_policy', 'limit_type',
        'time_limit', 'time_unit', 'data_limit', 'data_unit', 'validity', 'validity_unit',
        'shared_users', 'routers', 'router_name', 'pool', 'access_control', 'data_usage_gb', 'daily_quota',
    ];

    protected function casts(): array
    {
        return [
            'id_bw' => 'integer',
            'price' => 'integer',
            'access_control' => 'integer',
            'data_usage_gb' => 'integer',
            'daily_quota' => 'integer',
        ];
    }

    public function bandwidth(): BelongsTo
    {
        return $this->belongsTo(Bandwidth::class, 'id_bw');
    }

    public function getNameAttribute()
    {
        return $this->name_plan;
    }

    public function setNameAttribute($value)
    {
        $this->attributes['name_plan'] = $value;
    }

    public function getBandwidthIdAttribute()
    {
        return $this->id_bw;
    }

    public function setBandwidthIdAttribute($value)
    {
        $this->attributes['id_bw'] = $value;
    }

    public function getBandwidthPolicyAttribute()
    {
        return $this->typebp;
    }

    public function setBandwidthPolicyAttribute($value)
    {
        $this->attributes['typebp'] = $value;
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
