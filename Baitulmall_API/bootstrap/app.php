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
    ->withExceptions(function (Exceptions $exceptions): void {
        // Force JSON responses for all exceptions on Vercel to avoid view engine issues during early boot
        if (isset($_SERVER['VERCEL_URL'])) {
            $exceptions->shouldRenderHtml(fn() => false);
        }
    })
    ->booting(function ($app) {
        /*
        |--------------------------------------------------------------------------
        | Remap Storage for Vercel / Railway
        |--------------------------------------------------------------------------
        */
        $isVercel = isset($_SERVER['VERCEL']) || isset($_ENV['VERCEL']) || getenv('VERCEL') || isset($_SERVER['VERCEL_URL']);
        $isRailway = isset($_SERVER['RAILWAY_ENVIRONMENT']) || getenv('RAILWAY_ENVIRONMENT');
        $isProduction = env('APP_ENV') === 'production';
        
        // If we are on Vercel/Railway OR the current storage is not writable, force /tmp/storage
        if ($isVercel || $isRailway || $isProduction || !is_writable(storage_path())) {
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
    })
    ->create();

return $app;
