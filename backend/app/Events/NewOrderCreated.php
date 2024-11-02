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
    public $orderId;
    public $message;


    public function __construct($orderId)
    {
        $this->orderId = $orderId;
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('admin-channel')]; // Thêm new Channel()
    }

    public function broadcastAs(): string  // Thêm kiểu trả về string
    {
        return 'order.created';
    }

    public function broadcastWith()
    {
        $this->message = 'Ting Ting ! New Order';
        return [
            'order_id' => $this->orderId,
            'message' => $this->message
        ];
    }
}
