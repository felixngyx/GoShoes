<?php

namespace App\Services\Auth;
use App\Services\ServiceInterfaces\PasswordChangeHistory\PasswordChangeHistoryServiceInterface as PasswordChangeHistoryService;
use App\Services\ServiceInterfaces\Auth\AuthServiceInterface;
use App\Services\ServiceInterfaces\User\UserServiceInterface as UserService;
use App\Services\ServiceInterfaces\Verify\VerifyServiceInterface as VerifyService;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AuthService implements AuthServiceInterface
{
    private $userService;

    private static $verifyService;

    private static $passwordChangeHistoryService;

    public function __construct(
        UserService $userService
    )
    {
        $this->userService = $userService;
        self::setPasswordChangeHistoryService(app(PasswordChangeHistoryService::class));
        self::setVerifyService(app(VerifyService::class));
    }

    public static function getVerifyService(): VerifyService
    {
        return self::$verifyService;
    }

    public static function setVerifyService(VerifyService $verifyService): void
    {
        self::$verifyService = $verifyService;
    }

    public static function getPasswordChangeHistoryService(): PasswordChangeHistoryService
    {
        return self::$passwordChangeHistoryService;
    }

    public static function setPasswordChangeHistoryService(PasswordChangeHistoryService $passwordChangeHistoryService): void
    {
        self::$passwordChangeHistoryService = $passwordChangeHistoryService;
    }


    public function loginService(array $request) : \Illuminate\Http\JsonResponse
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
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'user' => $user->name,
                    'email' => $user->email,
                    'email_is_verified' => (bool)$user->email_verified_at,
                    'is_admin' => $user->is_admin
                ],
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

    public function logoutService(array $request) : \Illuminate\Http\JsonResponse
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

    public function registerService(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            $user =  $this->userService->create($request);
            $verificationLink = (self::getVerifyService()->generateLinkVerification($user, 'register'));
            Mail::to($user->email)->send(new \App\Mail\RegisterMail($verificationLink));
            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => [
                    'user' => $user->name,
                    'email' => $user->email,
                    'email_is_verified' => (bool)$user->email_verified_at
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

    public function sendResetPasswordRequestService(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            // Check if email exists
            $user = $this->userService->findByEmail($request['email']);

            // If email not found
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email not found'
                ], 404);
            }

            //  If user is admin
            // Admin cannot reset password
            if ($user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin cannot reset password'
                ], 403);
            }

            // Generate verification link
            $verificationLink = (self::getVerifyService()->generateLinkVerification($user, 'reset-password'));

            // Send email
            Mail::to($user->email)->send(new \App\Mail\ResetPasswordMail($verificationLink));

            // Return response
            return response()->json([
                'success' => true,
                'message' => 'Reset password link sent to your email',
                'data' => [
                    'email' => $user->email,
                    'verification_link' => $verificationLink
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function resetPasswordService(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            $decrypted = self::getVerifyService()->decryptTokenService($request['token']);

            // Check if token is expired
            if (now()->timestamp > $decrypted->expires_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token is expired'
                ], 400);
            }

            // Check if email exists
            $user = $this->userService->findById($decrypted->user_id);

            // If email not found
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email not found'
                ], 404);
            }

            //  If user is admin
            // Admin cannot reset password
            if ($user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin cannot reset password'
                ], 403);
            }

            // Update password
            $user->password = bcrypt($request['password']);
            $this->userService->update(['password' => $user->password], $user->id);
            self::getPasswordChangeHistoryService()->findByTokenAndUserIdIsUsedService($request['token'], $decrypted->user_id);
            // Return response
            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
    public function registerVerifyService(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            $decrypted = self::getVerifyService()->decryptTokenService($request['token']);

            // Check if token is expired
            if (now()->timestamp > $decrypted->expires_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token is expired'
                ], 400);
            }

            if ($decrypted->type !== 'register') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token'
                ], 400);
            }

            // Check if email exists
            $user = $this->userService->findById($decrypted->user_id);

            // If email not found
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email not found'
                ], 404);
            }

            //  If user is admin
            // Admin cannot verify email
            if ($user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin cannot verify email'
                ], 403);
            }

            // Update email_verified_at
            $this->userService->update(['email_verified_at' => now()], $user->id);

            // Return response
            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
