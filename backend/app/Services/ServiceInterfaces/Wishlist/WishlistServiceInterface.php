<?php

namespace App\Services\ServiceInterfaces\Wishlist;

Interface WishlistServiceInterface
{
    public function all();

    public function getAllByUserId();

    public function createOrUpdate(array $request);

    public function delete(array $request);

}
