<?php

use App\Http\Controllers\ApiControllers\AsnafController;
use App\Http\Controllers\ApiControllers\RTController;
use App\Http\Controllers\ApiControllers\MuzakiController;
use App\Http\Controllers\ApiControllers\ZakatFitrahController;
use App\Http\Controllers\ApiControllers\DistribusiController;
use App\Http\Controllers\ApiControllers\SedekahController;
use App\Http\Controllers\ApiControllers\SantunanController;
use App\Http\Controllers\ApiControllers\EventController;
use App\Http\Controllers\ApiControllers\AgendaController;
use App\Http\Controllers\ApiControllers\AgendaPostController;
use App\Http\Controllers\ApiControllers\AuthController;
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
    // Minimal test route
    Route::get('test', function () {
        return response()->json(['status' => 'ok', 'php_version' => PHP_VERSION]);
    });

    // #region agent log
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
        Route::apiResource('users', \App\Http\Controllers\ApiControllers\UserController::class);
        
        // Product Management
        Route::post('products', [\App\Http\Controllers\ApiControllers\ProductController::class, 'store']);
        Route::post('products/{id}', [\App\Http\Controllers\ApiControllers\ProductController::class, 'update']); 
        Route::put('products/{id}', [\App\Http\Controllers\ApiControllers\ProductController::class, 'update']);
        Route::delete('products/{id}', [\App\Http\Controllers\ApiControllers\ProductController::class, 'destroy']);
    });
    
    // ========== Notifications ==========
    Route::get('notifications', [\App\Http\Controllers\ApiControllers\NotificationController::class, 'index']);

    // ========== RTs (Neighborhood Units) ==========
    Route::get('rts', [RTController::class, 'index']);
    Route::get('rts/{id}', [RTController::class, 'show']);
    Route::post('rts', [RTController::class, 'store']);
    Route::put('rts/{id}', [RTController::class, 'update']);
    Route::delete('rts/{id}', [RTController::class, 'destroy']);
    Route::get('rts/{id}/asnaf', [RTController::class, 'getAsnaf']);

    // ========== Asnaf (Zakat Recipients) ==========
    Route::post('asnaf/recalculate', [AsnafController::class, 'recalculateScores']);
    Route::get('asnaf', [AsnafController::class, 'index']);
    Route::get('asnaf/statistics', [AsnafController::class, 'statistics']); 
    Route::get('asnaf/map', [AsnafController::class, 'mapData']); 
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
    Route::apiResource('zakat-mall', \App\Http\Controllers\ApiControllers\ZakatMallController::class);
    
    // Special endpoints
    Route::get('zakat-fitrah/summary/{tahun}', [ZakatFitrahController::class, 'summary']);
    Route::get('zakat-fitrah/by-rt/{tahun}', [ZakatFitrahController::class, 'byRT']);

    // ========== Distribusi (Distribution) ==========
    Route::get('distribusi', [DistribusiController::class, 'index']);
    Route::post('distribusi', [DistribusiController::class, 'store']);
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
    Route::get('santunan/activities', [SantunanController::class, 'getActivities']);
    Route::apiResource('santunan-donations', \App\Http\Controllers\ApiControllers\SantunanDonationController::class);
    Route::apiResource('santunan/beneficiaries', \App\Http\Controllers\ApiControllers\SantunanBeneficiaryController::class);
    Route::apiResource('sedekah', SedekahController::class);
    Route::apiResource('santunan', SantunanController::class);

    // ========== SDM (Human Resources) ==========
    Route::apiResource('people', \App\Http\Controllers\ApiControllers\PersonController::class);
    Route::apiResource('structures', \App\Http\Controllers\ApiControllers\OrganizationStructureController::class);
    Route::apiResource('assignments', \App\Http\Controllers\ApiControllers\AssignmentController::class);

    // Alias view kepengurusan
    Route::get('kepengurusan', [\App\Http\Controllers\ApiControllers\AssignmentController::class, 'kepengurusanView']);
    
    // Document Signer
    Route::get('signers/active', [\App\Http\Controllers\ApiControllers\AssignmentController::class, 'getActiveSigner']);
    Route::get('active-signer', [\App\Http\Controllers\ApiControllers\AssignmentController::class, 'getActiveSigner']);

    // ========== Inventory (Manajemen Aset) ==========
    Route::apiResource('assets', \App\Http\Controllers\ApiControllers\AssetController::class);
    Route::get('loans', [\App\Http\Controllers\ApiControllers\AssetLoanController::class, 'index']);
    Route::post('loans', [\App\Http\Controllers\ApiControllers\AssetLoanController::class, 'loan']);
    Route::post('loans/{id}/return', [\App\Http\Controllers\ApiControllers\AssetLoanController::class, 'returnLoan']);

    // ========== Crowdfunding & Donasi Tematik ==========
    Route::apiResource('campaigns', \App\Http\Controllers\ApiControllers\CrowdfundingController::class);
    Route::post('donations', [\App\Http\Controllers\ApiControllers\CrowdfundingController::class, 'donate']);

    // ========== Event Assignments ==========
    Route::get('event-assignments', [\App\Http\Controllers\ApiControllers\AssignmentController::class, 'index']);
    Route::post('event-assignments', [\App\Http\Controllers\ApiControllers\AssignmentController::class, 'store']);
    Route::put('event-assignments/{id}', [\App\Http\Controllers\ApiControllers\AssignmentController::class, 'update']);
    Route::delete('event-assignments/{id}', [\App\Http\Controllers\ApiControllers\AssignmentController::class, 'destroy']);

    // ========== Settings ==========
    Route::apiResource('settings', \App\Http\Controllers\ApiControllers\SettingController::class);

    // ========== Events & Agendas ==========
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::get('/events/{id}', [EventController::class, 'show']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    Route::post('/agendas', [AgendaController::class, 'store']);
    Route::post('/agendas/{id}/assign', [AgendaController::class, 'assignPerson']);
    Route::delete('/assignments/{id}', [AgendaController::class, 'removeAssignment']);
    
    // ========== Agenda Posts ==========
    Route::apiResource('agenda-posts', AgendaPostController::class);
    Route::post('agenda-posts/{id}/assign', [AgendaPostController::class, 'assignPerson']);

    // ========== Signature Rules ==========
    Route::get('signers', [\App\Http\Controllers\ApiControllers\SignatureController::class, 'getSigners']);
    Route::post('signers', [\App\Http\Controllers\ApiControllers\SignatureController::class, 'createSigner']);
    Route::put('signers/{id}', [\App\Http\Controllers\ApiControllers\SignatureController::class, 'updateSigner']);
    Route::delete('signers/{id}', [\App\Http\Controllers\ApiControllers\SignatureController::class, 'deleteSigner']);

    Route::get('signature-rules', [\App\Http\Controllers\ApiControllers\SignatureController::class, 'getRules']);
    Route::post('signature-rules', [\App\Http\Controllers\ApiControllers\SignatureController::class, 'createRule']);
    Route::put('signature-rules/{id}', [\App\Http\Controllers\ApiControllers\SignatureController::class, 'updateRule']);
    Route::delete('signature-rules/{id}', [\App\Http\Controllers\ApiControllers\SignatureController::class, 'deleteRule']);
    
    Route::post('resolve-signature', [\App\Http\Controllers\ApiControllers\SignatureController::class, 'resolveSignature']);

    // ========== Zakat Calculator ==========
    Route::get('gold-price', [\App\Http\Controllers\ApiControllers\ZakatCalculatorController::class, 'getPrice']);
    Route::post('gold-price', [\App\Http\Controllers\ApiControllers\ZakatCalculatorController::class, 'updatePrice']);
    Route::post('zakat-calculator/calculate', [\App\Http\Controllers\ApiControllers\ZakatCalculatorController::class, 'calculate']);
    Route::post('zakat-calculator/save', [\App\Http\Controllers\ApiControllers\ZakatCalculatorController::class, 'save']);
    Route::get('zakat-calculator/history/{muzakiId}', [\App\Http\Controllers\ApiControllers\ZakatCalculatorController::class, 'history']);
    Route::get('zakat-calculator/export/{muzakiId}', [\App\Http\Controllers\ApiControllers\ZakatCalculatorController::class, 'exportPdf']);

    // ========== Smart AI Assistant ==========
    Route::post('ai/chat', [\App\Http\Controllers\ApiControllers\SmartAssistantController::class, 'chat']);
    Route::post('ai/event-generate', [\App\Http\Controllers\ApiControllers\SmartAssistantController::class, 'generateEventData']);

    // ========== Secretariat ==========
    Route::apiResource('correspondences', \App\Http\Controllers\ApiControllers\CorrespondenceController::class);
    Route::post('correspondences/generate', [\App\Http\Controllers\ApiControllers\CorrespondenceController::class, 'generate']);
    Route::post('correspondences/{id}/export-google', [\App\Http\Controllers\ApiControllers\CorrespondenceController::class, 'exportToGoogleDoc']);
    
    // ========== Etalase UMKM ==========
    Route::get('products-public', [\App\Http\Controllers\ApiControllers\ProductController::class, 'index']);
    Route::get('products-public/{id}', [\App\Http\Controllers\ApiControllers\ProductController::class, 'show']);

    // ========== Santunan Kematian ==========
    Route::post('death-events', [\App\Http\Controllers\ApiControllers\DeathEventController::class, 'store']);

    // ========== AI Features ==========
    Route::post('ai/generate-description', [\App\Http\Controllers\ApiControllers\AIController::class, 'generateDescription']);
});
