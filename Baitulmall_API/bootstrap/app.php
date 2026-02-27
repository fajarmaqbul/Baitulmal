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
        apiPrefix: '',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderHtmlWhen(fn () => false);
    })
    ->create();

$isVercel = getenv('VERCEL') === '1' || getenv('VERCEL_URL') !== false || isset($_ENV['VERCEL']) || isset($_SERVER['VERCEL_URL']);
if ($isVercel) {
    // Force register these to prevent "Target class [view] does not exist" errors on Vercel
    $app->register(\Illuminate\Filesystem\FilesystemServiceProvider::class);
    $app->register(\Illuminate\View\ViewServiceProvider::class);

    $tmpPath = '/tmp/storage';
    if (!is_dir($tmpPath)) {
        @mkdir($tmpPath, 0777, true);
        @mkdir($tmpPath . '/framework/sessions', 0777, true);
        @mkdir($tmpPath . '/framework/views', 0777, true);
        @mkdir($tmpPath . '/framework/cache', 0777, true);
        @mkdir($tmpPath . '/framework/cache/data', 0777, true);
        @mkdir($tmpPath . '/app/public', 0777, true);
        @mkdir($tmpPath . '/logs', 0777, true);
    }
    $app->useStoragePath($tmpPath);
}

return $app;
