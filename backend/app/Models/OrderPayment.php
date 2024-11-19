<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderPayment extends Model
{
    use HasFactory;
    protected $primaryKey = 'order_id';
    public $incrementing = false;
    protected $fillable = ['order_id', 'method_id', 'status','url'];
    protected $casts = [
        'status' => 'string'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function method()
    {
        return $this->belongsTo(PaymentMethod::class, 'method_id');
    }
}
