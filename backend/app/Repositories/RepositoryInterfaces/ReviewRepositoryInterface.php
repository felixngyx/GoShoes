<?php

namespace App\Repositories\RepositoryInterfaces;

interface ReviewRepositoryInterface
{
    public function create(array $data);
    public function update(array $data, int $id);
    public function delete(int $id);
    public function findById(int $id);
    public function getByProduct(int $productId, int $perPage = 10);
    public function getByUser(int $userId, int $perPage = 10);
    public function checkExistingReview(int $userId, int $productId);
}
