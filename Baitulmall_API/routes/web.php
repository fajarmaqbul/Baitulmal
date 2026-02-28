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
        echo "LOG: Performing Fresh Sync (DROP and ALL MIGRATIONS)...\n";
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true]);
        echo \Illuminate\Support\Facades\Artisan::output() . "\n";
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        echo \Illuminate\Support\Facades\Artisan::output() . "\n";
        return "SUCCESS: Database production 100% Sinkron degan Local.";
    } catch (\Exception $e) {
        return "ERROR: " . $e->getMessage();
    }
});
