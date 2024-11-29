<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\RepositoryInterfaces\UserRepositoryInterface;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function __construct(
        User $user
    )
    {
        parent::__construct($user);
    }

    public function findByEmail(string $email)
    {
        return $this->model->where('email', $email)->first();
    }

    public function paginate(int $perPage = 10, array $columns = ['*'], string $pageName = 'page', int $page = null)
    {
        return $this->model->paginate($perPage, $columns, $pageName, $page);
    }
}
