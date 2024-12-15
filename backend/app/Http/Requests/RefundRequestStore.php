<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RefundRequestStore extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'order_id' => 'required|exists:orders,id',
            'reason' => 'required|string|min:10',
            'images' => 'nullable|array',
            'images.*' => 'url'
        ];
    }

    public function messages()
    {
        return [
            'reason.required' => 'Vui lòng cung cấp lý do cho yêu cầu hoàn tiền',
            'reason.min' => 'Lý do phải có ít nhất 10 ký tự',
            'images.*.url' => 'Định dạng URL hình ảnh không hợp lệ'
        ];
    }
}
