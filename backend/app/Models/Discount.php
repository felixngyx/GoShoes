<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    use HasFactory;
    protected $fillable = [
        'code', 'description', 'valid_from', 'valid_to',
        'min_order_amount', 'usage_limit', 'percent', 'used_count'
    ];

    protected $casts = [
        'valid_from' => 'datetime',
        'valid_to' => 'datetime',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'discount_products');
    }
}
