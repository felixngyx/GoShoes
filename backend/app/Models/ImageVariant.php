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

    public $touches = [];

    protected static function boot()
    {
        parent::boot();
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class)
                    ->where('product_id', $this->product_id)
                    ->where('color_id', $this->color_id);
    }

}
