<?php
// Vercel Entry Point

if (isset($_GET['sync']) && $_GET['sync'] === '2026') {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    try {
        echo "Starting Full Production Sync...\n";
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        echo "Migration: " . \Illuminate\Support\Facades\Artisan::output() . "\n";
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        echo "Seeding: " . \Illuminate\Support\Facades\Artisan::output() . "\n";
        echo "SUCCESS: Produksi Sinkron.";
    } catch (\Exception $e) {
        echo "ERROR: " . $e->getMessage();
    }
    exit;
}

try {
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine(),
        'class' => get_class($e)
    ]);
    exit;
}
