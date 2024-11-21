<?php

namespace App\Services\ServiceInterfaces\Profile;

interface ProfileServiceInterface
{
    public function getDetail() : \Illuminate\Http\JsonResponse;
}
