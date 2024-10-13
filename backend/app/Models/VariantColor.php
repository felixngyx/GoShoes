<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariantColor extends Model
{
    use HasFactory;
    protected $fillable = ['color', 'hex_code'];

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'color_id');
    }
}
