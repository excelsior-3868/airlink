<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Complaint extends Model
{
    protected $table = 'tblcomplaints';

    protected $primaryKey = 'complaintNumber';

    public $timestamps = false;

    protected $fillable = [
        'customerusername',
        'registeredBy',
        'category',
        'subcategory',
        'complaintType',
        'state',
        'noc',
        'complaintDetails',
        'complaintFile',
        'regDate',
        'status',
        'lastUpdationDate',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customerusername', 'username');
    }

    public function remarks(): HasMany
    {
        return $this->hasMany(ComplaintRemark::class, 'complaintNumber', 'complaintNumber');
    }
}
