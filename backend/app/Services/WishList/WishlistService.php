<?php

namespace App\Services\WishList;

use App\Repositories\RepositoryInterfaces\UserRepositoryInterface as UserRepository;
use App\Services\ServiceInterfaces\WishList\WishlistServiceInterface;

class WishlistService implements WishlistServiceInterface
{
    private $wishListRepository;

    public function __construct(
        UserRepository $wishListRepository
    )
    {
        $this->wishListRepository = $wishListRepository;
    }

    public function all()
    {
        return $this->wishListRepository->all();
    }

    public function create(array $request)
    {
        try {
            $data = [
                'name' => $request['name'],
                'email' => $request['email'],
                'password' => bcrypt($request['password'])
            ];
            return $this->wishListRepository->create($data);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function update(array $data, int $id)
    {
        try {
            return $this->wishListRepository->update($data, $id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function delete(int $id)
    {
        try {
            return $this->wishListRepository->delete($id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function findById(int $id)
    {
        try {
            return $this->wishListRepository->findById($id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function findByEmail(string $email)
    {
        try {
            return $this->wishListRepository->findByEmail($email);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
