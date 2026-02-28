<?php
// Native Vercel bridge - runs BEFORE Laravel routing
require __DIR__ . '/../vendor/autoload.php';

if (!isset($_GET['token']) || $_GET['token'] !== 'BAITULMALL_DEPLOY_2026') {
    header('HTTP/1.1 401 Unauthorized');
    echo 'Unauthorized';
    exit;
}

$app = require_once __DIR__ . '/../bootstrap/app.php';

// Boot via Console Kernel (not HTTP) so facades work
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$step = $_GET['step'] ?? 'status';

header('Content-Type: application/json');

try {
    if ($step === 'seed-direct') {
        $results = [];

        // Create admin users directly (no factory/fake())
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@baitulmall.com'],
            [
                'name' => 'Admin Baitulmall',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'remember_token' => \Illuminate\Support\Str::random(10)
            ]
        );
        \App\Models\User::firstOrCreate(
            ['email' => 'fajarmaqbulkandri@gmail.com'],
            [
                'name' => 'Fajar Maqbul',
                'password' => \Illuminate\Support\Facades\Hash::make('Kandri2026!'),
                'remember_token' => \Illuminate\Support\Str::random(10)
            ]
        );
        $results[] = 'Admin users: OK';

        // Run seeders one by one (no DatabaseSeeder to avoid UserFactory)
        $seeders = [
            'RTSeeder',
            'AsnafSeeder',
            'SDMSeeder',
            'SignatureSeeder',
            'ZakatFitrahSeeder',
            'SettingSeeder',
            'TransactionalDataSeeder',
            'UserAccountSeeder'
        ];

        foreach ($seeders as $seeder) {
            try {
                \Illuminate\Support\Facades\Artisan::call('db:seed', [
                    '--class' => $seeder,
                    '--force' => true
                ]);
                $out = trim(\Illuminate\Support\Facades\Artisan::output());
                $results[] = "$seeder: OK" . ($out ? " | $out" : '');
            } catch (\Throwable $e) {
                $results[] = "$seeder: ERROR - " . $e->getMessage();
            }
        }

        echo json_encode(['status' => 'success', 'step' => 'seed-direct', 'results' => $results]);

    } elseif ($step === 'migrate') {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        echo json_encode([
            'status' => 'success',
            'step' => 'migrate',
            'output' => \Illuminate\Support\Facades\Artisan::output()
        ]);

    } elseif ($step === 'migrate-fresh') {
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true]);
        echo json_encode([
            'status' => 'success',
            'step' => 'migrate-fresh',
            'output' => \Illuminate\Support\Facades\Artisan::output()
        ]);

    } elseif ($step === 'status') {
        echo json_encode([
            'status' => 'ok',
            'users'  => \App\Models\User::count(),
            'asnaf'  => \App\Models\Asnaf::count(),
            'muzaki' => \App\Models\Muzaki::count(),
        ]);

    } else {
        echo json_encode(['status' => 'error', 'message' => "Unknown step: $step"]);
    }

} catch (\Throwable $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage(),
        'file'    => basename($e->getFile()),
        'line'    => $e->getLine(),
    ]);
}
