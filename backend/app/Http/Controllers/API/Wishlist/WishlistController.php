<?php

namespace App\Http\Controllers\API\Wishlist;

use App\Http\Controllers\Controller;
use App\Jobs\StoreWishlistJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class WishlistController extends Controller
{
    public function index($userId)
    {
        $wishlists = Redis::hgetall("wishlist:user:$userId");
        return response()->json([
            'success' => true,
            'data' => $wishlists
        ]);
    }

    public function store(Request $request)
    {
        $wishlistData = $request->all();
        $wishlistId = Redis::incr("wishlist:id");
        Redis::hmset("wishlist:user:{$wishlistData['user_id']}:$wishlistId", $wishlistData);
        StoreWishlistJob::dispatch($wishlistData);
        return response()->json(['message' => 'Wishlist stored in Redis and queued for DB']);
    }

    public function show($userId, $id)
    {
        $wishlist = Redis::hgetall("wishlist:user:$userId:$id");
        return response()->json($wishlist);
    }

    public function update(Request $request, $userId, $id)
    {
        $wishlistData = $request->all();
        Redis::hmset("wishlist:user:$userId:$id", $wishlistData);
        StoreWishlistJob::dispatch($wishlistData);
        return response()->json(['message' => 'Wishlist updated in Redis and queued for DB']);
    }

    public function destroy($userId, $id)
    {
        Redis::del("wishlist:user:$userId:$id");
        return response()->json(['message' => 'Wishlist removed from Redis']);
    }
}
