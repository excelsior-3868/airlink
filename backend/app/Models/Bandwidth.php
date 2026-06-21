<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bandwidth extends Model
{
    protected $table = 'tbl_bandwidth';

    public $timestamps = false;

    protected $appends = [
        'name',
    ];

    protected $fillable = [
        'name_bw', 'name', 'rate_down', 'rate_down_unit', 'rate_up', 'rate_up_unit',
    ];

    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class, 'id_bw');
    }

    /** MikroTik rate-limit string, e.g. "2M/4M" (up/down). */
    public function rateLimit(): string
    {
        $up = $this->rate_up . ($this->rate_up_unit === 'Mbps' ? 'M' : 'k');
        $down = $this->rate_down . ($this->rate_down_unit === 'Mbps' ? 'M' : 'k');

        return "{$up}/{$down}";
    }

    public function getNameAttribute()
    {
        return $this->name_bw;
    }

    public function setNameAttribute($value)
    {
        $this->attributes['name_bw'] = $value;
    }
}
