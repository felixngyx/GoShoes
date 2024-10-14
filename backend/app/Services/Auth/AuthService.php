<?php

namespace App\Services\Auth;
use App\Services\ServiceInterfaces\Auth\AuthServiceInterface;
use App\Services\ServiceInterfaces\User\UserServiceInterface;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AuthService implements AuthServiceInterface
{
    private $userService;
    public function __construct(
        UserServiceInterface $userService
    )
    {
        $this->userService = $userService;
    }

    public function login(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            $data = [
                'email' => $request['email'],
                'password' => $request['password']
            ];
            if (!auth()->attempt($data)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid login details'
                ], 401);
            }

            $user = auth()->user();

            /// đoạn này phải xem xét lại, nếu user chưa verify email thì có nên cho login không, nếu có thì phải thêm điều kiện gì ở các action khác không
//            if (!$user->email_verified_at) {
//                return response()->json([
//                    'success' => false,
//                    'message' => 'You need to verify your email'
//                ], 401);
//            }

            $token = $user->createToken('token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'token_type'=>"Bearer"
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function logout(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            auth()->user()->tokens()->delete();
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function register(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            $user =  $this->userService->create($request);
            Log::info('INFO: Register user by'.$request['email'].' successfully');
            $verificationLink = (new \App\Services\Verify\VerifyService())->generateLinkVerification($user, 'register');
            Mail::to($user->email)->send(new \App\Mail\RegisterMail($verificationLink));
            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => [
                    'user' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('ERROR: Register user error by'.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function verifyToken(array $request)
    {
        try {
            $decrypted = Crypt::decrypt($request->token);
            $tokenData = json_decode($decrypted, true);

            // Check if token is expired
            if (now()->timestamp > $tokenData->expires_at) {
                return response()->json(
                    [
                        'success' => false,
                        'message' => 'Token is expired'
                    ], 400);
            }
            
            return response()->json([
                'message' => 'Token is passed',
                ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Token is invalid'
            ], 400);
        }
    }

    public function resetPassword(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            $user = auth()->user()->token();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
            $verificationLink = (new \App\Services\Verify\VerifyService())->generateLinkVerification($user, 'reset-password');
            Mail::to($user->email)->send(new \App\Mail\ResetPasswordMail($verificationLink));
            return response()->json([
                'success' => true,
                'message' => 'Reset password link sent to your email'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }


}
