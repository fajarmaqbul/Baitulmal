<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// On Vercel: create /tmp/storage BEFORE bootstrapping Laravel
$isVercel = getenv('VERCEL') === '1' || isset($_ENV['VERCEL']);
if ($isVercel) {
    $tmpStorage = '/tmp/storage';
    $dirs = [
        $tmpStorage,
        $tmpStorage . '/framework/sessions',
        $tmpStorage . '/framework/views',
        $tmpStorage . '/framework/cache',
        $tmpStorage . '/framework/cache/data',
        $tmpStorage . '/app/public',
        $tmpStorage . '/logs',
    ];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }
    }
    // Set env var so Laravel picks it up during bootstrap
    putenv("APP_STORAGE_PATH={$tmpStorage}");
    $_ENV['APP_STORAGE_PATH'] = $tmpStorage;
    $_SERVER['APP_STORAGE_PATH'] = $tmpStorage;
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

// Override storage path AFTER app is created but BEFORE handling request
if ($isVercel) {
    $app->useStoragePath('/tmp/storage');
}

$app->handleRequest(Request::capture());
