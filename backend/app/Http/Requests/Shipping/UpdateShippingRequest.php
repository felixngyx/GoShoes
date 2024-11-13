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
            "address" => "string",
            "city" => "string",
            "postal_code" => "string",
            "country" => "string",
            "phone_number" => "string|regex:/^([0-9\s\-\+\(\)]*)$/|min:10",
            "is_default" => "boolean",
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
            "address.string" => "Address must be a string",
            "city.string" => "City must be a string",
            "postal_code.string" => "Postal code must be a string",
            "country.string" => "Country must be a string",
            "phone_number.string" => "Phone number must be a string",
            "is_default.boolean" => "Is default must be a boolean",
        ];
    }
}
