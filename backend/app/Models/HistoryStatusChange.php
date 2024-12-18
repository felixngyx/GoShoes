<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoryStatusChange extends Model {
    use HasFactory;
    protected $table = 'history_status_change';
    public $timestamps = false;
    protected $fillable = [
        'user_id', 'order_id', 'time', 'status_before', 'status_after'
    ];

    protected $casts = [
        'time' => 'datetime',
    ];
    public function user() {
        return $this->belongsTo(User::class);
    }

    public function order() {
        return $this->belongsTo(Order::class);
    }
}
