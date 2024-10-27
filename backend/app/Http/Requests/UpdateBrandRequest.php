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
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Tên thương hiệu là bắt buộc',
            'name.max' => 'Tên thương hiệu không được vượt quá 255 ký tự',
        ];
    }
}