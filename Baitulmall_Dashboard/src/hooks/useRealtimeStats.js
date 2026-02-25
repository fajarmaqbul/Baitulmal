import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMustahikStats } from '../services/statsApi';

/**
 * Custom hook for real-time Mustahik statistics
 * Handles both Polling (Option A) and structure for WebSocket (Option B)
 * 
 * @param {number|string} tahun - Year for stats
 * @param {Object} options - Hook options
 * @param {number} options.pollingInterval - Interval in ms (default: 5000)
 * @param {boolean} options.enablePolling - Toggle polling (default: true)
 */
const useRealtimeStats = (tahun, options = {}) => {
    const {
        pollingInterval = 5000,
        enablePolling = true
    } = options;

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRealtime, setIsRealtime] = useState(false);

    // Use ref to avoid re-triggering logic on every re-render
    const pollingTimer = useRef(null);

    const loadStats = useCallback(async (isAutoRefresh = false) => {
        try {
            if (!isAutoRefresh) setLoading(true);
            const data = await fetchMustahikStats(tahun);
            setStats(data);
            setError(null);
        } catch (err) {
            console.error('Failed to refresh mustahik stats:', err);
            setError('Gagal memuat statistik');
        } finally {
            if (!isAutoRefresh) setLoading(false);
        }
    }, [tahun]);

    // OPTION A: Polling Implementation
    useEffect(() => {
        if (!tahun) return;

        // Initial load
        loadStats();

        if (enablePolling) {
            pollingTimer.current = setInterval(() => {
                loadStats(true); // true = silent refresh
            }, pollingInterval);
        }

        return () => {
            if (pollingTimer.current) clearInterval(pollingTimer.current);
        };
    }, [tahun, enablePolling, pollingInterval, loadStats]);

    // OPTION B: WebSocket (Laravel Echo) Implementation
    useEffect(() => {
        if (!tahun || !window.Echo) return;

        console.log('Realtime Mode: WebSocket enabled');
        setIsRealtime(true);

        const channel = window.Echo.channel('dashboard-stats')
            .listen('.stats.updated', (e) => {
                console.log('Dashboard stats update event received:', e);
                // Refresh data. If e.tahun matches, great. If not provided, refresh anyway as it's a global signal
                if (!e.tahun || e.tahun === Number(tahun)) {
                    loadStats(true);
                }
            });

        return () => {
            window.Echo.leave('dashboard-stats');
        };
    }, [tahun, loadStats]);

    return {
        stats,
        loading,
        error,
        refresh: () => loadStats(false),
        isRealtime: isRealtime || enablePolling
    };
};

export default useRealtimeStats;
