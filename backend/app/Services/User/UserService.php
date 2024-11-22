<?php

namespace App\Services\User;

use App\Repositories\RepositoryInterfaces\UserRepositoryInterface as UserRepository;
use App\Services\ServiceAbstracts\User\UserServiceAbstract;
use App\Services\ServiceInterfaces\User\UserServiceInterface;
use Illuminate\Support\Facades\DB;

class UserService extends UserServiceAbstract implements UserServiceInterface
{
    private static $userRepository;

    public function __construct()
    {
        self::setUserRepository(app(UserRepository::class));
    }

    public static function getUserRepository(): UserRepository
    {
        return self::$userRepository;
    }

    public static function setUserRepository(UserRepository $userRepository): void
    {
        self::$userRepository = $userRepository;
    }



    public function all() : \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => self::getUserRepository()->all()
        ]);
    }

    public function updateService(array $request, int $id) : \Illuminate\Http\JsonResponse
    {
        $user = self::getUserRepository()->findById($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        DB::beginTransaction();
        try {
            $data = [
                'name' => $request['name'] ?? $user->name,
                'email' => $request['email'] ?? $user->email,
                'phone' => $request['phone'] ?? $user->phone,
                'is_deleted' => $request['is_deleted'] ?? $user->is_deleted,
                'is_admin' => $request['is_admin'] ?? $user->is_admin,
                'avt' => $request['avt'] ?? $user->avt
            ];
            $result = self::getUserRepository()->update($data, $id);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
            ]);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function deleteService(int $id) : \Illuminate\Http\JsonResponse
    {
        $user = self::getUserRepository()->findById($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        DB::beginTransaction();
        try {
            $result = self::getUserRepository()->update(['is_deleted' => true], $id);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
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
            return self::getUserRepository()->delete($id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function findById(int $id)
    {
        try {
            return self::getUserRepository()->findById($id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function findByEmail(string $email)
    {
        try {
            return self::getUserRepository()->findByEmail($email);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
