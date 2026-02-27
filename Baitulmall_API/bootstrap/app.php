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
    ->withExceptions(function (Exceptions $exceptions) {
        // Default exceptions
    })
    ->create();

$isVercel = getenv('VERCEL') === '1' || getenv('VERCEL_URL') !== false || isset($_ENV['VERCEL']) || isset($_SERVER['VERCEL_URL']);
if ($isVercel) {
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
    $app->instance('path.storage', $storagePath);
    
    // Override bootstrap path to bypass Vercel build cache containing wrong absolute paths
    $bootstrapPath = '/tmp/bootstrap';
    if (!is_dir($bootstrapPath . '/cache')) {
        @mkdir($bootstrapPath . '/cache', 0777, true);
    }
    $app->useBootstrapPath($bootstrapPath);
    
    // Force PackageManifest to use the new bootstrap path
    $app->singleton(\Illuminate\Foundation\PackageManifest::class, fn () => new \Illuminate\Foundation\PackageManifest(
        new \Illuminate\Filesystem\Filesystem, $app->basePath(), $app->getCachedPackagesPath()
    ));
    
    $app->register(\Illuminate\Filesystem\FilesystemServiceProvider::class);
    $app->register(\Illuminate\View\ViewServiceProvider::class);
}

return $app;
