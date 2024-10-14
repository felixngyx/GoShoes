<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\ServiceInterfaces\Auth\AuthServiceInterface as AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class AuthController extends Controller
{

    private $authService;

    public function __construct(
        AuthService $authService
    )
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request)
    {
        return $this->authService->register($request->all());
    }

    public function login(LoginRequest $request)
    {
        return $this->authService->login($request->all());
    }

    public function logout(Request $request)
    {
        return $this->authService->logout($request->all());
    }


    public function verifyToken(Request $request)
    {
        return $this->authService->verifyToken($request->all());
    }

    public function resetPassword(Request $request)
    {
        return $this->authService->resetPassword($request->all());
    }

}
