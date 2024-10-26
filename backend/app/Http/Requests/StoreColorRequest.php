<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class StoreColorRequest extends FormRequest
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
            'color' => 'required|string|max:255|unique:variant_colors,color',
            // 'hex_code' => 'required|string|max:20|regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'
            'hex_code' => 'required|string|max:20',
        ];
        Log::info('Validation rules executed successfully');
    }
}
