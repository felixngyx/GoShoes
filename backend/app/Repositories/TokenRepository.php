<?php

namespace App\Repositories;

use App\Models\Token;
use App\Repositories\RepositoryInterfaces\TokenRepositoryInterface;

class TokenRepository extends BaseRepository implements TokenRepositoryInterface
{
    public function __construct(
        Token $model
    )
    {
        parent::__construct($model);
    }

    public function findByTokenAndUserIdIsUsed(string $token, int $userId)
    {
        return $this->model->where('token_reset', $token)->where('user_id', $userId)->where('is_used', true)->first();
    }

}
