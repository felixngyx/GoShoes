<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            "name" => "string|max:255|unique:products,name,$this->id,id",
            "description" => "string",
            "brand_id" => "exists:brands,id",
            "price" => "numeric|min:0",
            "promotional_price" => "nullable|numeric|min:0|lte:price",
            "status" => "in:public,unpublic,hidden",
            "sku" => "string|unique:products,sku,$this->id,id",
            "thumbnail" => "string|max:255",
            "hagtag" => "nullable|string|max:255",
            'category_ids' => 'array',
            'category_ids.*' => 'exists:categories,id',
            'is_deleted' => 'nullable|boolean',
            'variants' => 'array',
            'variants.*.color_id' => 'exists:variant_colors,id',
            'variants.*.image' => 'string',
            'variants.*.variant_details' => 'array',
            'variants.*.variant_details.*.size_id' => 'exists:variant_sizes,id',
            'variants.*.variant_details.*.quantity' => 'integer|min:0'
        ];
    }

    public function messages() : array
    {
        return [
        ];
    }
}
