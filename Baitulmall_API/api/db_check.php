<?php
$url = getenv('DATABASE_URL');
echo "DEBUG_RAW_DATABASE_URL: " . ($url ? substr($url, 0, 15) . "..." : "NOT SET") . "\n";
if (!$url) {
    echo "DATABASE_URL is NOT set.\n";
} else {
    $parsed = parse_url($url);
    echo "Host: " . ($parsed['host'] ?? 'N/A') . "\n";
    echo "Port: " . ($parsed['port'] ?? 'N/A') . "\n";
    echo "User: " . ($parsed['user'] ?? 'N/A') . "\n";
    echo "Pass: " . (isset($parsed['pass']) ? 'HIDDEN' : 'N/A') . "\n";
    echo "Path: " . ($parsed['path'] ?? 'N/A') . "\n";
}
echo "\n--- FULL ENV CHECK ---\n";
echo "DB_CONNECTION: " . getenv('DB_CONNECTION') . "\n";
echo "APP_ENV: " . getenv('APP_ENV') . "\n";
