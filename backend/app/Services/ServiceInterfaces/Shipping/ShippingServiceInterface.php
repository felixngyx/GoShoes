<?php
namespace App\Services\ServiceInterfaces\Shipping;

interface ShippingServiceInterface
{
    public function getListShippingUser() : \Illuminate\Http\JsonResponse;
    public function create(array $request) : \Illuminate\Http\JsonResponse;
};
