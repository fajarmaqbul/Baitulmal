<?php
header('Content-Type: application/json');

// Disable error reporting to stderr to avoid 500ing the check script itself
error_reporting(0);
ini_set('display_errors', 0);

$checks = [
    'status' => 'diagnostic_mode',
    'timestamp' => date('Y-m-d H:i:s'),
];

try {
    $checks['bootstrap'] = 'starting';
    
    // Check if vendor exists first
    if (!is_dir(__DIR__ . '/../vendor')) {
        throw new Exception("Vendor directory missing");
    }
    
    // Load autoloader
    require __DIR__ . '/../vendor/autoload.php';
    
    $checks['autoloader'] = 'loaded';
    
    // Try to include app.php
    $app = require __DIR__ . '/../bootstrap/app.php';
    
    $checks['bootstrap'] = 'success';
    $checks['app_storage_path'] = $app->storagePath();
    $checks['is_booted'] = $app->isBooted();
    
    // Check view service
    $checks['view_service'] = $app->bound('view');
    $checks['exception_handler_bound'] = $app->bound(\Illuminate\Contracts\Debug\ExceptionHandler::class);
    
} catch (\Throwable $e) {
    $checks['bootstrap'] = 'failed';
    $checks['error'] = [
        'message' => $e->getMessage(),
        'class' => get_class($e),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace_truncated' => substr($e->getTraceAsString(), 0, 1000)
    ];
}

$checks['environment'] = [
    'VERCEL' => getenv('VERCEL'),
    'VERCEL_URL' => getenv('VERCEL_URL'),
    '$_SERVER_VERCEL' => isset($_SERVER['VERCEL']),
    '$_SERVER_VERCEL_URL' => isset($_SERVER['VERCEL_URL']),
    'PHP_SAPI' => PHP_SAPI,
];

$checks['db_config'] = [
    'DB_CONNECTION' => getenv('DB_CONNECTION'),
    'DB_HOST' => getenv('DB_HOST'),
    'DB_PORT' => getenv('DB_PORT'),
    'SUPABASE_DB_HOST' => getenv('SUPABASE_DB_HOST'),
    'SUPABASE_DB_USER_MASKED' => substr(getenv('SUPABASE_DB_USER') ?: '', 0, 10) . '...',
    'SUPABASE_DB_DATABASE' => getenv('SUPABASE_DB_DATABASE'),
    'SUPABASE_DB_PORT' => getenv('SUPABASE_DB_PORT'),
];

echo json_encode($checks, JSON_PRETTY_PRINT);
