<?php

namespace App\Repositories\RepositoryInterfaces;

Interface UserRepositoryInterface
{
    public function paginate(int $perPage = 10, array $columns = ['*'], string $pageName = 'page', int $page = null);
    public function findByEmail(string $email);

}
