<?php

use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\API\Home\TestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Categories\CategoryController;
use App\Http\Controllers\API\Auth\SocialAuthController\FacebookAuthController;
use App\Http\Controllers\API\Payments\ZaloPaymentController;
use App\Http\Controllers\APi\Product\ProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// This route is Public
Route::group([ 'prefix' => 'auth'], function () {
    Route::post('/register', [AuthController::class, 'registerController']);
    Route::post('/register-verify', [AuthController::class, 'registerVerifyController']);
    Route::post('/login', [AuthController::class, 'loginController']);
    Route::post('/reset-password-request', [AuthController::class, 'sendResetPasswordRequestController']);
    Route::post('/reset-password', [AuthController::class, 'resetPasswordController']);
    Route::post('/verify-token', [AuthController::class, 'verifyTokenController']);
    Route::post('/refresh-token', [AuthController::class, 'refreshTokenController'])->middleware('jwt.refresh.token');
    Route::get('/me', [AuthController::class, 'me'])->middleware('jwt.verify');
});

Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);

// This route is Authenticated
Route::group([
    'middleware' => 'auth:sanctum',
], function () {
    Route::post('/logout', [AuthController::class, 'logoutController']);
});


// This route is Payment with ZaloPay
Route::prefix('payment')->middleware('auth:sanctum')->group(function () {
    Route::post('/', [ZaloPaymentController::class, 'paymentZalo']);
    Route::get('/callback', [ZaloPaymentController::class, 'callback']);

    Route::prefix('check')->group(function () {
        Route::post('/status', [ZaloPaymentController::class, 'searchStatus']);
        Route::post('/list-status', [ZaloPaymentController::class, 'batchSearchStatus']);
    });
});


Route::get('auth/facebook', [FacebookAuthController::class, 'redirectToFacebook'])->middleware('web');
Route::get('auth/facebook/callback', [FacebookAuthController::class, 'handleFacebookCallback'])->middleware('web');

Route::get('categories', [CategoryController::class, 'index']);
Route::post('categories', [CategoryController::class, 'store']);
Route::get('categories/{id}', [CategoryController::class, 'show']);
Route::put('categories/{id}', [CategoryController::class, 'update']);
Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

