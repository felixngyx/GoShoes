<?php

namespace App\Services\Token;

use App\Repositories\RepositoryInterfaces\TokenRepositoryInterface as TokenRepository;
use App\Services\ServiceAbstracts\Token\TokenAbstract;
use App\Services\ServiceInterfaces\Token\TokenServiceInterface;

class TokenService extends TokenAbstract implements TokenServiceInterface
{
    private static $tokenRepository;
    public function __construct()
    {
        self::setTokenRepository(app(TokenRepository::class));
    }

    /**
     * @return mixed
     */
    public static function getTokenRepository(): TokenRepository
    {
        return self::$tokenRepository;
    }

    /**
     * @param mixed $tokenRepository
     */
    public static function setTokenRepository($tokenRepository): void
    {
        self::$tokenRepository = $tokenRepository;
    }


    public function findByTokenAndUserIdIsUsedService(string $token, int $userId)
    {
        return self::getTokenRepository()->findByTokenAndUserIdIsUsed($token, $userId);
    }

    public function findDetailToken(string $token, int $userId)
    {
        return self::getTokenRepository()->findDetailToken($token, $userId);
    }

    public function create(array $data)
    {
        return self::getTokenRepository()->create($data);

    }

    public function update(array $data, int $id)
    {
        return self::getTokenRepository()->update($data, $id);
    }

    public function delete(int $id) : int
    {
        return self::getTokenRepository()->delete($id);
    }
}
