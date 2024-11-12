<?php

namespace App\Repositories\RepositoryInterfaces;

interface BannerRepositoryInterface
{
    public function getAll();
    public function getById($id);
    public function create(array $data);
    public function createBannerImage(array $data);
    public function update($id, array $data);
    public function updateBannerImage($id, array $data);
    public function delete($id);
}
