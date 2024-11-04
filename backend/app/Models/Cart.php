<?php

namespace App\Models;

use App\Traits\QueryScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory, QueryScopes;

    protected $table = 'cart';

    protected $fillable = ['user_id','product_id','quantity'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function productvariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
