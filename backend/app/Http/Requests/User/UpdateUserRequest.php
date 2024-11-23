<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
            'name' => 'string|max:191',
            'email' => 'email|unique:users,email,'.$this->id.'|max:191',
            'phone' => 'regex:/^([0-9\s\-\+\(\)]*)$/|min:10|unique:users,phone,'.$this->id,
            'is_deleted' => 'boolean',
            'avt' => 'string'
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
            'name.required' => 'Name is required',
            'name.string' => 'Name must be a string',
            'email.required' => 'Email is required',
            'email.email' => 'Email must be a valid email',
            'email.unique' => 'Email already exists',
            'email.max' => 'Email must be less than 191 characters',
            'phone.required' => 'Phone is required',
            'phone.regex' => 'Phone must be a valid phone number',
            'phone.min' => 'Phone must be at least 10 characters',
            'phone.unique' => 'Phone already exists',
            'is_deleted.boolean' => 'Is deleted must be a boolean',
            'avt.string' => 'Avt must be a string'
        ];
    }
}
