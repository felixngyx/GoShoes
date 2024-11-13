<?php

namespace App\Models;

use App\Traits\QueryScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shipping extends Model
{
    use HasFactory, SoftDeletes, QueryScopes;
    protected $table = 'shipping';
    protected $fillable = [
        'user_id',
        'address',
        'city',
        'postal_code',
        'country',
        'phone_number',
        'is_default',
        'deleted_at'
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
