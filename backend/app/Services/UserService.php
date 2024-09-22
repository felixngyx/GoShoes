<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\RepositoryInterfaces\UserRepositoryInterface;
use App\Services\ServiceInterfaces\UserServiceInterface;

class UserService implements UserServiceInterface
{
    private $userRepository;

    public function __construct(
        UserRepositoryInterface $userRepository
    )
    {
        $this->userRepository = $userRepository;
    }

    public function all()
    {
        return $this->userRepository->all();
    }

    public function create(array $request)
    {
        try {
            $data = [
                'name' => $request['name'],
                'email' => $request['email'],
                'password' => bcrypt($request['password'])
            ];
            return $this->userRepository->create($data);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function update(array $data, $id)
    {
        try {
            return $this->userRepository->update($data, $id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function delete($id)
    {
        try {
            return $this->userRepository->delete($id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function findById($id)
    {
        try {
            return $this->userRepository->findById($id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }



}
