<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $table = 'tbl_logs';

    public $timestamps = false;

    protected $fillable = ['date', 'type', 'description', 'userid', 'username', 'ip'];

    protected function casts(): array
    {
        return ['date' => 'datetime'];
    }

    public function getLoggedAtAttribute()
    {
        return $this->date;
    }

    public function setLoggedAtAttribute($value)
    {
        $this->attributes['date'] = $value;
    }

    public function getUserIdAttribute()
    {
        return $this->userid;
    }

    public function setUserIdAttribute($value)
    {
        $this->attributes['userid'] = $value;
    }
}
