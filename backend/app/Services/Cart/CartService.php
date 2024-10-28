<?php

namespace App\Services\Cart;

use App\Repositories\RepositoryInterfaces\CartRepositoryInterface as CartRepository;
use App\Services\ServiceInterfaces\Cart\CartServiceInterface;
use http\QueryString;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

class CartService implements CartServiceInterface
{
    private static $cartRepository;

    public function __construct(
    )
    {
        self::setCartRepository(CartRepository::class);
    }

    /**
     * @return mixed
     */
    public static function getCartRepository() : CartRepository
    {
        return self::$cartRepository;
    }

    /**
     * @param mixed $cartRepository
     */
    public static function setCartRepository(
        CartRepository $cartRepository
    ): void
    {
        self::$cartRepository = $cartRepository;
    }

    public function all()
    {
        return self::getCartRepository()->all();
    }

    public function createOrUpdate(array $request)
    {
        DB::BeginTransaction();
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $data = [
                'user_id' => $user->id,
                'product_id' => $request['product_id'],
                'quantity' => $request['quantity']
            ];
            $quantity = (function () use ($data, $request){
                if ($request['type'] === 'create') {
                    return DB::raw('quantity + ' . $data['quantity']);
                }
                if ($request['type'] === 'update') {
                    return $request['quantity'];
                }
            });
            self::getCartRepository()->upsert(
                ['quantity' => $quantity],
                ['user_id' => $data['user_id'], 'product_id' => $data['product_id']]
            );
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Cart created successfully',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e->getMessage();
        }
    }

    public function delete(array $request)
    {
        DB::BeginTransaction();
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $cart = self::getCartRepository()->findByUserIdAndProductId($user->id, $request['product_id']);
            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'No record found',
                ], 404);
            }

            self::getCartRepository()->delete($cart->id);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Cart deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e->getMessage();
        }
    }

    private static function columns() : array
    {
        return ['product_id'];
    }
}
