@component('mail::message')
# Xác nhận đơn hàng #{{ $order->sku }}

Cảm ơn bạn đã đặt hàng tại cửa hàng chúng tôi.

## Thông tin đơn hàng:

@component('mail::table')
| Sản phẩm | Số lượng | Giá |
|:---------|:---------|:----|
@foreach($order->items as $item)
| {{ $item->product->name }} | {{ $item->quantity }} | {{ number_format($item->price) }}đ |
@endforeach
@endcomponent

**Tổng tiền hàng:** {{ number_format($order->original_total) }}đ

@if($order->discount_amount > 0)
**Giảm giá:** {{ number_format($order->discount_amount) }}đ
@endif

**Tổng thanh toán:** {{ number_format($order->total) }}đ

## Thông tin giao hàng:
Địa chỉ: {{ $order->shipping->address }}
<br>
Thành phố: {{ $order->shipping->city }}

## Phương thức thanh toán:
{{ $order->payment->method->name }}

@if($order->total > 0)
    @if($order->payment->method->id === 2)
        Vui lòng chuẩn bị số tiền {{ number_format($order->total) }}đ khi nhận hàng.
    @elseif($order->payment->method->id === 1)
         Vui lòng thanh toán số tiền {{ number_format($order->total) }} với {{ $order->payment->method->name }} sau 15p đặt hàng !
    @endif
@else
    Đơn hàng đang trên đường đến bạn.
@endif


Cảm ơn bạn đã tin tưởng chọn sản phẩm của chúng tôi!

Trân trọng,

{{ config('app.name') }}
@endcomponent
