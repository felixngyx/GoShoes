<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            "name" => "required|string|max:255|unique:products",
            "description" => "required|string",
            "brand_id" => "required|exists:brands,id",
            "price" => "required|numeric|min:0",
            "promotional_price" => "nullable|numeric|min:0|lte:price",
            "status" => "required|in:public,unpublic,hidden",
            "sku" => "required|string|unique:products",
            "thumbnail" => "required|string|max:255",
            "hagtag" => "required|nullable|string|max:255",
            'is_deleted' => 'required|nullable|boolean',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'variants' => 'required|array',
            'variants.*.color_id' => 'required|exists:variant_colors,id',
            'variants.*.image' => 'required|string',
            'variants.*.variant_details' => 'required|array',
            'variants.*.variant_details.*.size_id' => 'required|exists:variant_sizes,id',
            'variants.*.variant_details.*.quantity' => 'required|integer|min:0',
            'variants.*.variant_details.*.sku' => 'required|string|unique:product_variants,sku',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'The product name is required.',
            'name.string' => 'The product name must be a string.',
            'name.max' => 'The product name may not be greater than 255 characters.',
            'name.unique' => 'The product name has already been taken.',
            'description.required' => 'The product description is required.',
            'description.string' => 'The product description must be a string.',
            'brand_id.required' => 'The brand ID is required.',
            'brand_id.exists' => 'The selected brand ID is invalid.',
            'price.required' => 'The price is required.',
            'price.numeric' => 'The price must be a number.',
            'price.min' => 'The price must be at least 0.',
            'promotional_price.numeric' => 'The promotional price must be a number.',
            'promotional_price.min' => 'The promotional price must be at least 0.',
            'promotional_price.lte' => 'The promotional price must be less than or equal to the price.',
            'status.required' => 'The status is required.',
            'status.in' => 'The selected status is invalid.',
            'sku.required' => 'The SKU is required.',
            'sku.string' => 'The SKU must be a string.',
            'sku.unique' => 'The SKU has already been taken.',
            'thumbnail.required' => 'The thumbnail URL is required.',
            'thumbnail.string' => 'The thumbnail URL must be a string.',
            'thumbnail.max' => 'The thumbnail URL may not be greater than 255 characters.',
            'hagtag.string' => 'The hagtag must be a string.',
            'hagtag.max' => 'The hagtag may not be greater than 255 characters.',
            'is_deleted.boolean' => 'The is_deleted field must be true or false.',
            'variants.required' => 'The variants are required.',
            'variants.array' => 'The variants must be an array.',
            'variants.*.color_id.required' => 'The color ID for each variant is required.',
            'variants.*.color_id.exists' => 'The selected color ID for each variant is invalid.',
            'variants.*.image.required' => 'The image URL for each variant is required.',
            'variants.*.image.string' => 'The image URL for each variant must be a string.',
            'variants.*.variant_details.required' => 'The variant details are required.',
            'variants.*.variant_details.array' => 'The variant details must be an array.',
            'variants.*.variant_details.*.size_id.required' => 'The size ID for each variant detail is required.',
            'variants.*.variant_details.*.size_id.exists' => 'The selected size ID for each variant detail is invalid.',
            'variants.*.variant_details.*.quantity.required' => 'The quantity for each variant detail is required.',
            'variants.*.variant_details.*.quantity.integer' => 'The quantity for each variant detail must be an integer.',
            'variants.*.variant_details.*.quantity.min' => 'The quantity for each variant detail must be at least 0.',
            'variants.*.variant_details.*.sku.required' => 'The SKU for each variant detail is required.',
            'variants.*.variant_details.*.sku.string' => 'The SKU for each variant detail must be a string.',
            'variants.*.variant_details.*.sku.unique' => 'The SKU for each variant detail has already been taken.',
        ];
    }
}
