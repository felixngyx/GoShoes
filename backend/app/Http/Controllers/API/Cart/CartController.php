<?php
namespace App\Http\Controllers\API\Cart;

use App\Http\Controllers\Controller;
use App\Jobs\StoreCartJob;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Tymon\JWTAuth\Facades\JWTAuth;

class CartController extends Controller
{
    public function cacheCartTable()
    {
        // Fetch all records from the cart table
        $carts = Cart::all()->toArray();

        // Store the fetched data in Redis with the key 'cart_table'
        Redis::set('cart_table', json_encode($carts));

        return Redis::get('cart_table');
    }

    public function getCachedCartTable()
    {
        // Retrieve the data from Redis
        $cachedCarts = (json_decode(Redis::get('cart_table'), true)) ?? $this->cacheCartTable() ;

        return response()->json($cachedCarts);
    }

    public function index()
    {
        $cachedCarts = $this->getCachedCartTable();
        return response()->json($cachedCarts);
    }

    public function store(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();
        $data = [
            'user_id' => $user->id,
            'product_id' => $request['product_id'],
            'quantity' => $request['quantity']
        ];

        Log::info('Storing cart data in Redis', ['data' => $data]);

        // Update Redis cache
        $cachedCarts = json_decode(Redis::get('cart_table'), true);
        $cachedCarts[] = $data;
        Redis::set('cart_table', json_encode($cachedCarts));

        // Dispatch job to store data in DB
        StoreCartJob::dispatch($data);

        return response()->json(['message' => 'Cart stored in Redis and queued for DB']);
    }

    public function show($userId, $productId)
    {
        $cachedCarts = json_decode(Redis::get('cart_table'), true);
        $cart = array_filter($cachedCarts, function ($item) use ($userId, $productId) {
            return $item['user_id'] == $userId && $item['product_id'] == $productId;
        });

        return response()->json(array_values($cart));
    }

    public function update(Request $request, $userId, $productId)
    {
        $data = $request->all();
        $cachedCarts = json_decode(Redis::get('cart_table'), true);

        foreach ($cachedCarts as &$cart) {
            if ($cart['user_id'] == $userId && $cart['product_id'] == $productId) {
                $cart = array_merge($cart, $data);
                break;
            }
        }

        Redis::set('cart_table', json_encode($cachedCarts));
        StoreCartJob::dispatch($data);

        return response()->json(['message' => 'Cart updated in Redis and queued for DB']);
    }

    public function destroy($userId, $productId)
    {
        $cachedCarts = json_decode(Redis::get('cart_table'), true);
        $cachedCarts = array_filter($cachedCarts, function ($item) use ($userId, $productId) {
            return !($item['user_id'] == $userId && $item['product_id'] == $productId);
        });

        Redis::set('cart_table', json_encode(array_values($cachedCarts)));

        return response()->json(['message' => 'Cart removed from Redis']);
    }
}
