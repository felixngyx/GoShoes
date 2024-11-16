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
            "address.required" => "Address is required",
            "address_detail.required" => "Address detail is required",
            "phone_number.required" => "Phone number is required",
            "is_default.required" => "Is default is required",
            "address.string" => "Address must be a string",
            "address_detail.string" => "Address detail must be a string",
            "phone_number.string" => "Phone number must be a string",
            "is_default.boolean" => "Is default must be a boolean",
        ];
    }
}
