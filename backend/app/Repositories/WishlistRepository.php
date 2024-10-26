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
}
