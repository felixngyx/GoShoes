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
    public function loginWithFacebook(Request $request)
{
    // Lấy `accessToken` từ request gửi lên từ frontend
    $accessToken = $request->input('access_token');
    $client = new Client([
        'verify' => false
    ]);

    try {
        // Sử dụng Socialite để xác thực người dùng từ token của Facebook
        $facebookUser = Socialite::driver('facebook')
            ->setHttpClient($client)
            ->stateless()
            ->userFromToken($accessToken);

        // Ghi log lại thông tin người dùng từ Facebook
        Log::info('Facebook user data', [
            'id' => $facebookUser->getId(),
            'name' => $facebookUser->getName(),
            'email' => $facebookUser->getEmail(),
            'avatar' => $facebookUser->getAvatar(),
        ]);

        // Tìm hoặc tạo mới user trong database
        $user = $this->findOrCreateUser($facebookUser);

        // Tạo access token và refresh token cho user
        $accessToken = JWTAuth::claims(['token_type' => 'access'])->fromUser($user);
        $refreshToken = JWTAuth::claims(['token_type' => 'refresh'])->fromUser($user);

        // Trả về phản hồi JSON với thông tin người dùng và token
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'email_is_verified' => (bool) $user->email_verified_at,
                'avt' => $user->avt,
                'auth_provider' => $user->auth_provider,
                'is_admin' => $user->is_admin,
            ],
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer'
        ], 200);
    } catch (\Exception $e) {
        // Ghi log lỗi nếu xảy ra lỗi trong quá trình xác thực
        Log::error('Facebook login error: ' . $e->getMessage());
        Log::error('Stack trace: ' . $e->getTraceAsString());

        // Trả về lỗi nếu xác thực thất bại
        return response()->json([
            'success' => false,
            'message' => 'Facebook token validation failed',
            'error' => $e->getMessage()
        ], 500);
    }
}


    private function findOrCreateUser($facebookUser)
    {
        // Tìm user bằng `facebook_id` hoặc `email`
        $user = User::where('facebook_id', $facebookUser->getId())
            ->orWhere('email', $facebookUser->getEmail())
            ->first();

        // Cập nhật nếu đã có user, tạo mới nếu chưa có
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
                'email_verified_at' => now(), // Mặc định là email đã được xác thực
            ]);
        }

        return $user;
    }
}
