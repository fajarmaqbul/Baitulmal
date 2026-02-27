<?php
// Catch ALL errors
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

try {
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    http_response_code(500);
    
    // Build full trace
    $trace = [];
    foreach ($e->getTrace() as $i => $frame) {
        $trace[] = '#' . $i . ' ' . ($frame['file'] ?? '?') . ':' . ($frame['line'] ?? '?') . ' ' . ($frame['class'] ?? '') . ($frame['type'] ?? '') . ($frame['function'] ?? '');
    }
    
    // Also get previous exception
    $prev = $e->getPrevious();
    $prevInfo = null;
    if ($prev) {
        $prevInfo = [
            'class' => get_class($prev),
            'message' => $prev->getMessage(),
            'file' => $prev->getFile(),
            'line' => $prev->getLine(),
        ];
    }
    
    echo json_encode([
        'error' => true,
        'class' => get_class($e),
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'previous' => $prevInfo,
        'trace' => array_slice($trace, 0, 20)
    ], JSON_PRETTY_PRINT);
    exit;
}
