<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class OrderUpdateStatus extends FormRequest {
    public function authorize() {
        // You can implement your authorization logic here
        return true; // Allow all requests for now
    }

    public function rules() {
        return [
            'status' => 'required|string|in:pending,completed,cancelled,shipping,expired,processing',
        ];
    }

    public function messages() {
        return [
            'status.required' => 'Trạng thái không được để trống.',
            'status.string' => 'Trạng thái phải là chuỗi.',
            'status.in' => 'Trạng thái không hợp lệ.',
        ];
    }
}
