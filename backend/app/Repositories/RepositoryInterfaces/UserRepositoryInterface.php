<?php

namespace App\Repositories\RepositoryInterfaces;

Interface UserRepositoryInterface
{
    public function findByEmail(string $email);

}
