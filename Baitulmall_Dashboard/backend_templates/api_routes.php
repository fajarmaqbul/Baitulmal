<?php

use App\Http\Controllers\API\AsnafController;
use App\Http\Controllers\API\RTController;
use App\Http\Controllers\API\MuzakiController;
use App\Http\Controllers\API\ZakatFitrahController;
use App\Http\Controllers\API\DistribusiController;
use Illuminate\Support\Facades\Route;

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
    
    // ========== RTs (Neighborhood Units) ==========
    Route::get('rts', [RTController::class, 'index']);
    Route::get('rts/{id}', [RTController::class, 'show']);
    Route::post('rts', [RTController::class, 'store']);
    Route::put('rts/{id}', [RTController::class, 'update']);
    Route::delete('rts/{id}', [RTController::class, 'destroy']);
    Route::get('rts/{id}/asnaf', [RTController::class, 'getAsnaf']);

    // ========== Asnaf (Zakat Recipients) ==========
    Route::get('asnaf', [AsnafController::class, 'index']); // Supports ?kategori=Fakir&rt_id=1&tahun=2026
    Route::get('asnaf/statistics', [AsnafController::class, 'statistics']); // Summary stats
    Route::get('asnaf/map', [AsnafController::class, 'mapData']); // Map visualization data
    Route::get('asnaf/{id}', [AsnafController::class, 'show']);
    Route::post('asnaf', [AsnafController::class, 'store']);
    Route::put('asnaf/{id}', [AsnafController::class, 'update']);
    Route::delete('asnaf/{id}', [AsnafController::class, 'destroy']);

    // ========== Muzaki (Zakat Payers) ==========
    Route::apiResource('muzaki', MuzakiController::class);

    // ========== Zakat Fitrah Transactions ==========
    Route::get('zakat-fitrah', [ZakatFitrahController::class, 'index']);
    Route::post('zakat-fitrah', [ZakatFitrahController::class, 'store']);
    Route::get('zakat-fitrah/{id}', [ZakatFitrahController::class, 'show']);
    Route::put('zakat-fitrah/{id}', [ZakatFitrahController::class, 'update']);
    Route::delete('zakat-fitrah/{id}', [ZakatFitrahController::class, 'destroy']);
    
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
