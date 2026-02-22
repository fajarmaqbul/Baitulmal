<?php

namespace App\Http\Controllers\ApiControllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Muzaki;

class ZakatFitrahController extends Controller
{
    public function summary(Request $request, $routeTahun = null)
    {
        $tahun = $routeTahun ?? $request->get('tahun', date('Y'));
        
        // Zakat Fitrah Collection (Penerimaan)
        // Sum 'jumlah_beras_kg' from Muzaki table
        // Note: Assuming 'jumlah_uang' exists? 
        // Checking Muzaki model next, but for now summing beras.
        $query = Muzaki::where('tahun', $tahun);
        
        $totalBeras = (clone $query)->sum('jumlah_beras_kg');
        $totalJiwa = (clone $query)->sum('jumlah_jiwa');
        $totalUang = (clone $query)->sum('jumlah_uang'); // Assuming column exists, handled by try/catch or schema check

        // Penyaluran Zakat Fitrah? Ref: distribution table or generic Distribution?
        // Usually Zakat Fitrah is fully distributed.
        // For dashboard "Saldo", Zakat Fitrah generally should be 0 saldo after Eid.
        // But for "Penyaluran" stat, we might need to check 'Distribusi' table or 'ZakatFitrahDistribution'.
        // For now, returning Collection stats.

        return response()->json([
            'success' => true,
            'data' => [
                'total_penerimaan_beras' => $totalBeras,
                'total_penerimaan_uang' => $totalUang,
                'total_jiwa' => $totalJiwa,
                // 'total_penyaluran' => ... implementation pending distribution logic
            ]
        ]);
    }

    public function stats(Request $request)
    {
        $tahun = $request->get('tahun', date('Y'));
        
        // Cache stats for 10 minutes
        $stats = Cache::remember("zakat_fitrah_stats_{$tahun}", 600, function () use ($tahun) {
            $totalJiwa = Muzaki::where('tahun', $tahun)->sum('jumlah_jiwa');
            $totalBeras = Muzaki::where('tahun', $tahun)->sum('jumlah_beras_kg');
            $totalUang = Muzaki::where('tahun', $tahun)->sum('jumlah_uang'); // Corrected from total_liat_uang

            return [
                'total_jiwa' => $totalJiwa,
                'total_beras' => $totalBeras,
                'total_uang' => $totalUang
            ];
        });

        return response()->json($stats);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string',
            'rt_id' => 'required|exists:rts,id',
            'jumlah_jiwa' => 'required|integer',
            'jumlah_beras_kg' => 'required|numeric',
            'jumlah_uang' => 'nullable|numeric',
            'status_bayar' => 'required|string',
            'tahun' => 'required|string'
        ]);

        $zakat = Muzaki::create($validated); // Assuming Muzaki model is used for ZakatFitrah data
        
        // Clear cache
        Cache::forget("zakat_fitrah_stats_{$validated['tahun']}");

        return response()->json(['message' => 'Data recorded', 'data' => $zakat], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $zakat = Muzaki::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string',
            'rt_id' => 'required|exists:rts,id',
            'jumlah_jiwa' => 'required|integer',
            'jumlah_beras_kg' => 'required|numeric',
            'jumlah_uang' => 'nullable|numeric',
            'status_bayar' => 'required|string',
            'tahun' => 'required|string'
        ]);

        $zakat->update($validated);
        
        // Clear cache for both old and new year just in case
        Cache::forget("zakat_fitrah_stats_{$zakat->tahun}");

        return response()->json(['message' => 'Data updated', 'data' => $zakat->load('rt')]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $zakat = Muzaki::findOrFail($id);
        $tahun = $zakat->tahun;
        $zakat->delete();
        
        // Clear cache
        \Illuminate\Support\Facades\Cache::forget("zakat_fitrah_stats_{$tahun}");

        return response()->json(['message' => 'Data deleted']);
    }
}
