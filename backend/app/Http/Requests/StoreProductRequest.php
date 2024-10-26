<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'stock_quantity' => 'required|integer|min:1',
            'promotional_price' => 'nullable|numeric|min:0',
            'status' => 'required|in:public,unpublic,hidden',
            'sku' => 'required|string|unique:products,sku',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'hagtag' => 'nullable|string',
            'category_ids' => 'required|array', // Array of category IDs
            'category_ids.*' => 'exists:categories,id',
            'variants' => 'required|array',
            'variants.*.color_id' => 'required|exists:variant_colors,id',
            'variants.*.size_id' => 'required|exists:variant_sizes,id',
            'variants.*.quantity' => 'required|integer|min:1',
            'variants.*.image_variant' => 'required|image|mimes:jpeg,png,jpg',
            'images' => 'sometimes|array', 
            'images.*' => 'image|mimes:jpeg,png,jpg',
            'brand_id' => 'required|exists:brands,id', // Thêm trường brand_id
        ];
    }

    public function messages()
    {
       return [
        'name.required' => 'Tên sản phẩm không được bỏ trống',
        'name.string' => 'Tên sản phẩm phải là một chuỗi',
        'name.max' => 'Tên sản phẩm không được quá 255 ký tự',
        'description.required' => 'Mô tả sản phẩm không được bỏ trống',
        'description.string' => 'Mô tả sản phẩm phải là một chuỗi',
        'price.required' => 'Giá sản phẩm không được bỏ trống',
        'price.numeric' => 'Giá sản phẩm phải là một số',
        'stock_quantity.required' => 'Số lượng hàng tồn kho không được bỏ trống',
        'stock_quantity.integer' => 'Số lượng hàng tồn kho phải là một số nguyên',
        'stock_quantity.min' => 'Số lượng hàng tồn kho phải lớn hơn 0',
        'promotional_price.numeric' => 'Giá khuyến mãi phải là một số',
        'promotional_price.min' => 'Giá khuyến mãi phải lớn hơn hoặc bỏng 0',
        'status.required' => 'Trạng thái sản phẩm không được bỏ trống',
        'status.in' => 'Trạng thái sản phẩm không hợp lệ',
        'sku.required' => 'Mã sản phẩm không được bỏ trống',
        'sku.string' => 'Mã sản phẩm phải là một chuỗi',
        'sku.unique' => 'Mã sản phẩm đã tồn tại',
        'thumbnail.image' => 'Hình đại diện phải là hình ảnh',
        'thumbnail.mimes' => 'Hình đại diện phải có đuôi file JPEG, PNG, JPG hoặc GIF',
        'thumbnail.max' => 'Hình đại diện phải nhỏ hơn 2MB',
        'hagtag.string' => 'Chuỗi hashtag phải là một chuỗi',
        'hagtag.max' => 'Chuỗi hashtag không được quá 255 ký tự',
        'category_ids.*' => 'Danh mục sản phẩm phải là một ID hợp lệ',
        'variants.*.color_id.exists' => 'Màu sản phẩm phải là một ID hợp lệ',
        'variants.*.size_id.exists' => 'Kích thước sản phẩm phải là một ID hợp lệ',
        'variants.*.quantity.integer' => 'Số lượng sản phẩm phải là một số nguyên',
        'variants .*.quantity.min' => 'Số lượng sản phẩm phải lớn hơn 0',
        'variants.*.image_variant.image' => 'Ảnh biểu đinh phải là hình ảnh',
        'variants.*.image_variant.mimes' => 'Ảnh biểu đinh phải có đuôi file JPEG, PNG, JPG',
        'images.*' => 'Ảnh phụ phải là hình ảnh',
        'images.*.mimes' => 'Anh phụ phải có đuôi file JPEG, PNG, JPG',
        'brand_id.exists' => 'Nhà sản xuất phải là một ID hợp lệ',

       ];
    }
}
