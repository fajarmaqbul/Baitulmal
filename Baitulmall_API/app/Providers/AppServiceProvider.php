<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('database.default') === 'sqlite') {
            \Illuminate\Support\Facades\DB::connection('sqlite')->getPdo()->exec('PRAGMA journal_mode=WAL;');
            \Illuminate\Support\Facades\DB::connection('sqlite')->getPdo()->exec('PRAGMA synchronous=NORMAL;');
        }
    }
}
