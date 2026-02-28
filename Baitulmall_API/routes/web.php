<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'Baitulmall API is online',
        'version' => '1.2.0',
        'docs' => '/api/v1/test'
    ]);
});

// Urgent Sync Bridge in Web Routes
Route::get('urgent-sync', function() {
    if (request('token') !== 'BAITULMALL_DEPLOY_2026') return response('Unauthorized', 401);
    $step = request('step', 'migrate');
    try {
        if ($step === 'migrate') {
            echo "Step: Migrate Fresh...\n";
            \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true]);
            return "SUCCESS: Migration Complete. \n" . \Illuminate\Support\Facades\Artisan::output();
        } elseif ($step === 'seed') {
            echo "Step: Seeding...\n";
            \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
            return "SUCCESS: Seeding Complete. \n" . \Illuminate\Support\Facades\Artisan::output();
        }
        return "ERROR: Step not recognized.";
    } catch (\Exception $e) {
        return "ERROR in $step: " . $e->getMessage();
    }
});
