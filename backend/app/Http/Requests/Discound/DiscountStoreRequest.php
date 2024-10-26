<?php

namespace App\Http\Requests\Discound;

use Illuminate\Foundation\Http\FormRequest;

class DiscountStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        return [
            'code' => 'required|string|unique:discounts,code|max:50',
            'description' => 'required|string|max:255',
            'valid_from' => 'required|date|after_or_equal:today',
            'valid_to' => 'required|date|after:valid_from',
            'min_order_amount' => 'required|numeric|min:0',
            'usage_limit' => 'required|integer|min:1',
            'percent' => 'required|numeric|min:1|max:100',
            'product_ids' => 'sometimes|array',
            'product_ids.*' => 'exists:products,id'
        ];
    }


    public function messages()
    {
        return [
            'code.required' => 'Mã giảm giá không được để trống',
            'code.unique' => 'Mã giảm giá đã tồn tại',
            'valid_from.after_or_equal' => 'Ngày bắt đầu phải từ hôm nay',
            'valid_to.after' => 'Ngày kết thúc phải sau ngày bắt đầu',
            'percent.min' => 'Phần trăm giảm giá phải lớn hơn 0',
            'percent.max' => 'Phần trăm giảm giá không được vượt quá 100%',
            'usage_limit.min' => 'Số lần sử dụng phải lớn hơn 0'
        ];
    }
}
