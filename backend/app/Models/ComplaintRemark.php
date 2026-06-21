<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintRemark extends Model
{
    protected $table = 'complaintremark';

    public $timestamps = false;

    protected $fillable = [
        'complaintNumber',
        'status',
        'remark',
        'remarkDate',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'complaintNumber', 'complaintNumber');
    }
}
