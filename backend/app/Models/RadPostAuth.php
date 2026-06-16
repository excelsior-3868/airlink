<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RadPostAuth extends Model
{
    protected $table = 'radpostauth';
    public $timestamps = false;
    protected $guarded = [];

    protected function casts(): array
    {
        return ['authdate' => 'datetime'];
    }
}
