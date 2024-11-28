<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCancelled extends Mailable
{
    use Queueable, SerializesModels;

    private $order;

    public function __construct($order)
    {
        $this->order = $order;
    }
    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Order Cancelled',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $customerName = 'Customer';
        $orderNumber = '';
    
        if (is_array($this->order) && isset($this->order['user']) && is_array($this->order['user'])) {
            $customerName = $this->order['user']['name'] ?? 'Customer';
            $orderNumber = $this->order['sku'] ?? '';
        }
    
        return new Content(
            view: 'mail.order-cancelled',
            with: [
                'customerName' => $customerName,
                'orderNumber' => $orderNumber,
            ],
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


