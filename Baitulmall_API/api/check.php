<?php
header('Content-Type: application/json');

$checks = [
    'status' => 'ok',
    'php_version' => PHP_VERSION,
    'env_vars' => [
        'APP_KEY_SET' => !empty(getenv('APP_KEY')),
        'APP_KEY_START' => substr(getenv('APP_KEY') ?: '', 0, 10) . '...',
        'APP_ENV' => getenv('APP_ENV'),
        'VERCEL' => isset($_SERVER['VERCEL_URL']),
    ],
    'files' => [
        'vendor_exists' => is_dir(__DIR__ . '/../vendor'),
        'tmp_writable' => is_writable('/tmp'),
        'storage_writable' => is_writable('/tmp/storage') || @mkdir('/tmp/storage_test'),
    ]
];

echo json_encode($checks, JSON_PRETTY_PRINT);
