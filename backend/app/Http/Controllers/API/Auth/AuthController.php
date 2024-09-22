<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\ServiceInterfaces\AuthServiceInterface;
use Illuminate\Http\Request;

class AuthController extends Controller
{

    private $authService;

    public function __construct(
        AuthServiceInterface $authService
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
}
