<?php
// Vercel Entry Point with Debug Support
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

if (str_contains($_SERVER['REQUEST_URI'] ?? '', 'SINKRON_DB_2026')) {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    
    try {
        echo "Starting Migration...\n";
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        echo \Illuminate\Support\Facades\Artisan::output() . "\n";
        
        echo "Starting Seeding...\n";
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        echo \Illuminate\Support\Facades\Artisan::output() . "\n";
        
        echo "SUCCESS: Database Synchronized with Supabase.";
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
