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
    'server_vars' => [
        'VERCEL' => isset($_SERVER['VERCEL']),
        'VERCEL_URL' => isset($_SERVER['VERCEL_URL']),
        'APP_ENV' => isset($_SERVER['APP_ENV']) ? $_SERVER['APP_ENV'] : 'not set',
        'CUSTOM_VERCEL_ENV' => getenv('VERCEL'),
    ],
    'files' => [
        'vendor_exists' => is_dir(__DIR__ . '/../vendor'),
        'tmp_exists' => is_dir('/tmp'),
        'tmp_writable' => is_writable('/tmp'),
        'storage_dir_exists' => is_dir('/tmp/storage'),
        'storage_writable' => is_writable('/tmp/storage'),
        'mkdir_test_result' => @mkdir('/tmp/storage_test_' . time()),
        'file_put_test' => @file_put_contents('/tmp/test.txt', 'test') !== false,
        'bootstrap_app' => file_exists(__DIR__ . '/../bootstrap/app.php'),
    ],
    'laravel' => [
        'is_bootstrapped' => isset($GLOBALS['app']),
    ]
];

echo json_encode($checks, JSON_PRETTY_PRINT);
