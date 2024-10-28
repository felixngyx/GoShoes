<?php

namespace App\Repositories;

use App\Models\Wishlist;
use App\Repositories\RepositoryInterfaces\WishlistRepositoryInterface;

class WishlistRepository extends BaseRepository implements WishlistRepositoryInterface
{
    public function __construct(
        Wishlist $wishlist
    )
    {
        parent::__construct($wishlist);
    }

    public function findByUserIdAndProductId(int $userId, int $productId)
    {
        return $this->model->where('user_id', $userId)->where('product_id', $productId)->first();
    }

    public function getAllByUserId(int $userId)
    {
        return $this->model->where('user_id', $userId)->get();
    }
}
