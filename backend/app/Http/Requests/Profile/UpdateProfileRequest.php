<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
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
            'bio' => 'string|max:191',
            'birth_date' => 'date|date_format:Y-m-d|before:today',
            'gender' => 'string|in:male,female,other',
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
            'name.string' => 'Name must be a string',
            'name.max' => 'Name must be less than 191 characters',
            'bio.string' => 'Bio must be a string',
            'bio.max' => 'Bio must be less than 191 characters',
            'birth_date.date' => 'Birth date must be a date',
            'birth_date.date_format' => 'Birth date must be in the format Y-m-d',
            'birth_date.before' => 'Birth date must be before today',
            'gender.string' => 'Gender must be a string',
            'gender.in' => 'Gender must be in "Male", "Female", "Other"',
            'avt.string' => 'Avt must be a string'
        ];
    }
}
