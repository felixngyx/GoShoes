<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class VerifyChangeEmailRequest extends FormRequest
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
            'token' => 'required|string',
            'email' => 'required|string|email|max:191|unique:users,email'
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
            'token.required' => 'Token là bắt buộc',
            'token.string' => 'Token phải là một chuỗi',
            'email.required' => 'Email là bắt buộc',
            'email.string' => 'Email phải là một chuỗi',
            'email.email' => 'Email phải là một email hợp lệ',
            'email.max' => 'Email phải ít hơn 191 ký tự',
            'email.unique' => 'Email đã được sử dụng'
        ];
    }
}
