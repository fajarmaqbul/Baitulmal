<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
    })
    ->create();

/*
|--------------------------------------------------------------------------
| Remap Storage for Vercel / Railway
|--------------------------------------------------------------------------
*/
$isVercel = isset($_SERVER['VERCEL']) || getenv('VERCEL') || isset($_SERVER['VERCEL_URL']);
if ($isVercel || env('APP_ENV') === 'production' || !is_writable(storage_path())) {
    $storagePath = '/tmp/storage';
    if (!is_dir($storagePath . '/framework/views')) {
        @mkdir($storagePath . '/framework/sessions', 0777, true);
        @mkdir($storagePath . '/framework/views', 0777, true);
        @mkdir($storagePath . '/framework/cache', 0777, true);
        @mkdir($storagePath . '/framework/cache/data', 0777, true);
        @mkdir($storagePath . '/app/public', 0777, true);
    }
    $app->useStoragePath($storagePath);
}

return $app;
