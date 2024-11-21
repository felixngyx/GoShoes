<?php

namespace App\Services\Token;

use App\Repositories\RepositoryInterfaces\TokenRepositoryInterface as TokenRepository;
use App\Services\ServiceAbstracts\Token\TokenAbstract;
use App\Services\ServiceInterfaces\Token\TokenServiceInterface;

class TokenService extends TokenAbstract implements TokenServiceInterface
{
    private $tokenRepository;
    public function __construct(
        TokenRepository $tokenRepository
    )
    {
        $this->tokenRepository = $tokenRepository;
    }


    public function findByTokenAndUserIdIsUsedService(string $token, int $userId)
    {
        return $this->tokenRepository->findByTokenAndUserIdIsUsed($token, $userId);
    }

    public function findDetailToken(string $token, int $userId)
    {
        return $this->tokenRepository->findDetailToken($token, $userId);
    }

    public function create(array $data) : object
    {
        return $this->tokenRepository->create($data);
    }

    public function update(array $data, int $id) : object
    {
        return $this->tokenRepository->update($data, $id);
    }

    public function delete(int $id) : int
    {
        return $this->tokenRepository->delete($id);
    }
}
