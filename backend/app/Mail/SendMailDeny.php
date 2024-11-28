<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendMailDeny extends Mailable
{
    use Queueable, SerializesModels;
    public $name;
    public $orderId;
    public $amount;

    /**
     * Create a new message instance.
     */
    public function __construct(string $name, string $orderId, float $amount)
    {
        $this->name = $name;
        $this->orderId = $orderId;
        $this->amount = $amount;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Refund request denied',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.denyRefund',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
