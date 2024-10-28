<?php
namespace App\Http\Controllers\API\Cart;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\StoreCartRequest;
use App\Http\Requests\Cart\UpdateCartRequest;
use App\Jobs\StoreCartJob;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Tymon\JWTAuth\Facades\JWTAuth;

class CartController extends Controller
{

    private static $cartService;

    /**
     * @return mixed
     */
    public static function getCartService()
    {
        return self::$cartService;
    }

    /**
     * @param mixed $cartService
     */
    public static function setCartService($cartService): void
    {
        self::$cartService = $cartService;
    }

    public function __construct(
        Cart $cart
    )
    {
        self::setCartService($cart);
    }

    public function index()
    {
        return self::getCartService()->getAllByUserId();
    }

    public function store(StoreCartRequest $request)
    {
        return self::getCartService()->createOrUpdate($request->all());
    }

    public function destroy(Request $request)
    {
        return self::getCartService()->delete($request->all());
    }

    public function update(UpdateCartRequest $request)
    {
        return self::getCartService()->createOrUpdate($request->all());
    }
}
