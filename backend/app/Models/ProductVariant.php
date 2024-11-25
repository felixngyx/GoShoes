<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;
    protected $fillable = [
        'product_id', 'size_id','color_id', 'quantity', 'sku'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function size()
    {
        return $this->belongsTo(VariantSize::class, 'size_id');
    }

    public function color()
    {
        return $this->belongsTo(VariantColor::class, 'color_id');
    }

    public function cart()
    {
        return $this->hasMany(Cart::class);
    }

//    /**
//     * @return BelongsTo
//     */
//    public function image_variants(): \Illuminate\Database\Eloquent\Relations\BelongsTo
//    {
//        return $this->belongsTo(ImageVariant::class, ['product_id', 'color_id'], ['product_id', 'color_id']);
//    }
}
