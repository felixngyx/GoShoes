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
            "ids.required" => "Product variant ids are required",
            "ids.array" => "Product variant ids must be an array",
            "ids.*.required" => "Product variant id is required",
            "ids.*.integer" => "Product variant id must be an integer",
            "ids.*.exists" => "Product variant id does not exist",
        ];
    }
}
