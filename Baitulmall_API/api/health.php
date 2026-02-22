<?php
echo json_encode([
    'status' => 'ok',
    'php' => PHP_VERSION,
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    'vercel' => isset($_SERVER['VERCEL_URL'])
]);
