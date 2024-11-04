<?php
namespace App\Http\Controllers\API\Cart;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\DeleteCartRequest;
use App\Http\Requests\Cart\StoreCartRequest;
use App\Http\Requests\Cart\UpdateCartRequest;
use App\Services\ServiceInterfaces\Cart\CartServiceInterface as CartService;
class CartController extends Controller
{

    private static $cartService;

    public function __construct(
    )
    {
        self::setCartService(app(CartService::class));
    }

    /**
     * @return mixed
     */
    public static function getCartService(): CartService
    {
        return self::$cartService;
    }

    /**
     * @param mixed $cartService
     */
    public static function setCartService(
        CartService $cartService
    ): void
    {
        self::$cartService = $cartService;
    }

    public function index()
    {
        return self::getCartService()->getAllByUserId();
    }

    public function store(StoreCartRequest $request)
    {
        return self::getCartService()->createOrUpdate($request->all());
    }

    public function destroy(DeleteCartRequest $request)
    {
        return self::getCartService()->delete($request->all());
    }

    public function update(UpdateCartRequest $request)
    {
        return self::getCartService()->createOrUpdate($request->all());
    }
}
