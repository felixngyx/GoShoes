<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
        $id = $this->route('id');
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric',
            'stock_quantity' => 'required|integer|min:1',
            'promotional_price' => 'nullable|numeric|min:0',
            'status' => 'required|in:public,unpublic,hidden',
            'brand_id' => 'required|exists:brands,id',
            'sku' => 'required|string|unique:products,sku,' . $id,
            'hagtag' => 'nullable|string',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'variants' => 'required|array',
            'variants.*.color_id' => 'required|exists:variant_colors,id',
            'variants.*.size_id' => 'required|exists:variant_sizes,id',
            'variants.*.quantity' => 'required|integer|min:1',
            'variants.*.image_variant' => 'nullable|image|mimes:jpeg,png,jpg',
            'images' => 'sometimes|nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg'
        ];
    }
}
