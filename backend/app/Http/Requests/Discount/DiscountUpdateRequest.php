<?php

namespace App\Http\Requests\Discount;

use Illuminate\Foundation\Http\FormRequest;

class DiscountUpdateRequest extends FormRequest
{
    public function rules()
    {
        return [
            'code' => 'required|string|unique:discounts,code,' . $this->route('id'),
            'description' => 'nullable|string',
            'valid_from' => 'required|date',
            'valid_to' => 'nullable|date|after:valid_from',
            'min_order_amount' => 'required|numeric|min:0',
            'usage_limit' => 'required|integer|min:1',
            'percent' => [
                'required',
                'numeric',
                'min:0',
                'max:100'
            ],
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id'
        ];
    }

    public function messages()
    {
        return [
            'code.required' => 'Discount code is required',
            'code.unique' => 'Discount code already exists',
            'valid_from.required' => 'Start date is required',
            'valid_from.date' => 'Invalid start date format',
            'valid_to.required' => 'End date is required',
            'valid_to.date' => 'Invalid end date format',
            'valid_to.after' => 'End date must be after start date',
            'min_order_amount.required' => 'Minimum order amount is required',
            'min_order_amount.numeric' => 'Minimum order amount must be a number',
            'min_order_amount.min' => 'Minimum order amount must be greater than 0',
            'usage_limit.required' => 'Usage limit is required',
            'usage_limit.integer' => 'Usage limit must be an integer',
            'usage_limit.min' => 'Usage limit must be greater than 0',
            'percent.required' => 'Discount percentage is required',
            'percent.numeric' => 'Discount percentage must be a number',
            'percent.min' => 'Discount percentage must be greater than 0',
            'percent.max' => 'Discount percentage cannot exceed 100',
            'product_ids.array' => 'Invalid product list format',
            'product_ids.*.exists' => 'One or more products do not exist'
        ];
    }
}
