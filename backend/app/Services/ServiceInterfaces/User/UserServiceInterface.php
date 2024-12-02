<?php

namespace App\Services\ServiceInterfaces\User;

Interface UserServiceInterface
{
    public function all(array $request) : \Illuminate\Http\JsonResponse;

    public function create(array $request);

    public function update(array $data, int $id);

    public function delete(int $id);

    public function findById(int $id);

    public function findByEmail(string $email);

    public function updateService(array $request, int $id) : \Illuminate\Http\JsonResponse;

    public function deleteService(int $id) : \Illuminate\Http\JsonResponse;

}
