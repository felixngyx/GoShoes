<?php

namespace App\Services\Wishlist;

use App\Repositories\RepositoryInterfaces\WishlistRepositoryInterface as WishlistRepository;
use App\Services\ServiceInterfaces\Wishlist\WishlistServiceInterface;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

class WishlistService implements WishlistServiceInterface
{
    private static $wishListRepository;


    public function __construct(
        WishlistRepository $wishListRepository,
    )
    {
        self::setWishListRepository($wishListRepository);
    }

    /**
     * @return mixed
     */
    public static function getWishListRepository() : WishlistRepository
    {
        return self::$wishListRepository;
    }

    /**
     * @param mixed $wishListRepository
     */
    public static function setWishListRepository($wishListRepository): void
    {
        self::$wishListRepository = $wishListRepository;
    }

    public function all()
    {
        return self::$wishListRepository->all();
    }

    public function getAllByUserId() : \Illuminate\Http\JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();
        $data = self::getWishListRepository()->getAllByUserId($user->id);
        return response()->json([
            'success' => true,
            'data' => [
                'product_id' => $data->product_id
            ],
        ]);
    }

    public function createOrUpdate(array $request) : \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $data = [
                'user_id' => $user->id,
                'product_id' => $request['product_id'],
            ];
            self::getWishListRepository()->createOrUpdate($data);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Wishlist created successfully',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getCode());
        }
    }

    public function delete(array $request) : \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try {
            $wishList = self::$wishListRepository->findByUserIdAndProductId($request['user_id'], $request['product_id']);
            if (!$wishList) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wishlist not found',
                ], 404);
            }
            self::getWishListRepository()->delete($wishList->id);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Wishlist deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getCode());
        }
    }
}
