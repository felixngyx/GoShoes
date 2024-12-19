<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;

class Authorize
{
    const role = [
        'ADMIN' => "admin",
        'USER' => 'user',
        'SUPER-ADMIN' => 'super-admin',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $token = $request->bearerToken();
            $decoded = JWTAuth::setToken($token)->getPayload();
            if ($decoded['token_type'] !== 'access') {
                return response()->json(['error' => 'Invalid token type'], 403);
            }
            $user = JWTAuth::parseToken()->authenticate();
            if (!$user['email_verified_at']) {
                return response()->json(['error' => 'Chưa xác minh email, vui lòng xác minh email!'], 403);
            }
            if ($user['is_deleted']) {
                return response()->json(['error' => 'User is deleted'], 403);
            }
            if ($user['role'] !== self::role['ADMIN'] && $user['role'] !== self::role['SUPER-ADMIN']) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        } catch (Exception $e) {
            if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenInvalidException) {
                return response()->json(['status' => 'Token is Invalid'], 401);
            } elseif ($e instanceof \Tymon\JWTAuth\Exceptions\TokenExpiredException) {
                return response()->json(['status' => 'Token is Expired'], 401);
            } else {
                return response()->json(['status' => 'Authorization Token not found'], 401);
            }
        }
        return $next($request);
    }
}
