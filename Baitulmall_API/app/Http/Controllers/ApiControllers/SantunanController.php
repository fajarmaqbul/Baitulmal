<?php

namespace App\Http\Controllers\ApiControllers;

use App\Http\Controllers\Controller;
use App\Models\Santunan;
use Illuminate\Http\Request;

class SantunanController extends Controller
{
    public function index(Request $request)
    {
        $query = Santunan::with('rt');

        if ($request->has('tahun')) {
            $query->where('tahun', $request->tahun);
        }

        return response()->json($query->paginate($request->get('per_page', 50)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_anak' => 'required|string',
            'rt_id' => 'required|exists:rts,id',
            'beneficiary_id' => [
                'nullable',
                'exists:santunan_beneficiaries,id',
                function ($attribute, $value, $fail) {
                    $beneficiary = \App\Models\SantunanBeneficiary::find($value);
                    if ($beneficiary && !$beneficiary->is_active) {
                        $fail('Beneficiary is inactive and cannot receive funds.');
                    }
                },
            ],
            'besaran' => 'required|numeric',
            'status_penerimaan' => 'required|in:sudah,belum',
            'tanggal_distribusi' => 'nullable|date',
            'tahun' => 'required|integer',
            'activity_id' => 'nullable|exists:santunan_activities,id',
            'kategori' => 'required|in:yatim,dhuafa,kematian',
        ]);

        // AUDIT GUARD: Check Saldo Capability
        // 1. Calculate Available Funds (Penerimaan)
        $penerimaanQuery = \App\Models\SantunanDonation::where('tahun', $request->tahun);
        if ($request->activity_id) $penerimaanQuery->where('activity_id', $request->activity_id);
        $totalPenerimaan = $penerimaanQuery->sum('jumlah');

        // 2. Calculate Existing Usage (Penyaluran so far)
        $penyaluranQuery = Santunan::where('tahun', $request->tahun)->where('status_penerimaan', 'sudah');
        if ($request->activity_id) $penyaluranQuery->where('activity_id', $request->activity_id);
        $totalUsed = $penyaluranQuery->sum('besaran');

        // 3. Validate if new request exceeds limit
        // Only validate financial impact if status is 'sudah' (disbursed)
        if ($request->status_penerimaan === 'sudah') {
            if (($totalUsed + $request->besaran) > $totalPenerimaan) {
                return response()->json([
                    'message' => 'AUDIT FAILURE: Insufficient Saldo. Distribution exceeds available funds.',
                    'errors' => [
                        'besaran' => ["Available: " . number_format($totalPenerimaan - $totalUsed) . ". Requested: " . number_format($request->besaran)]
                    ]
                ], 422);
            }
        }

        $santunan = Santunan::create($validated);

        return response()->json([
            'message' => 'Santunan record created successfully',
            'data' => $santunan->load(['rt', 'beneficiary'])
        ], 201);
    }
    
    public function update(Request $request, $id)
    {
        $santunan = Santunan::findOrFail($id);
        $validated = $request->validate([
            'nama_anak' => 'sometimes|string',
            'rt_id' => 'sometimes|exists:rts,id',
            'beneficiary_id' => [
                'nullable',
                'exists:santunan_beneficiaries,id',
                function ($attribute, $value, $fail) {
                    $beneficiary = \App\Models\SantunanBeneficiary::find($value);
                    if ($beneficiary && !$beneficiary->is_active) {
                        $fail('Beneficiary is inactive and cannot receive funds.');
                    }
                },
            ],
            'besaran' => 'sometimes|numeric',
            'status_penerimaan' => 'sometimes|in:sudah,belum',
            'tanggal_distribusi' => 'nullable|date',
            'tahun' => 'sometimes|integer',
            'activity_id' => 'nullable|exists:santunan_activities,id',
            'kategori' => 'sometimes|in:yatim,dhuafa,kematian',
        ]);

        // AUDIT GUARD: Saldo Check on Update
        if (isset($validated['besaran']) || isset($validated['status_penerimaan'])) {
            $newAmount = $validated['besaran'] ?? $santunan->besaran;
            $newStatus = $validated['status_penerimaan'] ?? $santunan->status_penerimaan;
            $year = $validated['tahun'] ?? $santunan->tahun;
            $actId = $validated['activity_id'] ?? $santunan->activity_id;

            if ($newStatus === 'sudah') {
                // Calculate Available
                $totalPenerimaan = \App\Models\SantunanDonation::where('tahun', $year)
                    ->when($actId, fn($q) => $q->where('activity_id', $actId))
                    ->sum('jumlah');

                // Calculate Usage (Excluding current record to check new delta)
                $totalOtherUsed = Santunan::where('tahun', $year)
                    ->where('status_penerimaan', 'sudah')
                    ->where('id', '!=', $id)
                    ->when($actId, fn($q) => $q->where('activity_id', $actId))
                    ->sum('besaran');

                if (($totalOtherUsed + $newAmount) > $totalPenerimaan) {
                     return response()->json([
                        'message' => 'AUDIT FAILURE: Insufficient Saldo. Update exceeds available funds.',
                        'errors' => [
                            'besaran' => ["Available: " . number_format($totalPenerimaan - $totalOtherUsed) . ". Requested: " . number_format($newAmount)]
                        ]
                    ], 422);
                }
            }
        }

        $santunan->update($validated);
        return response()->json([
            'message' => 'Santunan record updated successfully',
            'data' => $santunan->load(['rt', 'beneficiary'])
        ]);
    }

    public function destroy($id)
    {
        try {
            \Illuminate\Support\Facades\Log::info("Attempting to delete Santunan ID: " . $id);
            $santunan = Santunan::findOrFail($id);
            $santunan->delete();
            \Illuminate\Support\Facades\Log::info("Deleted Santunan ID: " . $id);
            return response()->json(['message' => 'Santunan record deleted successfully']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Delete Failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to delete: ' . $e->getMessage()], 500);
        }
    }
    public function summary(Request $request)
    {
        $tahun = $request->get('tahun', date('Y'));
        
        // 1. Penerimaan (Strict: From SantunanDonation)
        $penerimaanQuery = \App\Models\SantunanDonation::where('tahun', $tahun);
        if ($request->has('activity_id')) {
            $penerimaanQuery->where('activity_id', $request->activity_id);
        }
        $totalPenerimaan = $penerimaanQuery->sum('jumlah');

        // 2. Penyaluran (Strict: From Santunan Distribution Table)
        $penyaluranQuery = Santunan::where('tahun', $tahun)
                                   ->where('status_penerimaan', 'sudah'); // Only disbursed funds
        
        if ($request->has('activity_id')) {
            $penyaluranQuery->where('activity_id', $request->activity_id);
        }
        if ($request->has('rt_id')) {
            $penyaluranQuery->where('rt_id', $request->rt_id);
        }

        // Breakdown by Category (Yatim vs Dhuafa)
        $totalYatim = (clone $penyaluranQuery)->where('kategori', 'yatim')->sum('besaran');
        $totalDhuafa = (clone $penyaluranQuery)->where('kategori', 'dhuafa')->sum('besaran');
        $totalPenyaluran = $totalYatim + $totalDhuafa;

        return response()->json([
            'success' => true,
            'data' => [
                'penerimaan' => $totalPenerimaan,
                'penyaluran' => [
                    'total' => $totalPenyaluran,
                    'yatim' => $totalYatim,
                    'dhuafa' => $totalDhuafa
                ],
                'saldo' => $totalPenerimaan - $totalPenyaluran // Calculated on-the-fly
            ]
        ]);
    }

    public function getActivities()
    {
        return response()->json(\App\Models\SantunanActivity::withCount(['donations', 'distributions'])->orderBy('created_at', 'desc')->get());
    }
}
