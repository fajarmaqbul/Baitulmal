<?php
die(json_encode([
    'status' => 'ok',
    'php' => PHP_VERSION,
    'key' => !empty(getenv('APP_KEY')),
    'storage' => is_writable('/tmp'),
    'vendor' => is_dir(__DIR__ . '/../vendor')
]));
