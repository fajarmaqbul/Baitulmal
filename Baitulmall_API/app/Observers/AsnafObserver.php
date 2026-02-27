<?php

namespace App\Observers;

use App\Models\Asnaf;
use App\Events\MustahikUpdated;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AsnafObserver
{
    public function created(Asnaf $asnaf): void
    {
        $this->clearCacheAndBroadcast($asnaf->tahun);
    }

    public function updated(Asnaf $asnaf): void
    {
        $this->clearCacheAndBroadcast($asnaf->tahun);
    }

    public function deleted(Asnaf $asnaf): void
    {
        $this->clearCacheAndBroadcast($asnaf->tahun);
    }

    public function clearCacheAndBroadcast($tahun): void
    {
        Log::debug("Observer: clearCacheAndBroadcast for year: {$tahun}");
        
        try {
            $cacheKey = "mustahik_stats_summary_{$tahun}";
            Cache::forget($cacheKey);
            Log::info("Mustahik Stats Cache Cleared: {$tahun}");

            broadcast(new MustahikUpdated($tahun));
        } catch (\Exception $e) {
            Log::error("Observer Error: " . $e->getMessage());
        }
    }
}
