<?php

namespace App\Services\ServiceInterfaces\Auth;

Interface AuthServiceInterface
{
    public function loginService(array $request) : \Illuminate\Http\JsonResponse;

    public function logoutService(array $request) : \Illuminate\Http\JsonResponse;

    public function registerService(array $request) : \Illuminate\Http\JsonResponse;

    public function sendResetPasswordRequestService(array $request) : \Illuminate\Http\JsonResponse;

    public function resetPasswordService(array $request) : \Illuminate\Http\JsonResponse;

    public function registerVerifyService(array $request) : \Illuminate\Http\JsonResponse;

}
