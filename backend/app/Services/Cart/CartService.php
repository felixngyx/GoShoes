<?php

namespace App\Services\Cart;

use App\Repositories\RepositoryInterfaces\CartRepositoryInterface as CartRepository;
use App\Services\ServiceInterfaces\Cart\CartServiceInterface;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

class CartService implements CartServiceInterface
{
    private static $cartRepository;

    public function __construct()
    {
        self::setCartRepository(app(CartRepository::class));
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

    public function getAllByUserId()
    {
        $user = JWTAuth::parseToken()->authenticate();
        $result = self::getCartRepository()->getAllByUserId($user->id);
        return json_decode($result[0]->result, true);
    }

    public function createOrUpdate(array $request)
    {
        DB::BeginTransaction();
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $data = [
                'user_id' => $user->id,
                'product_variant_id' => $request['product_variant_id'],
                'quantity' => $request['quantity']
            ];
            $quantity = (function () use ($data, $request) {
                if ($request['type'] === 'create') {
                    return DB::raw('quantity + ' . $data['quantity']);
                }
                if ($request['type'] === 'update') {
                    return $request['quantity'];
                }
            })();

            self::getCartRepository()->upsert(
                [
                    'quantity' => $quantity,
                    'user_id' => $data['user_id'],
                    'product_variant_id' => $data['product_variant_id']
                ],
                ['user_id' => $data['user_id'], 'product_variant_id' => $data['product_variant_id']]
            );

            // Fetch the updated record
            $updatedCart = self::getCartRepository()->findByUserIdAndProductVariantId($data['user_id'], $data['product_variant_id']);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => "Cart {$request['type']}d successfully",
                'data' => $updatedCart->makeHidden(self::columnHiddens())
            ]);
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
            $cart = self::getCartRepository()->findByUserIdAndProductVariantId($user->id, $request['product_variant_id']);
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

    private static function columnHiddens() : array
    {
        return ['id', 'user_id', 'created_at', 'updated_at', 'product_id', 'product_variant_id', 'product_variant.created_at', 'product_variant.updated_at'];
    }
}
