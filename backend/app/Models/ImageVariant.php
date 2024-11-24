<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImageVariant extends Model
{
    use HasFactory;

    protected $table = 'image_variants';

    protected $fillable = [
        'image',
        'product_id',
        'color_id'
    ];

    public function product_variants(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, ['product_id', 'color_id'], ['product_id', 'color_id']);
    }
}
