<?php
echo "Base path: " . dirname(__DIR__) . "\n";
echo "Env file exists: " . (file_exists(dirname(__DIR__) . '/.env') ? 'YES' : 'NO') . "\n";
echo "Base writable: " . (is_writable(dirname(__DIR__)) ? 'YES' : 'NO') . "\n";
echo "/tmp writable: " . (is_writable('/tmp') ? 'YES' : 'NO') . "\n";

// Test writing env to /tmp
$tmpEnv = '/tmp/.env.vercel';
$written = @file_put_contents($tmpEnv, "TEST=1\n");
echo "/tmp write test: " . ($written ? 'OK' : 'FAIL') . "\n";

// Try to read the .env from base
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath)) {
    echo ".env content length: " . strlen(file_get_contents($envPath)) . "\n";
} else {
    echo ".env: DOES NOT EXIST\n";
    // Try to create it
    $result = @file_put_contents($envPath, "# dummy\n");
    echo "Create .env: " . ($result ? 'OK' : 'FAIL (read-only filesystem)') . "\n";
}

// List storage
echo "\nstorage dir exists: " . (is_dir(dirname(__DIR__) . '/storage') ? 'YES' : 'NO') . "\n";
echo "storage/framework: " . (is_dir(dirname(__DIR__) . '/storage/framework') ? 'YES' : 'NO') . "\n";
echo "vendor/autoload: " . (file_exists(dirname(__DIR__) . '/vendor/autoload.php') ? 'YES' : 'NO') . "\n";
