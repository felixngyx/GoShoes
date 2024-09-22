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

}
