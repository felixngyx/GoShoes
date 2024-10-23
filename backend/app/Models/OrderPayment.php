<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderPayment extends Model
{
    use HasFactory;
    protected $fillable = ['order_id', 'method_id', 'status'];
    protected $primaryKey = 'order_id';
    public $incrementing = false;

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function method()
    {
        return $this->belongsTo(PaymentMethod::class, 'method_id');
    }
}
