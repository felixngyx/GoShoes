<?php

namespace App\Http\Requests\ProductVariant;

use Illuminate\Foundation\Http\FormRequest;

class ProductVariantDeleteMany extends FormRequest
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
            "ids" => "required|array",
            "ids.*" => "required|integer|exists:product_variants,id",
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
            "ids.required" => "Cần có mã định danh của biến thể sản phẩm",
            "ids.array" => "Mã định danh của biến thể sản phẩm phải là một mảng",
            "ids.*.required" => "Cần có mã định danh của biến thể sản phẩm",
            "ids.*.integer" => "Mã định danh của biến thể sản phẩm phải là số nguyên",
            "ids.*.exists" => "Mã định danh của biến thể sản phẩm không tồn tại",
        ];
    }
}
