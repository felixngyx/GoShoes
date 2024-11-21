<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Token extends Model
{
    use HasFactory;

    protected $table = 'token';

    protected $fillable = [
        'token',
        'user_id',
        'is_used'
    ];

    protected $casts = [
        'is_used' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
