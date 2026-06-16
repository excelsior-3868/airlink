<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RadAcct extends Model
{
    protected $table = 'radacct';
    protected $primaryKey = 'radacctid';
    public $timestamps = false;
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'acctstarttime' => 'datetime',
            'acctstoptime' => 'datetime',
            'acctupdatetime' => 'datetime',
        ];
    }
}
