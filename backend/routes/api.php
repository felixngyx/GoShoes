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
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// This route is Authenticated
Route::group([
    'middleware' => 'auth:sanctum',
], function () {
    Route::post('/logout', [AuthController::class, 'logout']);
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


