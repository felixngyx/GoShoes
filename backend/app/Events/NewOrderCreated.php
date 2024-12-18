<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewOrderCreated implements ShouldBroadcast  // Thêm implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $order_id;
    public function __construct($order_id)
    {
        $this->order_id = $order_id;
    }
    public function broadcastOn()
    {
        return new Channel('admin-channel'); // Tên channel mà event sẽ broadcast tới
    }

    public function broadcastWith()
    {
        return [
            'message' => 'Có đơn hàng mới được tạo',
            'order_id' => $this->order_id
        ];
    }

    public function broadcastAs()
    {
        return 'new-order-created';
    }
}
