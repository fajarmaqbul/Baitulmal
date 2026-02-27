<?php
$url = getenv('DATABASE_URL');
if (!$url) {
    echo "DATABASE_URL is NOT set.";
} else {
    $parsed = parse_url($url);
    echo "Host: " . ($parsed['host'] ?? 'N/A') . "\n";
    echo "Port: " . ($parsed['port'] ?? 'N/A') . "\n";
    echo "User: " . ($parsed['user'] ?? 'N/A') . "\n";
    echo "Pass: " . (isset($parsed['pass']) ? 'HIDDEN' : 'N/A') . "\n";
    echo "Path: " . ($parsed['path'] ?? 'N/A') . "\n";
}
