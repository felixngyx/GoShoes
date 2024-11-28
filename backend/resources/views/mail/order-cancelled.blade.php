<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Cancelled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #e53e3e;">Order Cancellation Notice</h2>
        
        <p>Dear {{ $customerName }},</p>
        
        <p>We regret to inform you that your order #{{ $orderNumber }} has been cancelled.</p>

        <div style="background: #f8f8f8; padding: 15px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p>Order SKU: #{{ $orderNumber }}</p>
        </div>

        <p>If you have any questions about this cancellation, please don't hesitate to contact our customer service team.</p>
        <p>Mail Contact : customersupport@goshoes.com</p>
        <p>Best regards,<br>
        GoShoes Team</p>
    </div>
</body>
</html>