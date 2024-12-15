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
            'avt' => 'string',
            'bio' => 'string',
            'birth_date' => 'date|date_format:Y-m-d|after:today',
            'gender' => 'string|in:male,female,other',
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
            'name.required' => 'Tên là bắt buộc',
            'name.string' => 'Tên phải là một chuỗi',
            'email.required' => 'Email là bắt buộc',
            'email.email' => 'Email phải là một email hợp lệ',
            'email.unique' => 'Email đã tồn tại',
            'email.max' => 'Email phải ít hơn 191 ký tự',
            'phone.required' => 'Số điện thoại là bắt buộc',
            'phone.regex' => 'Số điện thoại phải là một số điện thoại hợp lệ',
            'phone.min' => 'Số điện thoại phải có ít nhất 10 ký tự',
            'phone.unique' => 'Số điện thoại đã tồn tại',
            'is_deleted.boolean' => 'Trạng thái xóa phải là boolean',
            'avt.string' => 'Avt phải là một chuỗi'
        ];
    }
}
