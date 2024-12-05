<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'product_id', 'size_id','color_id', 'quantity', 'sku', 'deleted_at'
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

    public function images()
    {
        return $this->hasMany(ImageVariant::class, 'color_id', 'color_id')
                    ->where('product_id', $this->product_id);
    }
}
