<?php

namespace App\Services\User;

use App\Repositories\RepositoryInterfaces\UserRepositoryInterface as UserRepository;
use App\Services\ServiceAbstracts\User\UserServiceAbstract;
use App\Services\ServiceInterfaces\User\UserServiceInterface;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

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
        $admin = JWTAuth::parseToken()->authenticate();
        $user = self::getUserRepository()->findById($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        if ($admin['role'] === "admin") {
            if (isset($request['role'])) {
                return response()->json(['error' => "You don't have permission to update the role"], 403);
            }
            if ($user->role === "admin") {
                return response()->json(['error' => "You don't have permission to update another admin's data"], 403);
            }
        }

        DB::beginTransaction();
        try {
            $data = [
                'name' => $request['name'] ?? $user->name,
                'email' => $request['email'] ?? $user->email,
                'phone' => $request['phone'] ?? $user->phone,
                'is_deleted' => $request['is_deleted'] ?? $user->is_deleted,
                'avt' => $request['avt'] ?? $user->avt
            ];
            if (isset($request['role'])) {
                $data['role'] = $request['role'];
            }
            $result = self::getUserRepository()->update($data, $id);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
            ]);
        } catch (\Exception $e) {
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
            return self::getUserRepository()->create($data);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function update(array $data, int $id)
    {
        try {
            return self::getUserRepository()->update($data, $id);
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
