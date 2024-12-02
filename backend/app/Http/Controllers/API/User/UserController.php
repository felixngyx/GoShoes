<?php

namespace App\Http\Controllers\API\User;

use App\Http\Requests\User\UpdateUserRequest;
use App\Services\ServiceInterfaces\User\UserServiceInterface as UserService;
use Illuminate\Http\Request;

class UserController
{
    private static $userService;

    public function __construct()
    {
        self::setUserService(app(UserService::class));
    }

    /**
     * @return mixed
     */
    public static function getUserService(): UserService
    {
        return self::$userService;
    }

    /**
     * @param mixed $userService
     */
    public static function setUserService(UserService $userService): void
    {
        self::$userService = $userService;
    }

    public function index(Request $request) : \Illuminate\Http\JsonResponse
    {
        return self::getUserService()->all($request->only(['page', 'perPage']));
    }

    public function update(UpdateUserRequest $request, int $id) : \Illuminate\Http\JsonResponse
    {
        return self::getUserService()->updateService($request->all(), $id);
    }

    public function destroy(int $id) : \Illuminate\Http\JsonResponse
    {
        return self::getUserService()->deleteService($id);
    }

}
