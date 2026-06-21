<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subcategory extends Model
{
    protected $table = 'subcategory';

    public $timestamps = false;

    protected $fillable = [
        'categoryid',
        'subcategory',
        'creationDate',
        'updationDate',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'categoryid', 'id');
    }
}
