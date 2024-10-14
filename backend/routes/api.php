<?php

use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\API\Home\TestController;
use App\Http\Controllers\API\Payments\MomoPaymentController;
use App\Http\Controllers\API\Payments\ZaloPaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/auth/verify-token', [AuthController::class, 'verifyToken']);
    Route::post('/auth/reset-password', [AuthController::class, 'reset-password']);
});

// This route is Authenticated
Route::group([
    'middleware' => 'auth:sanctum',
], function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::post('/payment', [ZaloPaymentController::class, 'paymentMomo']);

Route::get('/payment/callback', [ZaloPaymentController::class, 'callback']);


