<?php

namespace App\Http\Controllers\API\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ServiceInterfaces\Profile\ProfileServiceInterface as ProfileService;

class ProfileController extends Controller
{
    private static $profileService;

    public function __construct(
        ProfileService $profileService
    )
    {
        self::setProfileService($profileService);
    }

    /**
     * @return mixed
     */
    public static function getProfileService()
    {
        return self::$profileService;
    }

    /**
     * @param mixed $profileService
     */
    public static function setProfileService($profileService): void
    {
        self::$profileService = $profileService;
    }

    public function index()
    {
        return self::getProfileService()->getDetail();
    }
}
