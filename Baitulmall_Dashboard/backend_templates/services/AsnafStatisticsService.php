<?php

namespace App\Services;

use App\Models\Asnaf;
use App\Models\RT;
use Illuminate\Support\Facades\DB;

class AsnafStatisticsService
{
    /**
     * Get count by kategori for a given year
     *
     * @param int $tahun
     * @return array
     */
    public function getCountByKategori(int $tahun): array
    {
        $stats = Asnaf::where('tahun', $tahun)
            ->where('status', 'active')
            ->selectRaw('kategori, COUNT(*) as jumlah, SUM(jumlah_jiwa) as total_jiwa')
            ->groupBy('kategori')
            ->get();

        $result = [];
        foreach ($stats as $stat) {
            $result[$stat->kategori] = [
                'jumlah_kk' => $stat->jumlah,
                'jumlah_jiwa' => $stat->total_jiwa,
            ];
        }

        return $result;
    }

    /**
     * Get count by RT for a given year
     *
     * @param int $tahun
     * @return array
     */
    public function getCountByRT(int $tahun): array
    {
        $stats = Asnaf::join('rts', 'asnaf.rt_id', '=', 'rts.id')
            ->where('asnaf.tahun', $tahun)
            ->where('asnaf.status', 'active')
            ->selectRaw('rts.kode, COUNT(*) as jumlah, SUM(asnaf.jumlah_jiwa) as total_jiwa')
            ->groupBy('rts.kode')
            ->get();

        $result = [];
        foreach ($stats as $stat) {
            $result[$stat->kode] = [
                'jumlah_kk' => $stat->jumlah,
                'jumlah_jiwa' => $stat->total_jiwa,
            ];
        }

        return $result;
    }

    /**
     * Get map data with coordinates for visualization
     *
     * @param int $tahun
     * @param string|null $kategori Filter by category
     * @param int|null $rtId Filter by RT
     * @return array
     */
    public function getMapData(int $tahun, ?string $kategori = null, ?int $rtId = null): array
    {
        $query = Asnaf::with('rt:id,kode,rw')
            ->where('tahun', $tahun)
            ->where('status', 'active')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        if ($kategori) {
            $query->where('kategori', $kategori);
        }

        if ($rtId) {
            $query->where('rt_id', $rtId);
        }

        $asnaf = $query->get();

        return $asnaf->map(function ($item) {
            return [
                'id' => $item->id,
                'nama' => $item->nama,
                'kategori' => $item->kategori,
                'rt' => $item->rt->kode,
                'jumlah_jiwa' => $item->jumlah_jiwa,
                'latitude' => (float) $item->latitude,
                'longitude' => (float) $item->longitude,
            ];
        })->toArray();
    }

    /**
     * Get overall statistics summary
     *
     * @param int $tahun
     * @return array
     */
    public function getOverallSummary(int $tahun): array
    {
        $total = Asnaf::where('tahun', $tahun)
            ->where('status', 'active')
            ->selectRaw('COUNT(*) as total_kk, SUM(jumlah_jiwa) as total_jiwa')
            ->first();

        return [
            'total_kk' => $total->total_kk ?? 0,
            'total_jiwa' => $total->total_jiwa ?? 0,
            'by_kategori' => $this->getCountByKategori($tahun),
            'by_rt' => $this->getCountByRT($tahun),
        ];
    }

    /**
     * Get RT list with Asnaf count
     *
     * @return array
     */
    public function getRTsWithAsnafCount(int $tahun): array
    {
        return RT::withCount(['asnaf' => function ($query) use ($tahun) {
            $query->where('tahun', $tahun)->where('status', 'active');
        }])
        ->get()
        ->map(function ($rt) {
            return [
                'id' => $rt->id,
                'kode' => $rt->kode,
                'rw' => $rt->rw,
                'ketua' => $rt->ketua,
                'jumlah_asnaf' => $rt->asnaf_count,
            ];
        })
        ->toArray();
    }
}
