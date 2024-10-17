<?php

namespace App\Repositories;

use App\Models\PasswordChangeHistory;
use App\Repositories\RepositoryInterfaces\PasswordChangeHistoryRepositoryInterface;

class PasswordChangeHistoryRepository extends BaseRepository implements PasswordChangeHistoryRepositoryInterface
{
    public function __construct(
        PasswordChangeHistory $model
    )
    {
        parent::__construct($model);
    }

    public function findByTokenAndUserIdIsUsed(string $token, int $userId)
    {
        return $this->model->where('token_reset', $token)->where('user_id', $userId)->where('is_used', true)->first();
    }

}
