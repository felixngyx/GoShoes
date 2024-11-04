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

    public function findByUserIdAndProductVariantId(int $userId, int $productVariantId)
    {
        return $this->model->where('user_id', $userId)->where('product_variant_id', $productVariantId)->first();
    }

    public function getAllByUserId(int $userId)
    {
        return $this->model->where('user_id','=', $userId)->with('product_variant.product', 'product_variant.color', 'product_variant.size')->get();
    }

}
