<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
class Brand extends Model
{
    use HasFactory;
    protected $table = 'brands';
    protected $fillable = [
        'name','slug','description','logo_url','is_active'
    ];

  
    protected static function boot()
    {
        parent::boot();

        // Tự động tạo slug khi tạo mới
        static::creating(function ($brand) {
            if (empty($brand->slug)) {
                $brand->slug = Str::slug($brand->name, '-');
            }
        });

        // Tự động cập nhật slug khi cập nhật
        static::updating(function ($brand) {
            if (empty($brand->slug) || $brand->isDirty('name')) {
                $brand->slug = Str::slug($brand->name, '-');
            }
        });
    }
    public function products()
    {
        return $this->hasMany(Product::class);
    }

}
