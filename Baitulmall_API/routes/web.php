<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'Baitulmall API is online',
        'version' => '1.0.0',
        'docs' => '/api/v1/test'
    ]);
});
