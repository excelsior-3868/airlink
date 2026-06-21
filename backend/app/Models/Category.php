<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $table = 'category';

    public $timestamps = false;

    protected $fillable = [
        'categoryName',
        'categoryDescription',
        'creationDate',
        'updationDate',
    ];

    public function subcategories(): HasMany
    {
        return $this->hasMany(Subcategory::class, 'categoryid', 'id');
    }
}
