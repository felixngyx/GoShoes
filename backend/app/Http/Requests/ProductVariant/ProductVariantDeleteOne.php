<?php

namespace App\Http\Requests\ProductVariant;

use Illuminate\Foundation\Http\FormRequest;

class ProductVariantDeleteOne extends FormRequest
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
    public function rules(): array
    {
        return [
            "id" => "required|integer|exists:product_variants,id",
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */

    public function messages(): array
    {
        return [
            "id.required" => "Yêu cầu mã biến thể sản phẩm",
            "id.integer" => "Mã biến thể sản phẩm phải là số nguyên",
            "id.exists" => "Mã biến thể sản phẩm không tồn tại",
        ];
    }
}
