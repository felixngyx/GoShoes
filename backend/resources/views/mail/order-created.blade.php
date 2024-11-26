@component('mail::message')
# Order Confirmation #{{ $order->sku }}

Thank you for shopping with us!

## Order Details:

@component('mail::table')
| Product | Quantity | Price |
|:--------|:---------|:------|
@foreach($order->items as $item)
| {{ $item->product->name }} | {{ $item->quantity }} | {{ number_format($item->price) }}đ |
@endforeach
@endcomponent

**Subtotal:** {{ number_format($order->original_total) }}đ

@if($order->discount_amount > 0)
**Discount:** -{{ number_format($order->discount_amount) }}đ
@endif

**Total Amount:** {{ number_format($order->total) }}đ

## Shipping Information:

**Recipient:** {{ $shipping['name'] ?? 'N/A' }}
**Phone:** {{ $shipping['phone_number'] ?? 'N/A' }}
**Address:** {{ $shipping['address'] ?? 'N/A' }}
**Address Details:** {{ $shipping['address_detail'] ?? 'N/A' }}

## Payment Method:

{{ $order->payment->method->name }}

@if($order->total > 0)
    @if($order->payment->method->id === 2)
Please prepare {{ number_format($order->total) }}đ for Cash on Delivery.
    @elseif($order->payment->method->id === 1)
Please complete your payment of {{ number_format($order->total) }}đ via {{ $order->payment->method->name }} within 15 minutes!
    @endif
@else
Your order is on its way!
@endif

---

Thank you for choosing our products!

Best regards,
**{{ config('app.name') }}**

@endcomponent
