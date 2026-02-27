<?php
// Native Vercel bridge to run Artisan commands

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Request;

if (isset($_GET['token']) && $_GET['token'] === 'BAITULMALL_DEPLOY_2026') {
    try {
        $output = "";
        
        Artisan::call('migrate', ['--force' => true]);
        $output .= "MIGRATION:\n" . Artisan::output() . "\n";
        
        Artisan::call('db:seed', ['--force' => true]);
        $output .= "SEEDING:\n" . Artisan::output() . "\n";
        
        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'output' => $output]);
    } catch (\Exception $e) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    header('HTTP/1.1 401 Unauthorized');
    echo "Unauthorized";
}
