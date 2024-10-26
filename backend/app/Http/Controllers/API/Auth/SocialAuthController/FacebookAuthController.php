<?php

namespace App\Http\Controllers\API\Auth\SocialAuthController;

use App\Http\Controllers\Controller;
use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;

class FacebookAuthController extends Controller
{
    public function redirectToFacebook()
    {
        return Socialite::driver('facebook')->redirect();
    }

    public function handleFacebookCallback(Request $request)
    {
        try {
            Log::info('Facebook callback received', $request->all());

            // Create HTTP client with SSL verify disabled
            $client = new Client([
                'verify' => false
            ]);

            $facebookUser = Socialite::driver('facebook')
                ->setHttpClient($client)
                ->stateless()
                ->user();

            Log::info('Facebook user data', [
                'id' => $facebookUser->getId(),
                'name' => $facebookUser->getName(),
                'email' => $facebookUser->getEmail(),
                'avatar' => $facebookUser->getAvatar(),
            ]);

            $user = $this->findOrCreateUser($facebookUser);

            // Set access token TTL to 30 minutes
            config(['jwt.ttl' => 30]);
            // Add token type "access" to the access token
            $accessToken = JWTAuth::claims(['token_type' => 'access'])->fromUser($user);

            // Set refresh token TTL to 30 days
            config(['jwt.refresh_ttl' => 30 * 24 * 60]);
            // Add token type "refresh" to the refresh token
            $refreshToken = JWTAuth::claims(['token_type' => 'refresh'])->fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_is_verified' => (bool)$user->email_verified_at,
                    'avt' => $user->avt,
                    'auth_provider' => $user->auth_provider
                ],
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type' => 'Bearer'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Facebook login error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during login',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function findOrCreateUser($facebookUser)
    {
        $user = User::where('facebook_id', $facebookUser->getId())
            ->orWhere('email', $facebookUser->getEmail())
            ->first();

        if ($user) {
            $user->update([
                'facebook_id' => $facebookUser->getId(),
                'name' => $facebookUser->getName(),
                'email' => $facebookUser->getEmail(),
                'avt' => $facebookUser->getAvatar(),
            ]);
        } else {
            $user = User::create([
                'name' => $facebookUser->getName(),
                'email' => $facebookUser->getEmail(),
                'facebook_id' => $facebookUser->getId(),
                'avt' => $facebookUser->getAvatar(),
                'auth_provider' => 'facebook',
                'password' => Hash::make(Str::random(16)),
                'email_verified_at' => now(), // Facebook users are considered verified
            ]);
        }

        return $user;
    }
}
