<?php

namespace App\Services\ServiceInterfaces\Product;

interface ProductServiceInterface
{
    public function listProduct(array $request) : \Illuminate\Http\JsonResponse;
}
