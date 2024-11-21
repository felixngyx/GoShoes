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
            'name' => 'required|string|max:255|unique:products,name', // Thêm unique
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:1',
            'promotional_price' => 'nullable|numeric|min:0|lte:price',
            'status' => 'required|in:public,unpublic,hidden',
            'sku' => 'required|string|unique:products,sku',
            'thumbnail' => 'required|string|max:255',
            'hagtag' => 'nullable|string|max:255',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'variants' => 'nullable|array', // Thay đổi thành nullable
            'variants.*.color_id' => 'required_with:variants|exists:variant_colors,id',
            'variants.*.link_image' => 'required_with:variants|string|max:255',
            'variants.*.size_id' => 'required_with:variants|exists:variant_sizes,id',
            'variants.*.quantity' => 'required_with:variants|integer|min:1',
            // 'variants.*.image_variant' => 'required_with:variants|string|max:255',
            'images' => 'sometimes|array',
            'images.*' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Tên sản phẩm không được bỏ trống',
            'name.unique' => 'Tên sản phẩm đã tồn tại',

            'name.string' => 'Tên sản phẩm phải là một chuỗi',
            'name.max' => 'Tên sản phẩm không được quá 255 ký tự',
            'description.required' => 'Mô tả sản phẩm không được bỏ trống',
            'description.string' => 'Mô tả sản phẩm phải là một chuỗi',
            'price.required' => 'Giá sản phẩm không được bỏ trống',
            'price.numeric' => 'Giá sản phẩm phải là một số',
            'price.min' => 'Giá sản phẩm phải lớn hơn hoặc bằng 0',
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
            'hagtag.string' => 'Chuỗi hagtag phải là một chuỗi',
            'hagtag.max' => 'Chuỗi hagtag không được quá 255 ký tự',
            'stock_quantity.required' => 'Số lượng hàng tồn kho không được bỏ trống',
            'stock_quantity.integer' => 'Số lượng hàng tồn kho phải là một số nguyên',
            'stock_quantity.min' => 'Số lượng hàng tồn kho phải lớn hơn 0',
            'category_ids.required' => 'Danh mục sản phẩm không được bỏ trống',
            'category_ids.array' => 'Danh mục sản phẩm phải là một mảng',
            'category_ids.*.exists' => 'Danh mục đã chọn không hợp lệ',
            'variants.array' => 'Biến thể sản phẩm phải là một mảng',
            
            'variants.*.color_id.required_with' => 'Màu sắc sản phẩm không được bỏ trống khi có biến thể',
            'variants.*.color_id.exists' => 'Màu sắc sản phẩm phải là một không ID  hợp lệ',

            'variants.*.size_id.required_with' => 'Kích thước sản phẩm không được bỏ trống khi có biến thể',
            'variants.*.size_id.exists' => 'Kích thước sản phẩm phải là một không ID hợp lệ',

            'variants.*.quantity.required_with' => 'Số lượng sản phẩm không được bỏ trống khi có biến thể',
            'variants.*.quantity.integer' => 'Số lượng sản phẩm phải là một số nguyên',
            'variants.*.quantity.min' => 'Số lượng sản phẩm phải lớn hơn 0',
            // 'variants.*.image_variant.required_with' => 'Ảnh biến thể không được bỏ trống khi có biến thể',
            // 'variants.*.image_variant.string' => 'Ảnh biến thể phải là một chuỗi',
            // 'variants.*.image_variant.max' => 'Ảnh biến thể không được quá 255 ký tự',
            'images.array' => 'Ảnh phụ phải là một mảng',
            'images.*.required' => 'Ảnh phụ không được bỏ trống',
            'images.*.string' => 'Ảnh phụ phải là một chuỗi',
            'images.*.max' => 'Ảnh phụ không được quá 255 ký tự',
            'brand_id.required' => 'Nhà sản xuất không được bỏ trống',
            'brand_id.exists' => 'Nhà sản xuất phải là một ID hợp lệ',
        ];
    }
}
