<?php

use App\Http\Controllers\API\AsnafController;
use App\Http\Controllers\API\RTController;
use App\Http\Controllers\API\MuzakiController;
use App\Http\Controllers\API\ZakatFitrahController;
use App\Http\Controllers\API\DistribusiController;
use App\Http\Controllers\API\SedekahController;
use App\Http\Controllers\API\SantunanController;
use App\Http\Controllers\API\EventController;
use App\Http\Controllers\API\AgendaController;
use App\Http\Controllers\API\AgendaPostController;
use App\Http\Controllers\API\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| API Routes - Baitulmall Masjid Kandri
|--------------------------------------------------------------------------
|
| RESTful API routes for Baitulmall system
| Base URL: /api/v1
|
*/

Route::prefix('v1')->group(function () {

    // #region agent log
    // Debug-only ping endpoint to validate runtime logging wiring.
    // IMPORTANT: Do not log secrets/PII.
    Route::get('__debug/ping', function () {
        try {
            $workspaceRoot = \dirname(\base_path());
            $logDir = $workspaceRoot . DIRECTORY_SEPARATOR . '.cursor';
            if (!\is_dir($logDir)) {
                @\mkdir($logDir, 0777, true);
            }
            $logFile = $logDir . DIRECTORY_SEPARATOR . 'debug.log';

            $payload = [
                'sessionId' => 'debug-session',
                'runId' => 'auth-run-1',
                'hypothesisId' => 'PING',
                'location' => 'routes/api.php:__debug/ping',
                'message' => 'Debug ping hit',
                'data' => [
                    'app_env' => \config('app.env'),
                    'base_path' => \base_path(),
                    'workspace_root' => $workspaceRoot,
                ],
                'timestamp' => round(microtime(true) * 1000),
            ];

            @\file_put_contents($logFile, \json_encode($payload) . PHP_EOL, FILE_APPEND);
            Log::info('agent_debug', $payload);

            return response()->json(['ok' => true]);
        } catch (\Throwable $e) {
            Log::error('agent_debug_ping_failed', ['message' => $e->getMessage()]);
            return response()->json(['ok' => false], 500);
        }
    });
    // #endregion
    
    // ========== Authentication ==========
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        
        // User Management
        Route::get('users', [\App\Http\Controllers\API\UserController::class, 'index']);
        Route::put('users/{id}/role', [\App\Http\Controllers\API\UserController::class, 'updateRole']);
        Route::put('users/{id}', [\App\Http\Controllers\API\UserController::class, 'update']);

        // Product Management (Creating/Editing/Deleting is restricted)
        Route::post('products', [\App\Http\Controllers\API\ProductController::class, 'store']);
        Route::post('products/{id}', [\App\Http\Controllers\API\ProductController::class, 'update']); // Using POST for file upload support (method spoofing if needed) or just POST
        Route::put('products/{id}', [\App\Http\Controllers\API\ProductController::class, 'update']);
        Route::delete('products/{id}', [\App\Http\Controllers\API\ProductController::class, 'destroy']);
    });
    
    // ========== Notifications ==========
    Route::get('notifications', [\App\Http\Controllers\API\NotificationController::class, 'index']);

    // ========== RTs (Neighborhood Units) ==========
    Route::get('rts', [RTController::class, 'index']);
    Route::get('rts/{id}', [RTController::class, 'show']);
    Route::post('rts', [RTController::class, 'store']);
    Route::put('rts/{id}', [RTController::class, 'update']);
    Route::delete('rts/{id}', [RTController::class, 'destroy']);
    Route::get('rts/{id}/asnaf', [RTController::class, 'getAsnaf']);

    // ========== Asnaf (Zakat Recipients) ==========
    Route::post('asnaf/recalculate', [AsnafController::class, 'recalculateScores']);
    Route::get('asnaf', [AsnafController::class, 'index']); // Supports ?kategori=Fakir&rt_id=1&tahun=2026
    Route::get('asnaf/statistics', [AsnafController::class, 'statistics']); // Summary stats
    Route::get('asnaf/map', [AsnafController::class, 'mapData']); // Map visualization data
    Route::get('asnaf/{id}', [AsnafController::class, 'show']);
    Route::post('asnaf', [AsnafController::class, 'store']);
    Route::put('asnaf/{id}', [AsnafController::class, 'update']);
    Route::delete('asnaf/{id}', [AsnafController::class, 'destroy']);

    // ========== Muzaki (Zakat Payers) ==========
    Route::get('muzaki/stats', [MuzakiController::class, 'stats']);
    Route::apiResource('muzaki', MuzakiController::class);

    // ========== Zakat Fitrah Transactions ==========
    Route::get('zakat-fitrah', [ZakatFitrahController::class, 'index']);
    Route::post('zakat-fitrah', [ZakatFitrahController::class, 'store']);
    Route::get('zakat-fitrah/{id}', [ZakatFitrahController::class, 'show']);
    Route::put('zakat-fitrah/{id}', [ZakatFitrahController::class, 'update']);
    Route::delete('zakat-fitrah/{id}', [ZakatFitrahController::class, 'destroy']);
    
    // ========== Zakat Mall Transactions ==========
    Route::apiResource('zakat-mall', \App\Http\Controllers\API\ZakatMallController::class);
    
    // Special endpoints
    Route::get('zakat-fitrah/summary/{tahun}', [ZakatFitrahController::class, 'summary']); // Collection summary
    Route::get('zakat-fitrah/by-rt/{tahun}', [ZakatFitrahController::class, 'byRT']); // Grouped by RT

    // ========== Distribusi (Distribution) ==========
    Route::get('distribusi', [DistribusiController::class, 'index']);
    Route::post('distribusi', [DistribusiController::class, 'store']); // Create distribution plan
    Route::get('distribusi/{id}', [DistribusiController::class, 'show']);
    Route::put('distribusi/{id}', [DistribusiController::class, 'update']);
    Route::delete('distribusi/{id}', [DistribusiController::class, 'destroy']);
    
    // Workflow endpoints
    Route::post('distribusi/{id}/mark-distributed', [DistribusiController::class, 'markAsDistributed']);
    Route::post('distribusi/{id}/mark-verified', [DistribusiController::class, 'markAsVerified']);
    Route::get('distribusi/summary/{tahun}', [DistribusiController::class, 'summary']);
    Route::get('distribusi/recommendations/{tahun}', [DistribusiController::class, 'recommendations']);

    // ========== Sedekah & Santunan ==========
    Route::get('sedekah/summary', [SedekahController::class, 'summary']);
    Route::get('santunan/summary', [SantunanController::class, 'summary']);
    Route::get('santunan/activities', [SantunanController::class, 'getActivities']); // New endpoint
    Route::apiResource('santunan-donations', \App\Http\Controllers\API\SantunanDonationController::class);
    Route::apiResource('santunan/beneficiaries', \App\Http\Controllers\API\SantunanBeneficiaryController::class); // Specific route first
    Route::apiResource('sedekah', SedekahController::class);
    Route::apiResource('santunan', SantunanController::class); // Wildcard route last

    // ========== SDM (Human Resources) ==========
    // ========== SDM (Human Resources) ==========
    Route::apiResource('people', \App\Http\Controllers\API\PersonController::class);
    Route::apiResource('structures', \App\Http\Controllers\API\OrganizationStructureController::class);
    Route::apiResource('assignments', \App\Http\Controllers\API\AssignmentController::class);

    // Alias view kepengurusan (READ ONLY)
    Route::get('kepengurusan', [\App\Http\Controllers\API\AssignmentController::class, 'kepengurusanView']);
    
    // Document Signer
    Route::get('signers/active', [\App\Http\Controllers\API\AssignmentController::class, 'getActiveSigner']);
    Route::get('active-signer', [\App\Http\Controllers\API\AssignmentController::class, 'getActiveSigner']);

    // ========== Inventory (Manajemen Aset) ==========
    Route::apiResource('assets', \App\Http\Controllers\API\AssetController::class);
    Route::get('loans', [\App\Http\Controllers\API\AssetLoanController::class, 'index']);
    Route::post('loans', [\App\Http\Controllers\API\AssetLoanController::class, 'loan']);
    Route::post('loans/{id}/return', [\App\Http\Controllers\API\AssetLoanController::class, 'returnLoan']);

    // ========== Crowdfunding & Donasi Tematik ==========
    Route::apiResource('campaigns', \App\Http\Controllers\API\CrowdfundingController::class);
    Route::post('donations', [\App\Http\Controllers\API\CrowdfundingController::class, 'donate']);

    // ========== Events (Project-based Organizations) ==========


    // ========== Event Assignments (Team Management) ==========
    // Specifically for managing people in an event
    Route::get('event-assignments', [\App\Http\Controllers\API\AssignmentController::class, 'index']); // Use filter structure_id
    Route::post('event-assignments', [\App\Http\Controllers\API\AssignmentController::class, 'store']);
    Route::put('event-assignments/{id}', [\App\Http\Controllers\API\AssignmentController::class, 'update']);
    Route::delete('event-assignments/{id}', [\App\Http\Controllers\API\AssignmentController::class, 'destroy']);

    // ========== Settings ==========
    // ========== Settings ==========
    Route::apiResource('settings', \App\Http\Controllers\API\SettingController::class);
    // ========== Events & Agendas ==========
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::get('/events/{id}', [EventController::class, 'show']); # Includes Agendas
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    Route::post('/agendas', [AgendaController::class, 'store']);
    Route::post('/agendas/{id}/assign', [AgendaController::class, 'assignPerson']);
    Route::delete('/assignments/{id}', [AgendaController::class, 'removeAssignment']);
    
    // ========== Agenda Posts (WordPress Style) ==========
    Route::apiResource('agenda-posts', AgendaPostController::class);
    Route::post('agenda-posts/{id}/assign', [AgendaPostController::class, 'assignPerson']);

    // ========== Signature Rules ==========
    Route::get('signers', [\App\Http\Controllers\API\SignatureController::class, 'getSigners']);
    Route::post('signers', [\App\Http\Controllers\API\SignatureController::class, 'createSigner']);
    Route::put('signers/{id}', [\App\Http\Controllers\API\SignatureController::class, 'updateSigner']);
    Route::delete('signers/{id}', [\App\Http\Controllers\API\SignatureController::class, 'deleteSigner']);

    Route::get('signature-rules', [\App\Http\Controllers\API\SignatureController::class, 'getRules']);
    Route::post('signature-rules', [\App\Http\Controllers\API\SignatureController::class, 'createRule']);
    Route::put('signature-rules/{id}', [\App\Http\Controllers\API\SignatureController::class, 'updateRule']);
    Route::delete('signature-rules/{id}', [\App\Http\Controllers\API\SignatureController::class, 'deleteRule']);
    
    Route::post('resolve-signature', [\App\Http\Controllers\API\SignatureController::class, 'resolveSignature']);

    // ========== Zakat Calculator ==========
    Route::get('gold-price', [\App\Http\Controllers\API\ZakatCalculatorController::class, 'getPrice']);
    Route::post('gold-price', [\App\Http\Controllers\API\ZakatCalculatorController::class, 'updatePrice']);
    Route::post('zakat-calculator/calculate', [\App\Http\Controllers\API\ZakatCalculatorController::class, 'calculate']);
    Route::post('zakat-calculator/save', [\App\Http\Controllers\API\ZakatCalculatorController::class, 'save']);
    Route::get('zakat-calculator/history/{muzakiId}', [\App\Http\Controllers\API\ZakatCalculatorController::class, 'history']);
    Route::get('zakat-calculator/export/{muzakiId}', [\App\Http\Controllers\API\ZakatCalculatorController::class, 'exportPdf']);

    // ========== Smart AI Assistant ==========
    Route::post('ai/chat', [\App\Http\Controllers\API\SmartAssistantController::class, 'chat']);
    Route::post('ai/event-generate', [\App\Http\Controllers\API\SmartAssistantController::class, 'generateEventData']);

    // ========== Secretariat (Correspondence) ==========
    Route::apiResource('correspondences', \App\Http\Controllers\API\CorrespondenceController::class);
    Route::post('correspondences/generate', [\App\Http\Controllers\API\CorrespondenceController::class, 'generate']);
    Route::post('correspondences/{id}/export-google', [\App\Http\Controllers\API\CorrespondenceController::class, 'exportToGoogleDoc']);
    // ========== Etalase UMKM ==========
    // ========== Etalase UMKM (Modified for Public Access) ==========
    Route::get('products', [\App\Http\Controllers\API\ProductController::class, 'index']);
    Route::get('products/{id}', [\App\Http\Controllers\API\ProductController::class, 'show']);

    // ========== Santunan Kematian (Death Events) ==========
    Route::post('death-events', [\App\Http\Controllers\API\DeathEventController::class, 'store']);

    // ========== AI Features ==========
    Route::post('ai/generate-description', [\App\Http\Controllers\AIController::class, 'generateDescription']);
});

/*
|--------------------------------------------------------------------------
| Example Usage (from React Frontend)
|--------------------------------------------------------------------------
|
| // Get all Asnaf for map
| axios.get('/api/v1/asnaf/map?tahun=2026')
|
| // Get filtered Asnaf
| axios.get('/api/v1/asnaf?kategori=Fakir&rt_id=1&tahun=2026&per_page=50')
|
| // Create new Asnaf
| axios.post('/api/v1/asnaf', {
|   rt_id: 1,
|   nama: 'Bariyah',
|   kategori: 'Fakir',
|   jumlah_jiwa: 2,
|   tahun: 2026,
|   latitude: -7.042083,
|   longitude: 110.351722
| })
|
| // Get statistics
| axios.get('/api/v1/asnaf/statistics?tahun=2026')
|
*/
