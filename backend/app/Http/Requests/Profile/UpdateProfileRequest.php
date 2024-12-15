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
            'name' => 'nullable|string|max:191',
            'bio' => 'nullable|string|max:191',
            'birth_date' => 'nullable|date|date_format:Y-m-d|before:today',
            'gender' => 'nullable|string|in:male,female,other',
            'avt' => 'nullable|string'
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
            'name.string' => 'Tên phải là một chuỗi',
            'name.max' => 'Tên phải ít hơn 191 ký tự',
            'bio.string' => 'Tiểu sử phải là một chuỗi',
            'bio.max' => 'Tiểu sử phải ít hơn 191 ký tự',
            'birth_date.date' => 'Ngày sinh phải là một ngày',
            'birth_date.date_format' => 'Ngày sinh phải theo định dạng Y-m-d',
            'birth_date.before' => 'Ngày sinh phải trước ngày hôm nay',
            'gender.string' => 'Giới tính phải là một chuỗi',
            'gender.in' => 'Giới tính phải là "Nam", "Nữ", "Khác"',
            'avt.string' => 'Avt phải là một chuỗi'
        ];
    }
}
