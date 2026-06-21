<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recharge extends Model
{
    protected $table = 'tbl_user_recharges';

    public $timestamps = false;

    protected $appends = [
        'plan_name',
        'router_name',
        'customer_ref',
    ];

    protected $fillable = [
        'customer_id', 'customer_ref', 'username', 'plan_id', 'plan_name', 'namebp',
        'recharged_on', 'expiration', 'time', 'status', 'method', 'routers', 'router_name', 'type',
    ];

    protected function casts(): array
    {
        return [
            'plan_id' => 'integer',
            'recharged_on' => 'date',
            'expiration' => 'date',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'username', 'username');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    public function getPlanNameAttribute()
    {
        return $this->namebp;
    }

    public function setPlanNameAttribute($value)
    {
        $this->attributes['namebp'] = $value;
    }

    public function getRouterNameAttribute()
    {
        return $this->routers;
    }

    public function setRouterNameAttribute($value)
    {
        $this->attributes['routers'] = $value;
    }

    public function getCustomerRefAttribute()
    {
        return $this->customer_id;
    }

    public function setCustomerRefAttribute($value)
    {
        $this->attributes['customer_id'] = $value;
    }
}
