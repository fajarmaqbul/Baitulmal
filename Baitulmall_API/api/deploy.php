<?php
// Native Vercel bridge - v2.1 (Direct PDO + Laravel bootstrap)
require __DIR__ . '/../vendor/autoload.php';

if (!isset($_GET['token']) || $_GET['token'] !== 'BAITULMALL_DEPLOY_2026') {
    header('HTTP/1.1 401 Unauthorized');
    echo 'Unauthorized';
    exit;
}

// Load .env manually
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

$step = $_GET['step'] ?? 'status';

header('Content-Type: application/json');

// Build DSN from environment
$dbUrl = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL') ?? '';
$host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 'localhost';
$port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?? '5432';
$dbname = $_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE') ?? $_ENV['SUPABASE_DB_DATABASE'] ?? getenv('SUPABASE_DB_DATABASE') ?? 'postgres';
$user = $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?? 'postgres';
$pass = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?? '';

try {
    // Try DATABASE_URL first (Supabase format)
    if ($dbUrl) {
        $pdo = new PDO($dbUrl, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    } else {
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
        $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    }

    if ($step === 'status') {
        $users  = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $asnaf  = $pdo->query("SELECT COUNT(*) FROM asnaf")->fetchColumn();
        $muzaki = $pdo->query("SELECT COUNT(*) FROM muzaki")->fetchColumn();
        echo json_encode(['status' => 'ok', 'users' => (int)$users, 'asnaf' => (int)$asnaf, 'muzaki' => (int)$muzaki]);

    } elseif ($step === 'seed-direct') {
        // Bootstrap Laravel properly for Artisan
        $app = require_once __DIR__ . '/../bootstrap/app.php';
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
        $kernel->bootstrap();

        $results = [];

        // Create admin users directly
        $now = date('Y-m-d H:i:s');
        $token = bin2hex(random_bytes(20));
        $adminPwd = password_hash('password123', PASSWORD_BCRYPT);
        $fajarPwd = password_hash('Kandri2026!', PASSWORD_BCRYPT);

        $pdo->exec("INSERT INTO users (name, email, password, remember_token, created_at, updated_at)
            VALUES ('Admin Baitulmall', 'admin@baitulmall.com', '$adminPwd', '$token', '$now', '$now')
            ON CONFLICT (email) DO NOTHING");
        $pdo->exec("INSERT INTO users (name, email, password, remember_token, created_at, updated_at)
            VALUES ('Fajar Maqbul', 'fajarmaqbulkandri@gmail.com', '$fajarPwd', '$token', '$now', '$now')
            ON CONFLICT (email) DO NOTHING");
        $results[] = 'Admin users: OK';

        // Run seeders via Artisan
        $seeders = ['RTSeeder', 'AsnafSeeder', 'SDMSeeder', 'SignatureSeeder', 'ZakatFitrahSeeder', 'SettingSeeder', 'TransactionalDataSeeder', 'UserAccountSeeder'];
        foreach ($seeders as $seeder) {
            try {
                \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => $seeder, '--force' => true]);
                $out = trim(\Illuminate\Support\Facades\Artisan::output());
                $results[] = "$seeder: OK" . ($out ? " | $out" : '');
            } catch (\Throwable $e) {
                $results[] = "$seeder: ERROR - " . $e->getMessage();
            }
        }

        echo json_encode(['status' => 'success', 'step' => 'seed-direct', 'results' => $results]);

    } else {
        echo json_encode(['status' => 'error', 'message' => "Unknown step: $step"]);
    }

} catch (\Throwable $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage(),
        'file'    => basename($e->getFile()),
        'line'    => $e->getLine(),
        'env_check' => [
            'has_db_url' => !empty($dbUrl),
            'host' => $host,
            'dbname' => $dbname,
        ]
    ]);
}
