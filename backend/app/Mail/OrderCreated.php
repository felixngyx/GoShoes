<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCreated extends Mailable
{
    use Queueable, SerializesModels;
    public $order;
    /**
     * Create a new message instance.
     */
    public function __construct($orderData)
    {
        // If $orderData is already an array, use it directly
        // If it's a JSON string, decode it
        $this->order = is_string($orderData) ? json_decode($orderData, true) : $orderData;

        // Ensure shipping_detail is decoded if it's a JSON string
        if (isset($this->order['shipping']['shipping_detail']) && is_string($this->order['shipping']['shipping_detail'])) {
            $this->order['shipping']['shipping_detail'] = json_decode($this->order['shipping']['shipping_detail'], true);
        }
    }

    public function build()
    {
        return $this->markdown('emails.orders.created')
            ->subject('Đơn hàng #' . $this->order['sku'] . ' đã được tạo thành công');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Order confirmation - GoShoes',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Ensure all nested data is properly decoded and accessible
        $shippingDetail = is_string($this->order['shipping']['shipping_detail'] ?? '{}')
            ? json_decode($this->order['shipping']['shipping_detail'] ?? '{}', true)
            : ($this->order['shipping']['shipping_detail'] ?? []);

        return new Content(
            markdown: 'mail.order-created',
            with: [
                'order' => $this->order,
                'shipping' => $shippingDetail
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
