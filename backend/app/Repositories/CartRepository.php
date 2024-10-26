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


}
