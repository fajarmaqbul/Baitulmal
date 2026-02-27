<?php
// Vercel Entry Point with Debug Support
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

if (isset($_GET['token']) && $_GET['token'] === 'BAITULMALL_DEPLOY_2026') {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    $migrate = \Illuminate\Support\Facades\Artisan::output();
    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
    $seed = \Illuminate\Support\Facades\Artisan::output();
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'migration' => $migrate, 'seeding' => $seed]);
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
