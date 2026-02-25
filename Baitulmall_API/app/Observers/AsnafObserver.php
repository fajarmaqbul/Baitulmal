<?php

namespace App\Observers;

use App\Models\Asnaf;
use App\Events\DashboardUpdated;
use Illuminate\Support\Facades\Cache;

class AsnafObserver
{
    /**
     * Handle the Asnaf "created" event.
     */
    public function created(Asnaf $asnaf): void
    {
        $this->clearCacheAndBroadcast($asnaf->tahun);
    }

    /**
     * Handle the Asnaf "updated" event.
     */
    public function updated(Asnaf $asnaf): void
    {
        $this->clearCacheAndBroadcast($asnaf->tahun);
    }

    /**
     * Handle the Asnaf "deleted" event.
     */
    public function deleted(Asnaf $asnaf): void
    {
        $this->clearCacheAndBroadcast($asnaf->tahun);
    }

    /**
     * Clear statistics cache and broadcast event.
     */
    private function clearCacheAndNotify($tahun): void
    {
        $cacheKey = "mustahik_stats_summary_{$tahun}";
        Cache::forget($cacheKey);
        
        Log::info("Mustahik Stats Cache Cleared for year: {$tahun}");

        // Broadcast to frontend
        broadcast(new MustahikUpdated($tahun));
    }
}
