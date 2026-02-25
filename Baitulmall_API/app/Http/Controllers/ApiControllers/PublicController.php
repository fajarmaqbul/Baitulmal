<?php

namespace App\Http\Controllers\ApiControllers;

use App\Http\Controllers\Controller;
use App\Models\ImpactStory;
use App\Models\ZakatFitrah;
use App\Models\ZakatMall;
use App\Models\Sedekah;
use App\Models\SantunanDonation;
use App\Models\Santunan;
use App\Models\Asnaf;
use App\Models\RT;
use App\Models\Distribusi;
use App\Models\CrowdfundingDonation;
use App\Models\Muzaki;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class PublicController extends Controller
{
    /**
     * Get aggregated transparency statistics for public consumption
     */
    public function statistics()
    {
        $currentYear = date('Y');

        // 1. Zakat Fitrah Aggregation (Rice & Cash - Cash will be hidden from UI but kept in API for grand total if needed, or we just stop summing it)
        $zakatFitrah = \App\Models\Muzaki::where('tahun', $currentYear)
            ->select(
                DB::raw('SUM(jumlah_beras_kg) as total_beras'),
                DB::raw('SUM(jumlah_jiwa) as total_jiwa'),
                DB::raw('COUNT(id) as total_muzaki')
            )->first();

        // 2. Zakat Mal Aggregation
        $zakatMal = \App\Models\ZakatMall::whereYear('tanggal', $currentYear)
            ->sum('jumlah');

        // 3. Sedekah & Infaq (General)
        $sedekah = Sedekah::whereYear('tanggal', $currentYear)
            ->where('jenis', 'penerimaan')
            ->sum('jumlah');

        // 4. Santunan Donations (Social)
        $santunan = SantunanDonation::whereYear('tanggal', $currentYear)
            ->sum('jumlah');

        // 5. Recent Transactions (Masked)
        $recentZakat = \App\Models\Muzaki::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($z) {
                return [
                    'nama' => $this->maskName($z->nama ? $z->nama : 'Hamba Allah'),
                    'tipe' => 'Zakat Fitrah',
                    'nominal' => $z->jumlah_beras_kg . ' KG', // Changed: only show rice for Fitrah activity
                    'tanggal' => $z->created_at->format('Y-m-d')
                ];
            });

        $recentZakatMal = \App\Models\ZakatMall::orderBy('tanggal', 'desc')
            ->limit(5)
            ->get()
            ->map(function($zm) {
                return [
                    'nama' => $this->maskName($zm->nama_muzaki),
                    'tipe' => 'Zakat Mal',
                    'nominal' => $zm->jumlah,
                    'tanggal' => $zm->tanggal
                ];
            });

        $recentSedekah = Sedekah::orderBy('tanggal', 'desc')
            ->where('jenis', 'penerimaan')
            ->limit(5)
            ->get()
            ->map(function($s) {
                return [
                    'nama' => $s->nama_donatur ? $this->maskName($s->nama_donatur) : 'Hamba Allah',
                    'tipe' => 'Sedekah/Infaq',
                    'nominal' => $s->jumlah,
                    'tanggal' => $s->tanggal
                ];
            });

        // 6. Distribution Aggregations
        $fitrahDistributed = Distribusi::where('tahun', $currentYear)
            ->sum('jumlah_kg');
        
        $sedekahDistributed = Sedekah::whereYear('tanggal', $currentYear)
            ->where('jenis', 'penyaluran')
            ->sum('jumlah');
            
        $malDistributed = Santunan::where('tahun', $currentYear)
            ->sum('besaran');

        $totalMustahikJiwa = Asnaf::where('tahun', $currentYear)
            ->active()
            ->sum('jumlah_jiwa');

        // 7. [NEW] RT-Impact Heatmap (Distribution by RT)
        $rtImpact = RT::select('nomor_rt', 'id')
            ->withCount(['asnaf as total_jiwa' => function($q) use ($currentYear) {
                $q->where('tahun', $currentYear);
            }])
            ->get()
            ->map(function($rt) use ($currentYear) {
                // Get distributions for this RT
                $fitrah = Distribusi::whereHas('asnaf', function($q) use ($rt) {
                    $q->where('rt_id', $rt->id);
                })->where('tahun', $currentYear)->sum('jumlah_kg');

                $cash = Santunan::where('rt_id', $rt->id)
                    ->where('tahun', $currentYear)
                    ->sum('besaran');

                return [
                    'rt' => 'RT ' . $rt->nomor_rt,
                    'fitrah' => $fitrah,
                    'cash' => $cash,
                    'jiwa' => $rt->total_jiwa
                ];
            });

        // 8. [NEW] Asnaf Breakdown (Pie Chart)
        $asnafBreakdown = Asnaf::where('tahun', $currentYear)
            ->select('kategori', DB::raw('count(*) as count'), DB::raw('sum(jumlah_jiwa) as jiwa'))
            ->groupBy('kategori')
            ->get();

        // 9. [NEW] Monthly Trends (Current vs Last Year)
        $months = collect([1,2,3,4,5,6,7,8,9,10,11,12]);
        $trends = $months->map(function($month) use ($currentYear) {
            $lastYear = $currentYear - 1;
            
            $currentTotal = ZakatMall::whereYear('tanggal', $currentYear)->whereMonth('tanggal', $month)->sum('jumlah') +
                           Sedekah::whereYear('tanggal', $currentYear)->whereMonth('tanggal', $month)->where('jenis', 'penerimaan')->sum('jumlah');
            
            $lastTotal = ZakatMall::whereYear('tanggal', $lastYear)->whereMonth('tanggal', $month)->sum('jumlah') +
                        Sedekah::whereYear('tanggal', $lastYear)->whereMonth('tanggal', $month)->where('jenis', 'penerimaan')->sum('jumlah');

            return [
                'month' => date('M', mktime(0, 0, 0, $month, 1)),
                'current' => $currentTotal,
                'last' => $lastTotal
            ];
        });

        // 10. [NEW] Fundraising Progress & Targets
        // Mocking targets since no Setting model config yet
        $targets = [
            'zakat_mal' => ['goal' => 50000000, 'current' => $zakatMal],
            'sedekah' => ['goal' => 25000000, 'current' => $sedekah],
            'beras' => ['goal' => 2000, 'current' => $zakatFitrah->total_beras],
        ];

        return response()->json([
            'success' => true,
            'current_year' => $currentYear,
            'stats' => [
                'zakat' => [
                    'beras' => $zakatFitrah->total_beras ?? 0,
                    'jiwa' => $zakatFitrah->total_jiwa ?? 0,
                    'muzaki' => $zakatFitrah->total_muzaki ?? 0,
                    'mustahik_jiwa' => $totalMustahikJiwa,
                ],
                'zakat_mal' => $zakatMal,
                'sedekah' => $sedekah,
                'santunan' => $santunan,
                'grand_total_cash' => $zakatMal + $sedekah + $santunan,
                'distributed' => [
                    'fitrah_beras' => $fitrahDistributed,
                    'sedekah_infaq' => $sedekahDistributed,
                    'zakat_mal' => $malDistributed,
                ],
                'analytics' => [
                    'rt_impact' => $rtImpact,
                    'asnaf_breakdown' => $asnafBreakdown,
                    'trends' => $trends,
                    'targets' => $targets
                ]
            ],
            'recent_activity' => $recentZakat->concat($recentZakatMal)->concat($recentSedekah)->sortByDesc('tanggal')->values()->take(10)
        ]);
    }

    /**
     * Get published community impact stories
     */
    public function stories()
    {
        $stories = ImpactStory::where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $stories
        ]);
    }

    /**
     * Publicly accessible receipt download
     */
    public function downloadReceipt($type, $id)
    {
        $donation = null;

        switch ($type) {
            case 'fitrah': $donation = Muzaki::find($id); break;
            case 'mall': $donation = ZakatMall::find($id); break;
            case 'sedekah': $donation = Sedekah::find($id); break;
        }

        if (!$donation || !$donation->receipt_path) {
            return abort(404, 'Receipt not found.');
        }

        if (!Storage::disk('public')->exists($donation->receipt_path)) {
            return abort(404, 'Receipt file missing.');
        }

        return Storage::disk('public')->download($donation->receipt_path);
    }

    /**
     * Get real-time aggregated statistics for live counters
     */
    public function liveStats()
    {
        return Cache::remember('public_live_stats', 30, function () {
            $currentYear = date('Y');

            // 1. Zakat Fitrah
            $zakatFitrah = Muzaki::where('tahun', $currentYear)->select(
                DB::raw('SUM(jumlah_beras_kg) as total_beras'),
                DB::raw('COUNT(id) as total_tx')
            )->first();

            // 2. Zakat Mal
            $zakatMal = ZakatMall::whereYear('tanggal', $currentYear)->select(
                DB::raw('SUM(jumlah) as total_cash'),
                DB::raw('COUNT(id) as total_tx')
            )->first();

            // 3. Sedekah & Infaq
            $sedekah = Sedekah::whereYear('tanggal', $currentYear)
                ->where('jenis', 'penerimaan')
                ->select(
                    DB::raw('SUM(jumlah) as total_cash'),
                    DB::raw('COUNT(id) as total_tx')
                )->first();

            // 4. Santunan Donations
            $santunan = SantunanDonation::whereYear('tanggal', $currentYear)->select(
                DB::raw('SUM(jumlah) as total_cash'),
                DB::raw('COUNT(id) as total_tx')
            )->first();

            // 5. Crowdfunding
            $crowdfunding = CrowdfundingDonation::whereYear('created_at', $currentYear)->select(
                DB::raw('SUM(amount) as total_cash'),
                DB::raw('COUNT(id) as total_tx')
            )->first();

            // Donor count approximation (not perfect but efficient)
            $uniqueDonors = Muzaki::where('tahun', $currentYear)->distinct('nama')->count('nama') +
                            ZakatMall::whereYear('tanggal', $currentYear)->distinct('nama_muzaki')->count('nama_muzaki') +
                            Sedekah::whereYear('tanggal', $currentYear)->where('jenis', 'penerimaan')->distinct('nama_donatur')->count('nama_donatur');

            $totalTransactions = ($zakatFitrah->total_tx ?? 0) + 
                                ($zakatMal->total_tx ?? 0) + 
                                ($sedekah->total_tx ?? 0) + 
                                ($santunan->total_tx ?? 0) + 
                                ($crowdfunding->total_tx ?? 0);

            $totalCash = ($zakatMal->total_cash ?? 0) + 
                        ($sedekah->total_cash ?? 0) + 
                        ($santunan->total_cash ?? 0) + 
                        ($crowdfunding->total_cash ?? 0);

            return [
                'success' => true,
                'timestamp' => now()->toIso8601String(),
                'data' => [
                    'overall' => [
                        'total_donasi_cash' => $totalCash,
                        'total_donasi_beras' => $zakatFitrah->total_beras ?? 0,
                        'jumlah_donatur' => $uniqueDonors,
                        'jumlah_transaksi' => $totalTransactions,
                    ],
                    'categories' => [
                        'zakat_fitrah' => [
                            'beras' => $zakatFitrah->total_beras ?? 0,
                            'transaksi' => $zakatFitrah->total_tx ?? 0
                        ],
                        'zakat_mal' => [
                            'nominal' => $zakatMal->total_cash ?? 0,
                            'transaksi' => $zakatMal->total_tx ?? 0
                        ],
                        'sedekah' => [
                            'nominal' => $sedekah->total_cash ?? 0,
                            'transaksi' => $sedekah->total_tx ?? 0
                        ],
                        'santunan' => [
                            'nominal' => $santunan->total_cash ?? 0,
                            'transaksi' => $santunan->total_tx ?? 0
                        ],
                        'donasi_tematik' => [
                            'nominal' => $crowdfunding->total_cash ?? 0,
                            'transaksi' => $crowdfunding->total_tx ?? 0
                        ]
                    ]
                ]
            ];
        });
    }

    /**
     * Helper to mask names for privacy
     */
    private function maskName($name)
    {
        if (!$name) return 'Hamba Allah';
        $parts = explode(' ', $name);
        $masked = array_map(function($part) {
            if (strlen($part) <= 2) return $part;
            return substr($part, 0, 1) . str_repeat('*', strlen($part) - 2) . substr($part, -1);
        }, $parts);
        
        return implode(' ', $masked);
    }
}
