<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'shipping_id' => [
                'required',
                'exists:shipping,id',
                Rule::exists('shipping', 'id')->where(function ($query) {
                    $query->where('user_id', auth()->id());
                }),
            ],
            'payment_method_id' => ['required', 'exists:payment_methods,id'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id' => [
                'integer',
                'exists:product_variants,id',
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
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
            'total.required' => 'Tổng tiền không được để trống',
            'total.numeric' => 'Tổng tiền phải là số',
            'total.min' => 'Tổng tiền không được nhỏ hơn 0',

            'shipping_id.required' => 'Vui lòng chọn địa chỉ giao hàng',
            'shipping_id.exists' => 'Địa chỉ giao hàng không tồn tại hoặc không thuộc về bạn',

            'payment_method_id.required' => 'Vui lòng chọn phương thức thanh toán',
            'payment_method_id.exists' => 'Phương thức thanh toán không tồn tại',

            'items.required' => 'Giỏ hàng không được để trống',
            'items.array' => 'Định dạng giỏ hàng không hợp lệ',
            'items.min' => 'Giỏ hàng phải có ít nhất một sản phẩm',

            'items.*.product_id.required' => 'ID sản phẩm không được để trống',
            'items.*.product_id.integer' => 'ID sản phẩm phải là số nguyên',
            'items.*.product_id.exists' => 'Sản phẩm không tồn tại',

            'items.*.variant_id.required' => 'ID biến thể không được để trống',
            'items.*.variant_id.integer' => 'ID biến thể phải là số nguyên',
            'items.*.variant_id.exists' => 'Biến thể sản phẩm không tồn tại',

            'items.*.quantity.required' => 'Số lượng không được để trống',
            'items.*.quantity.integer' => 'Số lượng phải là số nguyên',
            'items.*.quantity.min' => 'Số lượng phải lớn hơn 0',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    protected function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->validateProductVariants($validator);
        });
    }

    /**
     * Custom validation for checking product variant stock and relationship
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    protected function validateProductVariants($validator): void
    {
        if (!$this->has('items')) {
            return;
        }

        foreach ($this->items as $index => $item) {
            if (!isset($item['variant_id']) || !isset($item['quantity']) || !isset($item['product_id'])) {
                continue;
            }

            // Kiểm tra variant có thuộc về product không
            $variant = \App\Models\ProductVariant::where('id', $item['variant_id'])
                ->where('product_id', $item['product_id'])
                ->first();

            if (!$variant) {
                $validator->errors()->add(
                    "items.{$index}.variant_id",
                    "Biến thể sản phẩm không thuộc về sản phẩm đã chọn"
                );
                continue;
            }

            // Kiểm tra số lượng tồn kho
            if ($variant->quantity < $item['quantity']) {
                $validator->errors()->add(
                    "items.{$index}.quantity",
                    "Số lượng sản phẩm '{$variant->product->name}' trong kho không đủ. Hiện còn {$variant->quantity} sản phẩm."
                );
            }
        }
    }
}
