<?php
echo json_encode([
    'status' => 'debug_ok',
    'php' => PHP_VERSION,
    'dir' => __DIR__,
    'key' => !empty(getenv('APP_KEY')),
    'vendor' => is_dir(__DIR__ . '/vendor')
]);
