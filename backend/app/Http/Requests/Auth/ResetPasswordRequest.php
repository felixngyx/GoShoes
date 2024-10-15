<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
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
            'password' => 'required|string|min:6|regex:/[A-Z]/|regex:/[@$!%*?&#]/',
            'password_confirmation' => 'required|string|min:6|regex:/[A-Z]/|regex:/[@$!%*?&#]/|same:password'
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'Token is required',
            'token.string' => 'Token must be a string',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 6 characters',
            'password.regex' => 'Password must contain at least one uppercase letter and one special character',
            'password_confirmation.required' => 'Password confirmation is required',
            'password_confirmation.same' => 'Password confirmation must match password'
        ];
    }
}
