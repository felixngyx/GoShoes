<?php

namespace App\Services\Token;

use App\Repositories\RepositoryInterfaces\TokenRepositoryInterface as PasswordChangeHistoryRepository;
use App\Services\ServiceAbstracts\Token\TokenAbstract;
use App\Services\ServiceInterfaces\Token\TokenServiceInterface;

class TokenService extends TokenAbstract implements TokenServiceInterface
{
    private $passwordChangeHistoryRepository;
    public function __construct(
        PasswordChangeHistoryRepository $passwordChangeHistoryRepository
    )
    {
        $this->passwordChangeHistoryRepository = $passwordChangeHistoryRepository;
    }


    public function findByTokenAndUserIdIsUsedService(string $token, int $userId)
    {
        return $this->passwordChangeHistoryRepository->findByTokenAndUserIdIsUsed($token, $userId);
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
