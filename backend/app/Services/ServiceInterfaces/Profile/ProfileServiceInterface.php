<?php

namespace App\Services\ServiceInterfaces\Profile;

interface ProfileServiceInterface
{
    public function getDetail() : \Illuminate\Http\JsonResponse;

    public function updateDetail(array $request) : \Illuminate\Http\JsonResponse;

    public function changeDetailRequest(array $request) : \Illuminate\Http\JsonResponse ;

    public function verifyChangeEmailService(array $request) : \Illuminate\Http\JsonResponse;
}
