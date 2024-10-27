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
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:1',
            'promotional_price' => 'nullable|numeric|min:0|lte:price', // Giá khuyến mãi không được lớn hơn giá gốc
            'status' => 'required|in:public,unpublic,hidden',
            'sku' => 'required|string|unique:products,sku',
            'thumbnail' => 'required|string|max:255', // Chỉ cần kiểm tra kiểu dữ liệu string
            'hagtag' => 'nullable|string|max:255',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'variants' => 'required|array',
            'variants.*.color' => 'required|string|max:255',
            'variants.*.link_image' => 'required|string|max:255', // Chỉ cần kiểm tra kiểu dữ liệu string
            'variants.*.size_id' => 'required|exists:variant_sizes,id',
            'variants.*.quantity' => 'required|integer|min:1',
            'variants.*.image_variant' => 'required|string|max:255', // Chỉ cần kiểm tra kiểu dữ liệu string
            'images' => 'sometimes|array',
            'images.*' => 'required|string|max:255', // Chỉ cần kiểm tra kiểu dữ liệu string
            'brand_id' => 'required|exists:brands,id',
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
            'price.min' => 'Giá sản phẩm phải lớn hơn hoặc bằng 0',
            'stock_quantity.required' => 'Số lượng hàng tồn kho không được bỏ trống',
            'stock_quantity.integer' => 'Số lượng hàng tồn kho phải là một số nguyên',
            'stock_quantity.min' => 'Số lượng hàng tồn kho phải lớn hơn 0',
            'promotional_price.numeric' => 'Giá khuyến mãi phải là một số',
            'promotional_price.min' => 'Giá khuyến mãi phải lớn hơn hoặc bằng 0',
            'promotional_price.lte' => 'Giá khuyến mãi phải nhỏ hơn hoặc bằng giá sản phẩm',
            'status.required' => 'Trạng thái sản phẩm không được bỏ trống',
            'status.in' => 'Trạng thái sản phẩm không hợp lệ',
            'sku.required' => 'Mã sản phẩm không được bỏ trống',
            'sku.string' => 'Mã sản phẩm phải là một chuỗi',
            'sku.unique' => 'Mã sản phẩm đã tồn tại',
            'thumbnail.required' => 'Hình đại diện không được bỏ trống',
            'thumbnail.string' => 'Hình đại diện phải là một chuỗi',
            'thumbnail.max' => 'Hình đại diện không được quá 255 ký tự',
            'hagtag.string' => 'Chuỗi hashtag phải là một chuỗi',
            'hagtag.max' => 'Chuỗi hashtag không được quá 255 ký tự',
            'category_ids.required' => 'Danh mục sản phẩm không được bỏ trống',
            'category_ids.array' => 'Danh mục sản phẩm phải là một mảng',
            'category_ids.*.exists' => 'Danh mục đã chọn không hợp lệ',
            'variants.required' => 'Biến thể sản phẩm không được bỏ trống',
            'variants.*.color.required' => 'Màu sản phẩm không được bỏ trống',
            'variants.*.color.string' => 'Màu sản phẩm phải là một chuỗi',
            'variants.*.size_id.required' => 'Kích thước sản phẩm không được bỏ trống',
            'variants.*.size_id.exists' => 'Kích thước sản phẩm phải là một ID hợp lệ',
            'variants.*.quantity.required' => 'Số lượng sản phẩm không được bỏ trống',
            'variants.*.quantity.integer' => 'Số lượng sản phẩm phải là một số nguyên',
            'variants.*.quantity.min' => 'Số lượng sản phẩm phải lớn hơn 0',
            'variants.*.image_variant.required' => 'Ảnh biến thể không được bỏ trống',
            'variants.*.image_variant.string' => 'Ảnh biến thể phải là một chuỗi',
            'variants.*.image_variant.max' => 'Ảnh biến thể không được quá 255 ký tự',
            'images.array' => 'Ảnh phụ phải là một mảng',
            'images.*.required' => 'Ảnh phụ không được bỏ trống',
            'images.*.string' => 'Ảnh phụ phải là một chuỗi',
            'images.*.max' => 'Ảnh phụ không được quá 255 ký tự',
            'brand_id.required' => 'Nhà sản xuất không được bỏ trống',
            'brand_id.exists' => 'Nhà sản xuất phải là một ID hợp lệ',
        ];
    }
}
