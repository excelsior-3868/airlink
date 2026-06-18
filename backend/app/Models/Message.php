<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'tbl_message';

    public $timestamps = false;

    protected $fillable = ['from_user', 'to_user', 'title', 'message', 'status', 'date', 'sent_at', 'is_read'];

    protected function casts(): array
    {
        return [
            'date' => 'datetime',
        ];
    }

    public function getIsReadAttribute(): bool
    {
        return $this->status === '1';
    }

    public function setIsReadAttribute($value): void
    {
        $this->attributes['status'] = $value ? '1' : '0';
    }

    public function getSentAtAttribute()
    {
        return $this->date;
    }

    public function setSentAtAttribute($value)
    {
        $this->attributes['date'] = $value;
    }
}
