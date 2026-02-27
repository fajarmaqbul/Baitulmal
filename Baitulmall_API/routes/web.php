<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'Baitulmall API is online',
        'version' => '1.1.0',
        'docs' => '/api/v1/test'
    ]);
});

// Urgent Sync Bridge in Web Routes
Route::get('urgent-sync', function() {
    if (request('token') !== 'BAITULMALL_DEPLOY_2026') return response('Unauthorized', 401);
    try {
        echo "LOG: Resyncing Database...\n";
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        echo \Illuminate\Support\Facades\Artisan::output() . "\n";
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        echo \Illuminate\Support\Facades\Artisan::output() . "\n";
        return "SUCCESS: Database production sinkron dengan localhost.";
    } catch (\Exception $e) {
        return "ERROR: " . $e->getMessage();
    }
});
