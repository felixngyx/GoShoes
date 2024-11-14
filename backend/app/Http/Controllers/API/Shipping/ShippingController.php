<?php

namespace App\Http\Controllers\API\Shipping;
use App\Http\Requests\Shipping\StoreShippingRequest;
use App\Http\Requests\Shipping\UpdateShippingRequest;
use App\Services\ServiceInterfaces\Shipping\ShippingServiceInterface as ShippingService;

class ShippingController
{

    private static $shippingService;

    public function __construct()
    {
        self::setShippingService(app(ShippingService::class));
    }

    /**
     * @return mixed
     */
    public static function getShippingService(): ShippingService
    {
        return self::$shippingService;
    }

    /**
     * @param mixed $shippingService
     */
    public static function setShippingService($shippingService): void
    {
        self::$shippingService = $shippingService;
    }

    public function index(): \Illuminate\Http\JsonResponse
    {
        return self::getShippingService()->getListShippingUser();
    }

    public function store(StoreShippingRequest $request): \Illuminate\Http\JsonResponse
    {
        return self::getShippingService()->create($request->all());
    }

    public function update(UpdateShippingRequest $request, int $shipping): \Illuminate\Http\JsonResponse
    {
        $request['shipping'] = $shipping;
        return self::getShippingService()->update($request->all());
    }

    public function destroy(int $shipping): \Illuminate\Http\JsonResponse
    {
        return self::getShippingService()->delete($shipping);
    }

}
