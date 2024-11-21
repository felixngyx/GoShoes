<?php

namespace App\Services\Token;

use App\Repositories\RepositoryInterfaces\TokenRepositoryInterface as TokenRepository;
use App\Services\ServiceAbstracts\Token\TokenAbstract;
use App\Services\ServiceInterfaces\Token\TokenServiceInterface;
use Illuminate\Support\Facades\DB;

class TokenService extends TokenAbstract implements TokenServiceInterface
{
    private PasswordChangeHistoryRepository $passwordChangeHistoryRepository;
    public function __construct(
        TokenRepository $tokenRepository
    )
    {
        $this->tokenRepository = $tokenRepository;
    }


    public function findByTokenAndUserIdIsUsedService($token, $userId)
    {
        return DB::table('token')
            ->where('token', $token)
            ->where('user_id', $userId)
            ->where('is_used', 0)
            ->first();
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

    public function delete(int $id)
    {
        return self::getTokenRepository()->delete($id);
    }

}
