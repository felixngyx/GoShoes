<?php
namespace App\Services\ServiceInterfaces\Shipping;

interface ShippingServiceInterface
{
    public function getListShippingUser() : \Illuminate\Http\JsonResponse;

    public function getShippingById(int $id) : \Illuminate\Http\JsonResponse;

    public function create(array $request) : \Illuminate\Http\JsonResponse;

    public function update(array $request) : \Illuminate\Http\JsonResponse;

    public function delete(int $id) : \Illuminate\Http\JsonResponse;

};
