<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Tên thương hiệu là bắt buộc',
            'name.max' => 'Tên thương hiệu không được vượt quá 255 ký tự',
            'logo_url.image' => 'File phải là hình ảnh',
            'logo_url.mimes' => 'Định dạng hình ảnh phải là: jpeg, png, jpg, gif',
            'logo_url.max' => 'Kích thước hình ảnh không được vượt quá 2MB'
        ];
    }
}