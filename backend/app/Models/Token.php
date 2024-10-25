<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Token extends Model
{
    use HasFactory;

    protected $table = 'password_change_history';

    protected $fillable = [
        'token',
        'user_id',
        'is_used'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
