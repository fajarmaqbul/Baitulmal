<?php
// Trigger Sync: 2026-02-28 00:40

// Catch ALL errors including fatal ones
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

try {
    // Forward Vercel requests to normal index.php
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'class' => get_class($e),
        'trace' => array_slice(explode("\n", $e->getTraceAsString()), 0, 15)
    ]);
    exit;
}
