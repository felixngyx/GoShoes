<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\SendResetPasswordRequest;
use App\Http\Requests\Auth\VerifyTokenRequest;
use App\Services\ServiceInterfaces\Auth\AuthServiceInterface as AuthService;
use App\Services\ServiceInterfaces\Verify\VerifyServiceInterface as VerifyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{

    private $authService;

    private static $verifyTokenService;

    public function __construct(
        AuthService $authService
    )
    {
        $this->authService = $authService;
        self::setVerifyTokenService(app(VerifyService::class));
    }

    public static function getVerifyTokenService(): VerifyService
    {
        return self::$verifyTokenService;
    }

    public static function setVerifyTokenService(VerifyService $verifyTokenService): void
    {
        self::$verifyTokenService = $verifyTokenService;
    }

    public function registerController(RegisterRequest $request) : \Illuminate\Http\JsonResponse
    {
        return $this->authService->registerService($request->all());
    }

    public function loginController(LoginRequest $request) : \Illuminate\Http\JsonResponse
    {
        return $this->authService->loginService($request->all());
    }

    public function logoutController(Request $request) : \Illuminate\Http\JsonResponse
    {
        return $this->authService->logoutService($request->all());
    }


    public function verifyTokenController(VerifyTokenRequest $request) : \Illuminate\Http\JsonResponse
    {
        return self::getVerifyTokenService()->verifyTokenService($request->all());
    }

    public function sendResetPasswordRequestController(SendResetPasswordRequest $request): \Illuminate\Http\JsonResponse
    {
        return $this->authService->sendResetPasswordRequestService($request->all());
    }

    public function resetPasswordController(ResetPasswordRequest $request): \Illuminate\Http\JsonResponse
    {
        return $this->authService->resetPasswordService($request->all());
    }

    public function registerVerifyController(Request $request): \Illuminate\Http\JsonResponse
    {
        return $this->authService->registerVerifyService($request->all());
    }

    public function sendEmailVerifyController()
    {
        return $this->authService->sendEmailVerifyService();
    }

    public function refreshTokenController(Request $request): \Illuminate\Http\JsonResponse
    {
        return $this->authService->refreshTokenService($request->all());
    }
}
