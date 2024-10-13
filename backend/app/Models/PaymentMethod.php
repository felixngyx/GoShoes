<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'description'];

    public function orderPayments()
    {
        return $this->hasMany(OrderPayment::class, 'method_id');
    }
}
