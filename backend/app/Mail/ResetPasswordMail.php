<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address as AddressMail;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    private string $resetLink;

    private string $MAIL_FROM_ADDRESS;

    private string $MAIL_FROM_NAME;

    /**
     * Create a new message instance.
     */
    public function __construct( string $resetLink)
    {
        $this->resetLink = $resetLink;
        $this->MAIL_FROM_ADDRESS = env('MAIL_FROM_ADDRESS');
        $this->MAIL_FROM_NAME = env('MAIL_FROM_NAME');
    }


    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        if (env('MAIL_FROM_ADDRESS') === null) {
            throw new \Exception('MAIL_FROM_ADDRESS is not set in .env file');
        }

        return new Envelope(
            subject: 'Reset Password Mail',
            from: new AddressMail($this->MAIL_FROM_ADDRESS, $this->MAIL_FROM_NAME)
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'auth.email.reset_password',
            with: [
                'resetLink' => $this->resetLink
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
