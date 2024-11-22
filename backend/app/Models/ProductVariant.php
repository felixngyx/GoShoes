<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;
    protected $fillable = [
        'product_id', 'size_id','color_id', 'quantity'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
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
}
