<?php

use App\Events\NewOrderCreated;
use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\API\Shipping\ShippingController;
use App\Http\Controllers\API\Wishlist\WishlistController;
use App\Http\Controllers\API\Cart\CartController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Categories\CategoryController;
use App\Http\Controllers\API\Auth\SocialAuthController\FacebookAuthController;

use App\Http\Controllers\API\Colors\ColorController;
use App\Http\Controllers\API\Sizes\SizeController;
use App\Http\Controllers\API\Brands\BrandController;
use App\Http\Controllers\API\Order\OrderController;
use App\Http\Controllers\API\Payments\ZaloPaymentController;
use App\Http\Controllers\API\Products\ProductController;
use App\Http\Controllers\API\Discount\DiscountController;
use App\Http\Controllers\API\PostCategory\PostCategoryController;
use App\Http\Controllers\API\Products\ProductClientController;
use App\Http\Controllers\Api\Review\ReviewController;

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
Route::group(['prefix' => 'auth'], function () {
    Route::post('/register', [AuthController::class, 'registerController']);
    Route::post('/register-verify', [AuthController::class, 'registerVerifyController']);
    Route::post('/login', [AuthController::class, 'loginController']);
    Route::post('/reset-password-request', [AuthController::class, 'sendResetPasswordRequestController']);
    Route::post('/reset-password', [AuthController::class, 'resetPasswordController']);
    Route::post('/verify-token', [AuthController::class, 'verifyTokenController']);
    Route::post('/refresh-token', [AuthController::class, 'refreshTokenController'])->middleware('jwt.refresh.token');
});

// API Product
Route::get('/products/trashed', [ProductController::class, 'trashedProducts']);
Route::post('/products/restore/{id}', [ProductController::class, 'restore']);
Route::post('/restore-multiple', [ProductController::class, 'restoreMultiple']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);

Route::get('/product/{id}', [ProductClientController::class, 'show']);


// API Color

Route::get('/colors', [ColorController::class, 'index']);
Route::post('/colors', [ColorController::class, 'store']);
Route::get('/colors/{id}', [ColorController::class, 'show']);
Route::put('/colors/{id}', [ColorController::class, 'update']);
Route::delete('/colors/{id}', [ColorController::class, 'destroy']);
Route::delete('colors', [ColorController::class, 'destroyMultiple']);

// API Size
Route::get('/sizes', [SizeController::class, 'index']);
Route::post('/sizes', [SizeController::class, 'store']);
Route::get('/sizes/{id}', [SizeController::class, 'show']);
Route::put('/sizes/{id}', [SizeController::class, 'update']);
Route::delete('/sizes/{id}', [SizeController::class, 'destroy']);
Route::delete('sizes', [SizeController::class, 'destroyMultiple']);


Route::get('/brands', [BrandController::class, 'index']);
Route::post('/brands', [BrandController::class, 'store']);
Route::get('/brands/{id}', [BrandController::class, 'show']);
Route::put('/brands/{id}', [BrandController::class, 'update']);
Route::delete('/brands/{id}', [BrandController::class, 'destroy']);
Route::delete('brands', [BrandController::class, 'destroyMultiple']);

// API PostCategoryController
Route::get('/post-categories', [PostCategoryController::class, 'index']);
Route::post('/post-categories', [PostCategoryController::class, 'store']);
Route::get('/post-categories/{id}', [PostCategoryController::class, 'show']);
Route::put('/post-categories/{id}', [PostCategoryController::class, 'update']);
Route::delete('/post-categories/{id}', [PostCategoryController::class, 'destroy']);
Route::delete('post-categories', [PostCategoryController::class, 'destroyMultiple']);

// This route is Authenticated
Route::group([
    'middleware' => 'jwt.auth',
], function () {
    Route::post('/logout', [AuthController::class, 'logoutController']);

    Route::prefix('orders')->group(function () {
        Route::get('/all', [OrderController::class, 'index']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::get('/', [OrderController::class, 'OrderOneUser']);
        Route::post('/', [OrderController::class, 'store']);
        Route::put('/{id}', [OrderController::class, 'update']);
        Route::get('/{id}/check-payment', [OrderController::class, 'checkPaymentStatus']);
        Route::put('/{id}/update', [OrderController::class, 'UpdateOrder']);
        Route::post('/{id}/renew-payment', [OrderController::class, 'renewPaymentLink']);
    });

    Route::prefix('discounts')->group(function () {
        Route::get('/', [DiscountController::class, 'index']);
        Route::post('/', [DiscountController::class, 'store']);
        Route::get('/{id}', [DiscountController::class, 'show']);
        Route::put('/{id}', [DiscountController::class, 'update']);
        Route::delete('/{id}', [DiscountController::class, 'destroy']);
        Route::post('/validate', [DiscountController::class, 'validateCode']);
        Route::patch('/{id}/status', [DiscountController::class, 'updateStatus']);
        Route::get('/{id}/statistics', [DiscountController::class, 'getStatistics']);
    });

    Route::prefix('wishlist')->group(function () {
        Route::get('/', [WishlistController::class, 'index']);
        Route::post('/', [WishlistController::class, 'store']);
        Route::delete('/', [WishlistController::class, 'destroy']);
    });

    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/', [CartController::class, 'store']);
        Route::delete('/', [CartController::class, 'destroy']);
        Route::put('/', [CartController::class, 'update']);
    });

    // API review
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    Route::get('/products/{id}/reviews', [ReviewController::class, 'productReviews']);
    Route::get('/user/reviews', [ReviewController::class, 'userReviews']);


    Route::get('categories', [CategoryController::class, 'index']);
    Route::post('categories', [CategoryController::class, 'store']);
    Route::get('categories/{id}', [CategoryController::class, 'show']);
    Route::put('categories/{id}', [CategoryController::class, 'update']);
    Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

    // API Wishlist
    Route::resource('wishlist', WishlistController::class);

    // API Cart
    Route::resource('cart', CartController::class);

    //API Shipping
    Route::resource('shipping', ShippingController::class);
});


// Routes cho Payment với ZaloPay
Route::prefix('payment')->group(function () {
    Route::get('/callback', [ZaloPaymentController::class, 'callback'])->name('payment.callback');

    Route::prefix('check')->group(function () {
        Route::post('/status', [ZaloPaymentController::class, 'searchStatus']);
        Route::post('/list-status', [ZaloPaymentController::class, 'batchSearchStatus']);
    });
});


Route::post('/auth/facebook-login', [FacebookAuthController::class, 'loginWithFacebook']);

// API Categories
