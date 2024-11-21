<?php

namespace App\Services\Token;

use App\Repositories\RepositoryInterfaces\TokenRepositoryInterface as PasswordChangeHistoryRepository;
use App\Services\ServiceAbstracts\Token\TokenAbstract;
use App\Services\ServiceInterfaces\Token\TokenServiceInterface;
use Illuminate\Support\Facades\DB;

class TokenService extends TokenAbstract implements TokenServiceInterface
{
    private PasswordChangeHistoryRepository $passwordChangeHistoryRepository;
    public function __construct(
        PasswordChangeHistoryRepository $passwordChangeHistoryRepository
    )
    {
        $this->passwordChangeHistoryRepository = $passwordChangeHistoryRepository;
    }


    public function findByTokenAndUserIdIsUsedService($token, $userId)
    {
        return DB::table('token')
            ->where('token', $token)
            ->where('user_id', $userId)
            ->where('is_used', 0)
            ->first();
    }

    public function create(array $data) : object
    {
        return $this->passwordChangeHistoryRepository->create($data);
    }

    public function update(array $data, int $id) : object
    {
        return $this->passwordChangeHistoryRepository->update($data, $id);
    }

    public function delete(int $id) : int
    {
        return $this->passwordChangeHistoryRepository->delete($id);
    }
}
