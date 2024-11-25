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

    public $touches = []; // Không tự động cập nhật quan hệ

    public $timestamps = true; // Tắt nếu bảng không có created_at, updated_at

    protected static function boot()
    {
        parent::boot();
    }

    public function product_variants(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductVariant::class, 'product_id', 'product_id')
            ->whereColumn('product_variants.color_id', 'image_variants.color_id');
    }

}
