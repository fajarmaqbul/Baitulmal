<?php

namespace App\Observers;

use App\Models\Muzaki;
use App\Events\DashboardUpdated;
use Illuminate\Support\Facades\Cache;

class MuzakiObserver
{
    public function created(Muzaki $muzaki): void
    {
        $this->clearCacheAndBroadcast($muzaki->tahun);
    }

    public function updated(Muzaki $muzaki): void
    {
        $this->clearCacheAndBroadcast($muzaki->tahun);
    }

    public function deleted(Muzaki $muzaki): void
    {
        $this->clearCacheAndBroadcast($muzaki->tahun);
    }

    protected function clearCacheAndBroadcast(int $tahun): void
    {
        Cache::forget("dashboard_stats_summary_{$tahun}");
        event(new DashboardUpdated());
    }
}
