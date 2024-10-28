<?php

namespace App\Http\Controllers\API\Wishlist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Wishlist\DeleteWishlistRequest;
use App\Http\Requests\Wishlist\StoreWishlistRequest;
use App\Http\Requests\Wishlist\UpdateWishlistRequest;
use App\Services\ServiceInterfaces\Wishlist\WishlistServiceInterface as WishlistService;

class WishlistController extends Controller
{

    private static $wishlistService;

    public function __construct(
        WishlistService $wishlistService
    )
    {
        self::setWishlistService($wishlistService);
    }

    /**
     * @return mixed
     */

    public static function getWishlistService() : WishlistService
    {
        return self::$wishlistService;
    }

    /**
     * @param mixed $wishlistService
     */

    public static function setWishlistService($wishlistService): void
    {
        self::$wishlistService = $wishlistService;
    }

    public function index()
    {
        return self::getWishlistService()->getAllByUserId();
    }

    public function store(StoreWishlistRequest $request)
    {
        return self::getWishlistService()->createOrUpdate($request->all());
    }

    public function destroy(DeleteWishlistRequest $request)
    {
        return self::getWishlistService()->delete($request->all());
    }
}
