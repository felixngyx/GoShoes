<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Routing\Controllers\Middleware;
use Tymon\JWTAuth\Facades\JWTAuth;

class RefreshTokenMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
    {
        $token = $request->bearerToken();

        if ($token) {
            try {
                $decoded = JWTAuth::setToken($token)->getPayload();
                if ($decoded['token_type'] !== 'refresh') {
                    return response()->json(['error' => 'Invalid token type'], 403);
                }
            } catch (\Exception $e) {
                 if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenInvalidException) {
                    return response()->json(['status' => 'Token is Invalid'], 401);
                } elseif ($e instanceof \Tymon\JWTAuth\Exceptions\TokenExpiredException) {
                    return response()->json(['status' => 'Token is Expired'], 401);
                } else {
                    return response()->json(['status' => 'Authorization Refresh Token not found'], 401);
                }

            }
        }

        return $next($request);
    }

}
