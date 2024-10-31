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
            'status' => 'required|string|in:pending,completed,canceled', // Example status values
        ];
    }

    public function messages() {
        return [
            'status.required' => 'The status field is required.',
            'status.string' => 'The status must be a string.',
            'status.in' => 'The selected status is invalid.',
        ];
    }
}
