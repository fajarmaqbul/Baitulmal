<?php
// Native Vercel bridge - v2.3 (Bypass DATABASE_URL format issues)
require __DIR__ . '/../vendor/autoload.php';

if (!isset($_GET['token']) || $_GET['token'] !== 'BAITULMALL_DEPLOY_2026') {
    header('HTTP/1.1 401 Unauthorized');
    echo 'Unauthorized';
    exit;
}

// Load .env manually
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

header('Content-Type: application/json');

function get_pdo() {
    $dbUrl = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL') ?? '';
    
    if ($dbUrl && (str_starts_with($dbUrl, 'postgres://') || str_starts_with($dbUrl, 'postgresql://'))) {
        // Parse DATABASE_URL: postgres://user:pass@host:port/dbname
        $parsedUrl = parse_url($dbUrl);
        $host = $parsedUrl['host'];
        $port = $parsedUrl['port'] ?? '5432';
        $user = $parsedUrl['user'];
        $pass = $parsedUrl['pass'];
        $dbname = ltrim($parsedUrl['path'], '/');
        
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
        return new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    }

    $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 'localhost';
    $port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?? '5432';
    $dbname = $_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE') ?? $_ENV['SUPABASE_DB_DATABASE'] ?? 'postgres';
    $user = $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?? 'postgres';
    $pass = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?? '';
    
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    return new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
}

$step = $_GET['step'] ?? 'status';

try {
    $pdo = get_pdo();

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

        // Admin users via PDO to ensure it works even if models are broken
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

        $seeders = ['RTSeeder', 'AsnafSeeder', 'SDMSeeder', 'SignatureSeeder', 'ZakatFitrahSeeder', 'SettingSeeder', 'TransactionalDataSeeder', 'UserAccountSeeder', 'NewUsersSeeder'];
        foreach ($seeders as $seeder) {
            try {
                \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => $seeder, '--force' => true]);
                $results[] = "$seeder: OK";
            } catch (\Throwable $e) {
                $results[] = "$seeder: ERROR - " . $e->getMessage();
            }
        }

        echo json_encode($results);
        exit;
    } elseif ($step === 'migrate-fresh') {
        $app = require_once __DIR__ . '/../bootstrap/app.php';
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
        $kernel->bootstrap();
        
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        \Illuminate\Support\Facades\Artisan::call('db:wipe', ['--force' => true]);
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
        
        echo json_encode(['status' => 'success', 'output' => \Illuminate\Support\Facades\Artisan::output()]);
    }

} catch (\Throwable $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage(),
        'file'    => basename($e->getFile()),
        'line'    => $e->getLine()
    ]);
}
