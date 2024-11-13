<?php

namespace App\Repositories\RepositoryInterfaces;

use App\Models\Post;

interface PostRepositoryInterface
{
    public function getAll();
    public function getById($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
    public function deleteMultiple(array $ids);
    
}