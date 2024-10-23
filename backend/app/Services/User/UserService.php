<?php

namespace App\Services\User;

use App\Repositories\RepositoryInterfaces\UserRepositoryInterface as UserRepository;
use App\Services\ServiceInterfaces\User\UserServiceInterface;

class UserService implements UserServiceInterface
{
    private $userRepository;

    public function __construct(
        UserRepository $userRepository
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

    public function update(array $data, int $id)
    {
        try {
            return $this->userRepository->update($data, $id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function delete(int $id)
    {
        try {
            return $this->userRepository->delete($id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function findById(int $id)
    {
        try {
            return $this->userRepository->findById($id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function findByEmail(string $email)
    {
        try {
            return $this->userRepository->findByEmail($email);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
