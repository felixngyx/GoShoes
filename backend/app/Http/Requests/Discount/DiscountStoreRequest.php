<?php

namespace App\Http\Requests\Discount;

use Illuminate\Foundation\Http\FormRequest;

class DiscountStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:255|unique:discounts,code',
            'description' => 'required|string',
            'valid_from' => 'required|date',
            'valid_to' => 'nullable|date|after:valid_from',
            'min_order_amount' => 'required|numeric|min:0',
            'usage_limit' => 'required|integer|min:1',
            'percent' => 'required|numeric|min:0|max:100',
            'used_count' => 'nullable|integer|min:0',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id'
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'The discount code is required',
            'code.unique' => 'The discount code has already been taken',
            'description.required' => 'The description is required',
            'valid_from.required' => 'The start date is required',
            'valid_to.after' => 'The end date must be after start date',
            'min_order_amount.required' => 'The minimum order amount is required',
            'min_order_amount.min' => 'The minimum order amount must be greater than 0',
            'usage_limit.required' => 'The usage limit is required',
            'usage_limit.min' => 'The usage limit must be greater than 0',
            'percent.required' => 'The discount percentage is required',
            'percent.min' => 'The discount percentage must be between 0 and 100',
            'percent.max' => 'The discount percentage must be between 0 and 100'
        ];
    }
}
