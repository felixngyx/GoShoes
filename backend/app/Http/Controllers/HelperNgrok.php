<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HelperNgrok extends Controller
{
    function getNgrokUrl()
    {
        $ngrokApiUrl = 'http://host.docker.internal:4040/api/tunnels';

        $response = file_get_contents($ngrokApiUrl);
        $data = json_decode($response, true);
        foreach ($data['tunnels'] as $tunnel) {
            if (strpos($tunnel['public_url'], 'https://') !== false) {
                return $tunnel['public_url'];
            }
        }

        return null;
    }
}
