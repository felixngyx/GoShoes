<?php

namespace App\Repositories;

use App\Models\Discount;
use Illuminate\Support\Facades\DB;

class DiscountRepository
{
    protected $model;

    public function __construct(Discount $discount)
    {
        $this->model = $discount;
    }

    public function getAll($perPage = 10, $status = null)
    {
        return $this->model->with('products')
            ->when($status === 'active', function($q) {
                return $q->where('valid_from', '<=', now())
                        ->where('valid_to', '>=', now())
                        ->where('usage_limit', '>', DB::raw('used_count'));
            })
            ->when($status === 'expired', function($q) {
                return $q->where('valid_to', '<', now())
                        ->orWhere('usage_limit', '<=', DB::raw('used_count'));
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function findById($id)
    {
        return $this->model->with('products')->findOrFail($id);
    }

    public function findByCode($code)
    {
        return $this->model->where('code', $code)->with('products')->first();
    }

    public function create(array $data)
    {
        $discount = $this->model->create($data);

        if (isset($data['product_ids'])) {
            $discount->products()->attach($data['product_ids']);
        }

        return $discount->fresh('products');
    }

    public function update($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $discount = $this->findById($id);
            $discount->update($data);

            if (isset($data['product_ids'])) {
                $discount->products()->sync($data['product_ids']);
            }

            return $discount->load('products');
        });
    }

    public function delete($id)
    {
        return DB::transaction(function () use ($id) {
            $discount = $this->findById($id);
            $discount->products()->detach();
            return $discount->delete();
        });
    }

    public function getRandomDiscount(){
        $rand = $this->model->where('percent', '<', 30)->inRandomOrder()->take(3)->with('products')->get();
        return $rand;
    }
}
