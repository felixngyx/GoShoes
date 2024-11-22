<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->renderable(function (UnauthorizedHttpException $e, $request) {
            if ($e->getPrevious() instanceof \Tymon\JWTAuth\Exceptions\TokenExpiredException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token has expired'
                ], 401);
            } else if ($e->getPrevious() instanceof \Tymon\JWTAuth\Exceptions\TokenInvalidException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid token'
                ], 401);
            } else if ($e->getPrevious() instanceof \Tymon\JWTAuth\Exceptions\TokenBlacklistedException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token has been blacklisted'
                ], 401);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 401);
        });
    }

    protected function shouldReturnJson($request, Throwable $e){
        return true;
    }

    public function render($request, Throwable $e)
    {
        if ($request->expectsJson()) {
            // Xử lý các lỗi authentication/authorization
            if ($e instanceof \Illuminate\Auth\AuthenticationException ||
                $e instanceof UnauthorizedHttpException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized',
                ], 401);
            }

            // Xử lý các lỗi validation
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], 422);
            }

            // Các lỗi khác
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }

        return parent::render($request, $e);
    }
}
