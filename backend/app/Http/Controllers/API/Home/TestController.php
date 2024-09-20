<?php

namespace App\Http\Controllers\API\Home;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TestController extends Controller
{
    /**
     *Test API
     *
     * @group Test
     * 
     * @bodyParam name string required Example: John Doe
     * @response 200 [
     *   {
     *    'message' => 'Hello John Doe!',
     *   }
     * ]
     * @response 401 {"message": "Unauthorized"}
     */
    public function index(Request $request)
    {
        return response()->json([
            'message' => 'Hello John Doe!',
        ]);
    }
}
