<?php

namespace App\Http\Controllers\API\Auth\SocialAuthController;

use App\Http\Controllers\Controller;
use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
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

            // Tạo một HTTP client mới với SSL verify tắt
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
            Auth::login($user, true);

            return response()->json([
                'message' => 'Login Successfully!',
                'token' => $user->createToken('authToken')->plainTextToken,
                'user' => $user,
            ]);

        } catch (\Exception $e) {
            Log::error('Facebook login error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'status'=>false,
                'error' => 'An error occurred during login',
                'message' => $e->getMessage()
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
            ]);
        }

        return $user;
    }
}
