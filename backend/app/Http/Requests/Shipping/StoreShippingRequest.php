<?php

namespace App\Http\Requests\Shipping;

use Illuminate\Foundation\Http\FormRequest;

class StoreShippingRequest extends FormRequest
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
            "address" => "required|string",
            "city" => "required|string",
            "postal_code" => "required|string",
            "country" => "required|string",
            "phone_number" => "required|string|regex:/^([0-9\s\-\+\(\)]*)$/|min:10",
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
            "city.required" => "City is required",
            "postal_code.required" => "Postal code is required",
            "country.required" => "Country is required",
            "phone_number.required" => "Phone number is required",
            "is_default.required" => "Is default is required",
            "address.string" => "Address must be a string",
            "city.string" => "City must be a string",
            "postal_code.string" => "Postal code must be a string",
            "country.string" => "Country must be a string",
            "phone_number.string" => "Phone number must be a string",
            "is_default.boolean" => "Is default must be a boolean",
        ];
    }
}
