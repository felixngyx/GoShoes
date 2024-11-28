<?php

namespace App\Http\Controllers\API\ProductVariant;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductVariant\ProductVariantDeleteMany;
use App\Http\Requests\ProductVariant\ProductVariantDeleteOne;
use App\Services\ProductVariant\ProductVariantService;
use http\Env\Request;

class ProductVariantController extends Controller
{

    private static $productVariantService;

    public function __construct()
    {
        self::setProductVariantService();
    }

    /**
     * @return mixed
     */
    public static function getProductVariantService() : ProductVariantService
    {
        return self::$productVariantService;
    }

    /**
     * @param mixed $productVariantService
     */
    public static function setProductVariantService(): void
    {
        self::$productVariantService = app(ProductVariantService::class);
    }

    public function deleteMany(ProductVariantDeleteMany $request)
    {
        return self::getProductVariantService()->forceDeleteMany($request->all());
    }

    public function deleteOne(int $id)
    {
        return self::getProductVariantService()->deleteService($id);
    }
}
