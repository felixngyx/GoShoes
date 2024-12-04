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

    public function paginate(
        int $perPage = 10,
        array $columns = ['*'],
        string $pageName = 'page',
        string $keyword = null,
        int $page = null,
        string $orderBy = 'created_at',
        string $sortBy = 'asc'
    )
    {
        $query = $this->model->newQuery();

        if ($keyword) {
            $query->where('name', 'like', '%' . $keyword . '%')
                ->orWhere('email', 'like', '%' . $keyword . '%');
        }

        return $query->orderBy($orderBy, $sortBy)
            ->paginate($perPage, $columns, $pageName, $page);
    }
}
