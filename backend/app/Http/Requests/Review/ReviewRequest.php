<?php 

namespace App\Http\Requests\Review;

use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|numeric|between:1,5',
            'comment' => 'nullable|string|max:1000'
        ];
    }
}