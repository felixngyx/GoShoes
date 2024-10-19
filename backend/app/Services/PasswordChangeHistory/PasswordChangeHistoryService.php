<?php

namespace App\Services\PasswordChangeHistory;

use App\Repositories\RepositoryInterfaces\PasswordChangeHistoryRepositoryInterface as PasswordChangeHistoryRepository;
use App\Services\ServiceAbstracts\PasswordChangeHistory\PasswordChangeHistoryAbstract;
use App\Services\ServiceInterfaces\PasswordChangeHistory\PasswordChangeHistoryServiceInterface;

class PasswordChangeHistoryService extends PasswordChangeHistoryAbstract implements PasswordChangeHistoryServiceInterface
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
