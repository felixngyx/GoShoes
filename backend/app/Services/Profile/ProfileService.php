<?php

namespace App\Services\Profile;

use App\Services\ServiceInterfaces\Profile\ProfileServiceInterface;
use App\Repositories\RepositoryInterfaces\UserRepositoryInterface as UserRepository;

use Tymon\JWTAuth\Facades\JWTAuth;

class ProfileService implements ProfileServiceInterface
{
    private static $userRepository;

    public function __construct()
    {
        self::setUserRepository(app(UserRepository::class));
    }

    /**
     * @return mixed
     */
    public static function getUserRepository(): UserRepository
    {
        return self::$userRepository;
    }

    /**
     * @param mixed $userRepository
     */
    public static function setUserRepository(UserRepository $userRepository): void
    {
        self::$userRepository = $userRepository;
    }

    public function getDetail() : \Illuminate\Http\JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();
        $result = self::getUserRepository()->findById($user->id);
        return response()->json([
            'success' => true,
            'data' => [
                "name" => $result->name,
                "email" => $result->email,
                "phone" => $result->phone,
                "is_admin" => (bool)$result->is_admin,
                "email_is_verified" => (bool)$result->email_verified_at,
                'avt' => $result->avt,
            ],
        ]);
    }

    public function updateDetail(array $request) : \Illuminate\Http\JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();
        $data = [
            'name' => $request['name'],
            'avt' => $request['avt'],
        ];
        $result = self::getUserRepository()->update($data, $user->id);
        return response()->json([
            'success' => true,
            'data' => [
                "name" => $result->name,
                "email" => $result->email,
                "phone" => $result->phone,
                "is_admin" => (bool)$result->is_admin,
                "email_is_verified" => (bool)$result->email_verified_at,
                'avt' => $result->avt,
            ],
        ]);
    }

    private static function columnHiddens() : array
    {
        return [
            'id',
            'created_at',
            'updated_at',
        ];
    }

}
