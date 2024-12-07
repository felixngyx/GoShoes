<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Illuminate\Routing\Controllers\Middleware;
use Tymon\JWTAuth\Facades\JWTAuth;

class JwtMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        try {
            $token = $request->bearerToken();
            $decoded = JWTAuth::setToken($token)->getPayload();
            if ($decoded['token_type'] !== 'access') {
                return response()->json(['error' => 'Invalid token type'], 403);
            }
            $user = JWTAuth::parseToken()->authenticate();
           if (!$user['email_verified_at']) {
               return response()->json(['error' => 'Email not verified'], 403);
           }
            if ($user['is_deleted']) {
                return response()->json(['error' => 'User is deleted'], 403);
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
