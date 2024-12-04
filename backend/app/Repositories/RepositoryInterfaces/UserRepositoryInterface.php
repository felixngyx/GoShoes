<?php

namespace App\Repositories\RepositoryInterfaces;

Interface UserRepositoryInterface
{
    public function paginate(
        int $perPage = 10,
        array $columns = ['*'],
        string $pageName = 'page',
        string $keyword = null,
        int $page = null,
        string $orderBy = 'created_at',
        string $sortBy = 'asc'
    );
    public function findByEmail(string $email);

}
