<?php

namespace App\Services;
use App\Services\ServiceInterfaces\AuthServiceInterface;
use App\Services\ServiceInterfaces\UserServiceInterface;

class AuthService implements AuthServiceInterface
{
    private $userService;
    public function __construct(
        UserServiceInterface $userService
    )
    {
        $this->userService = $userService;
    }

    public function login(array $request)
    {
        try {
            $data = [
                'email' => $request['email'],
                'password' => $request['password']
            ];
            if (!auth()->attempt($data)) {
                return response()->json([
                    'message' => 'Invalid login details'
                ], 401);
            }

            $user = auth()->user();

            $token = $user->createToken('token')->plainTextToken;

            return [
                'message' => 'Login successful',
                'user_id' => auth()->id(),
                'token' => $token,
                'token_type'=>"Bearer"
            ];
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function logout(array $request)
    {
        try {
            auth()->user()->tokens()->delete();
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ], 200);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function register(array $request)
    {
        try {
            $user =  $this->userService->create($request);
            return response()->json([
                'message' => 'User created successfully',
            ], 201);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

}
