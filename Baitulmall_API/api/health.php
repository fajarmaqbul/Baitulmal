<?php
echo json_encode([
    'status' => 'ok',
    'php' => PHP_VERSION,
    'vercel' => isset($_SERVER['VERCEL_URL']),
    'app_key_exists' => !empty(getenv('APP_KEY')),
    'app_key_prefix' => substr(getenv('APP_KEY'), 0, 7),
    'storage_writable' => is_writable('/tmp'),
    'vendor_exists' => is_dir(__DIR__ . '/../vendor'),
    'env' => getenv('APP_ENV')
]);
