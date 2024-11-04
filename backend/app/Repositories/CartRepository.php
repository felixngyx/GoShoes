<?php

namespace App\Repositories;

use App\Models\Cart;
use App\Repositories\RepositoryInterfaces\CartRepositoryInterface;

class CartRepository extends BaseRepository implements CartRepositoryInterface
{
    public function __construct(
        Cart $cart
    )
    {
        parent::__construct($cart);
    }

    public function findByUserIdAndProductId(int $userId, int $productId)
    {
        return $this->model->where('user_id', $userId)->where('product_id', $productId)->first();
    }

    public function getAllByUserId(int $userId)
    {
        return $this->model->with('productvariant')->where('user_id', $userId)->get();
    }

}
