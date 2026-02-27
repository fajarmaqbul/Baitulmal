<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// On Vercel: prepare writable paths BEFORE anything else
$isVercel = getenv('VERCEL') === '1' || isset($_ENV['VERCEL']);
if ($isVercel) {
    $tmpStorage = '/tmp/storage';
    $tmpBootstrap = '/tmp/bootstrap';
    $dirs = [
        $tmpStorage,
        $tmpStorage . '/framework/sessions',
        $tmpStorage . '/framework/views',
        $tmpStorage . '/framework/cache',
        $tmpStorage . '/framework/cache/data',
        $tmpStorage . '/app/public',
        $tmpStorage . '/logs',
        $tmpBootstrap . '/cache',
    ];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }
    }
    
    // Set cache path env vars BEFORE Laravel loads
    // These are read by Application::normalizeCachePath() 
    putenv("APP_SERVICES_CACHE={$tmpBootstrap}/cache/services.php");
    putenv("APP_PACKAGES_CACHE={$tmpBootstrap}/cache/packages.php");
    putenv("APP_CONFIG_CACHE={$tmpBootstrap}/cache/config.php");
    putenv("APP_ROUTES_CACHE={$tmpBootstrap}/cache/routes-v7.php");
    putenv("APP_EVENTS_CACHE={$tmpBootstrap}/cache/events.php");
}

// Determine if the application is in maintenance mode...
if (!$isVercel && file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
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
