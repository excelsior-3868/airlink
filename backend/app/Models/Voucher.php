<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Voucher extends Model
{
    protected $table = 'tbl_voucher';

    public $timestamps = false;

    protected $fillable = [
        'type', 'routers', 'router_name', 'id_plan', 'plan_id', 'code', 'batch', 'user', 'status',
        'generated_by', 'generated_for', 'expired', 'allocation', 'created_date', 'issued_on', 'user_status',
    ];

    protected function casts(): array
    {
        return [
            'id_plan' => 'integer',
            'expired' => 'boolean',
            'created_date' => 'date',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'id_plan');
    }

    public function isUsed(): bool
    {
        return $this->status !== '0' && $this->status !== '';
    }

    public function getRouterNameAttribute()
    {
        return $this->routers;
    }

    public function setRouterNameAttribute($value)
    {
        $this->attributes['routers'] = $value;
    }

    public function getPlanIdAttribute()
    {
        return $this->id_plan;
    }

    public function setPlanIdAttribute($value)
    {
        $this->attributes['id_plan'] = $value;
    }

    public function getIssuedOnAttribute()
    {
        return $this->created_date;
    }

    public function setIssuedOnAttribute($value)
    {
        $this->attributes['created_date'] = $value;
    }
}
