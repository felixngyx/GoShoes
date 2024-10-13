<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariantSize extends Model
{
    use HasFactory;
    protected $fillable = ['size', 'code'];

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'size_id');
    }
}
