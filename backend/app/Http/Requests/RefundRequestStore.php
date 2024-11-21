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
            'reason.required' => 'Please provide a reason for the refund request',
            'reason.min' => 'The reason must be at least 10 characters',
            'images.*.url' => 'Invalid image URL format'
        ];
    }
} 
