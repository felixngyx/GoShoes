<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'brand_id',
        'description',
        'price',
        'stock_quantity',
        'promotional_price',
        'status',
        'sku',
        'rating_count',
        'slug',
        'thumbnail',
        'hagtag',
        'scheduled_at',
        'published_at'
    ];
    protected $casts = [
        'is_deleted' => 'boolean',
    ];
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'product_category');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function discounts()
    {
        return $this->belongsToMany(Discount::class, 'discount_products');
    }
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }
    protected static function boot()
    {
        parent::boot();

        // Tự động tạo slug khi tạo mới
        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name, '-');
            }
        });

        // Tự động cập nhật slug khi cập nhật
        static::updating(function ($product) {
            if (empty($product->slug) || $product->isDirty('name')) {
                $product->slug = Str::slug($product->name, '-');
            }
        });
    }
}
