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
    ->registered(function ($app) {
        // Force register View & Filesystem services early on Vercel to avoid BindingResolutionException
        if (isset($_SERVER['VERCEL']) || getenv('VERCEL') || isset($_SERVER['VERCEL_URL'])) {
            $app->register(\Illuminate\Filesystem\FilesystemServiceProvider::class);
            $app->register(\Illuminate\View\ViewServiceProvider::class);

            $storagePath = '/tmp/storage';
            if (!is_dir($storagePath)) {
                @mkdir($storagePath, 0777, true);
                @mkdir($storagePath . '/framework/sessions', 0777, true);
                @mkdir($storagePath . '/framework/views', 0777, true);
                @mkdir($storagePath . '/framework/cache', 0777, true);
                @mkdir($storagePath . '/framework/cache/data', 0777, true);
                @mkdir($storagePath . '/app/public', 0777, true);
                @mkdir($storagePath . '/logs', 0777, true);
            }
            $app->useStoragePath($storagePath);
            
            // Re-bind the paths in the container since we changed storage path
            $app->instance('path.storage', $storagePath);
        }
    })
    ->create();

return $app;
