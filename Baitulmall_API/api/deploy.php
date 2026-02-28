<?php
// Native Vercel bridge to run Artisan commands

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;

if (!isset($_GET['token']) || $_GET['token'] !== 'BAITULMALL_DEPLOY_2026') {
    header('HTTP/1.1 401 Unauthorized');
    echo "Unauthorized";
    exit;
}

$step = $_GET['step'] ?? 'migrate';

try {
    if ($step === 'migrate') {
        Artisan::call('migrate', ['--force' => true]);
        echo json_encode(['status' => 'success', 'step' => 'migrate', 'output' => Artisan::output()]);
        
    } elseif ($step === 'seed-direct') {
        $output = [];
        
        // Create admin users directly (no factory/fake())
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@baitulmall.com'],
            ['name' => 'Admin Baitulmall', 'password' => Hash::make('password123'), 'remember_token' => \Illuminate\Support\Str::random(10)]
        );
        \App\Models\User::firstOrCreate(
            ['email' => 'fajarmaqbulkandri@gmail.com'],
            ['name' => 'Fajar Maqbul', 'password' => Hash::make('Kandri2026!'), 'remember_token' => \Illuminate\Support\Str::random(10)]
        );
        $output[] = "Users created";

        // Run each seeder individually
        $seeders = ['RTSeeder', 'AsnafSeeder', 'SDMSeeder', 'SignatureSeeder', 'ZakatFitrahSeeder', 'SettingSeeder', 'TransactionalDataSeeder', 'UserAccountSeeder'];
        foreach ($seeders as $seeder) {
            try {
                Artisan::call('db:seed', ['--class' => $seeder, '--force' => true]);
                $output[] = "$seeder: OK - " . trim(Artisan::output());
            } catch (\Exception $e) {
                $output[] = "$seeder: ERROR - " . $e->getMessage();
            }
        }

        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'step' => 'seed-direct', 'output' => $output]);
        
    } else {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => "Unknown step: $step"]);
    }
} catch (\Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => $e->getMessage(), 'trace' => substr($e->getTraceAsString(), 0, 1000)]);
}
