<?php

namespace App\Services\ServiceInterfaces\Token;

interface TokenServiceInterface
{
    public function findByTokenAndUserIdIsUsedService(string $token, int $userId);

    public function findDetailToken(string $token, int $userId);

    public function create(array $data);

    public function update(array $data, int $id);

    public function delete(int $id);
}
