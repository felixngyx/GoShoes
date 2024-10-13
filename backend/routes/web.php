<?php

use App\Http\Controllers\HelperNgrok;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return redirect("/ngRok");
});

Route::get('/ngRok', function () {
    $helperNgrok = new HelperNgrok();
    $ngrokUrl = $helperNgrok->getNgrokUrl();

    if ($ngrokUrl) {
        return redirect($ngrokUrl);
    }

    // Fallback nếu không tìm thấy Ngrok URL
    return redirect(env('FRONTEND_URL', 'http://localhost:4567'));
});
