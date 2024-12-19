<?php

namespace App\Http\Requests\Shipping;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShippingRequest extends FormRequest
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
            "name" => "required|string|max:50",
            "phone_number" => "required|string|regex:/^([0-9\s\-\+\(\)]*)$/|min:10",
            "address" => "required|string",
            "address_detail" => "required|string",
            "is_default" => "nullable|boolean",
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
            "address.required" => "Địa chỉ là bắt buộc",
            "address_detail.required" => "Chi tiết địa chỉ là bắt buộc",
            "phone_number.required" => "Số điện thoại là bắt buộc",
            "is_default.required" => "Trạng thái mặc định là bắt buộc",
            "address.string" => "Địa chỉ phải là chuỗi ký tự",
            "address_detail.string" => "Chi tiết địa chỉ phải là chuỗi ký tự",
            "phone_number.string" => "Số điện thoại phải là chuỗi ký tự",
            "is_default.boolean" => "Trạng thái mặc định phải là kiểu boolean",
        ];
    }
}
