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
        $id = $this->route('id');
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric',
            'stock_quantity' => 'required|integer|min:1',
            'promotional_price' => 'nullable|numeric|min:0|required_without:price',
            'status' => 'required|in:public,unpublic,hidden',
            'brand_id' => 'required|exists:brands,id',
            'sku' => 'required|string|unique:products,sku,' . $id,
            'thumbnail' => 'required|string|max:255',
            'hagtag' => 'nullable|string',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'variants' => 'nullable|array', // Thay đổi thành nullable
            'variants.*.color_id' => 'required_with:variants|exists:variant_colors,id',
            'variants.*.size_id' => 'required_with:variants|exists:variant_sizes,id',
            'variants.*.quantity' => 'required_with:variants|integer|min:1',
            'variants.*.image_variant' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string|max:255',
        ];
    }
}
