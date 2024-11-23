<?php

namespace App\Http\Controllers\API\Profile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\ChangeDetailRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\VerifyChangeEmailRequest;
use App\Http\Requests\Profile\VerifyChangePhoneRequest;
use Illuminate\Http\Request;
use App\Services\ServiceInterfaces\Profile\ProfileServiceInterface as ProfileService;

class ProfileController extends Controller
{
    private static $profileService;

    public function __construct()
    {
        self::setProfileService(app(ProfileService::class));
    }

    /**
     * @return mixed
     */
    public static function getProfileService() : ProfileService
    {
        return self::$profileService;
    }

    /**
     * @param mixed $profileService
     */
    public static function setProfileService(ProfileService $profileService): void
    {
        self::$profileService = $profileService;
    }

    public function index() : \Illuminate\Http\JsonResponse
    {
        return self::getProfileService()->getDetail();
    }

    public function update(UpdateProfileRequest $request) : \Illuminate\Http\JsonResponse
    {
        return self::getProfileService()->updateDetail($request->all());
    }

    public function changeDetailRequest(ChangeDetailRequest $request) : \Illuminate\Http\JsonResponse
    {
        return self::getProfileService()->changeDetailRequest($request->all());
    }

    public function verifyChangeEmail(VerifyChangeEmailRequest $request) : \Illuminate\Http\JsonResponse
    {
        return self::getProfileService()->verifyChangeEmailService($request->all());
    }

    public function verifyChangePhone(VerifyChangePhoneRequest $request) : \Illuminate\Http\JsonResponse
    {
        return self::getProfileService()->verifyChangePhoneService($request->all());
    }
}
