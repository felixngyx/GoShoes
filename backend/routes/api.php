<?php

use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\API\Home\TestController;
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

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::get('/test', [TestController::class, 'index']);

//Route::group([
//    'middleware' => 'api',
//    'prefix' => 'auth'
//], function () {
//    Route::get('/user', function (Request $request) {
//        return $request->user();
//    });
//
//    Route::post('/logout', [AuthController::class, 'logout']);
//});
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::group([
    'middleware' => 'auth:sanctum',
], function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});






// this route is protected by the authorize middleware
// this route will only work if the user is logged in
Route::get('/apitest',
    function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Route is working with middleware',
            'user' => $request->all()
        ], 201);
    }
)->middleware('authorize');

