<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = ['logged_at', 'type', 'description', 'user_id', 'username', 'ip', 'legacy_id'];

    protected function casts(): array
    {
        return ['logged_at' => 'datetime'];
    }
}
