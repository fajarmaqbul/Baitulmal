import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy } from 'react';
import {
    MapPin,
    Calendar,
    Printer,
    Gift,
    Heart,
    Users,
    TrendingUp
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { fetchAsnafStatistics } from '../services/asnafApi';
import { fetchZakatFitrahList, fetchMuzakiStats } from '../services/zakatFitrahApi';
import { fetchSedekahList, fetchSedekahSummary } from '../services/santunanApi';
import useRealtimeStats from '../hooks/useRealtimeStats';

// Lazy load heavy components
const DashboardCharts = lazy(() => import('../components/Dashboard/DashboardCharts'));
const StatsGrid = lazy(() => import('../components/Dashboard/StatsGrid'));
const ActivityTable = lazy(() => import('../components/Dashboard/ActivityTable'));
const Skeleton = lazy(() => import('../components/Skeleton'));

const Dashboard = () => {
    const [muzaki, setMuzaki] = React.useState([]);
    const [sedekah, setSedekah] = React.useState([]);
    const [asnafStats, setAsnafStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const [realSedekahTotal, setRealSedekahTotal] = useState(0);
    const [muzakiStats, setMuzakiStats] = useState(null);

    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    });

    // Real-time Dashboard Hook
    const currentYear = selectedDate.split('-')[0];
    const { stats: rtStats, loading: rtLoading } = useRealtimeStats(currentYear, {
        pollingInterval: 5000,
        enablePolling: true
    });

    const reportRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef: reportRef });

    const handlePrint = () => {
        document.title = `Laporan_Dashboard_Baitulmal_${selectedDate}`;
        reactToPrintFn();
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                const [yearStr, monthStr] = selectedDate.split('-');
                const year = parseInt(yearStr, 10);
                const month = parseInt(monthStr, 10);

                const [statsRes, muzakiRes, sedekahRes, realSedekahRes, muzakiStatsRes] = await Promise.all([
                    fetchAsnafStatistics(year),
                    fetchZakatFitrahList({ per_page: 10, tahun: year }), // Global latest for year
                    fetchSedekahList({ per_page: 10, tahun: year }),     // Global latest for year
                    fetchSedekahSummary({ tahun: year }),                // Label says "Tahun Ini"
                    fetchMuzakiStats(year)
                ]);
                setAsnafStats(statsRes);
                setMuzaki(muzakiRes.data || []);
                setSedekah(sedekahRes.data || []);
                setMuzakiStats(muzakiStatsRes);

                if (realSedekahRes.success) {
                    setRealSedekahTotal(realSedekahRes.data.grand_total || 0);
                }
            } catch (err) {
                console.error('Failed to load Dashboard data:', err);
                setError(err?.message || 'Gagal memuat data Dashboard');
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [selectedDate]);

    const cardStats = useMemo(() => [
        { label: 'Total Muzaki (Jiwa)', value: (rtStats?.total_muzaki_jiwa ?? muzakiStats?.total_jiwa ?? 0).toLocaleString(), icon: Gift, color: 'var(--primary)', trend: '+12%' },
        { label: 'Total Sedekah (Tahun Ini)', value: `Rp ${(rtStats?.total_sedekah ?? realSedekahTotal ?? 0).toLocaleString('id-ID')}`, icon: Heart, color: 'var(--danger)', trend: 'Realtime' },
        { label: 'Total Asnaf (KK)', value: rtStats?.total_kk ?? asnafStats?.total_kk ?? 0, icon: Users, color: 'var(--success)', trend: '+2%' },
        { label: 'Total Asnaf (Jiwa)', value: rtStats?.total_jiwa ?? asnafStats?.total_jiwa ?? 0, icon: TrendingUp, color: 'var(--warning)', trend: '+4%' },
    ], [muzakiStats, realSedekahTotal, asnafStats, rtStats]);

    const rtLabels = asnafStats ? Object.keys(asnafStats.by_rt_kategori) : [];
    const fakirData = rtLabels.map(rt => asnafStats.by_rt_kategori[rt]?.['Fakir']?.jumlah_jiwa || 0);
    const miskinData = rtLabels.map(rt => asnafStats.by_rt_kategori[rt]?.['Miskin']?.jumlah_jiwa || 0);

    const createGradient = useCallback((ctx, color1, color2) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    }, []);

    const rtChartData = useMemo(() => ({
        labels: rtLabels.map(rt => `RT ${rt}`),
        datasets: [
            {
                label: 'Fakir',
                data: fakirData,
                backgroundColor: (context) => createGradient(context.chart.ctx, '#3b82f6', '#1d4ed8'),
                borderRadius: 12,
                barThickness: 16,
            },
            {
                label: 'Miskin',
                data: miskinData,
                backgroundColor: (context) => createGradient(context.chart.ctx, '#a78bfa', '#7c3aed'),
                borderRadius: 12,
                barThickness: 16,
            }
        ]
    }), [rtLabels, fakirData, miskinData, createGradient]);

    const distributionData = useMemo(() => ({
        labels: ['Fakir', 'Miskin', 'Amil', 'Lainnya'],
        datasets: [{
            data: asnafStats ? [
                asnafStats.by_kategori['Fakir']?.jumlah_kk || 0,
                asnafStats.by_kategori['Miskin']?.jumlah_kk || 0,
                asnafStats.by_kategori['Amil']?.jumlah_kk || 0,
                (asnafStats.total_kk || 0) - (asnafStats.by_kategori['Fakir']?.jumlah_kk || 0) - (asnafStats.by_kategori['Miskin']?.jumlah_kk || 0) - (asnafStats.by_kategori['Amil']?.jumlah_kk || 0)
            ] : [0, 0, 0, 0],
            backgroundColor: ['#1d4ed8', '#3b82f6', '#60a5fa', '#e0e7ff'],
            cutout: '75%',
            borderRadius: 8
        }]
    }), [asnafStats]);

    const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'slate-dark-pro');
    useEffect(() => {
        const observer = new MutationObserver(() => setTheme(document.documentElement.getAttribute('data-theme') || 'clean'));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    const isDark = ['slate-dark-pro', 'charcoal-mix'].includes(theme);
    const getStyle = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

    const chartTextColor = getStyle('--chart-text') || (isDark ? '#f8fafc' : '#1e293b');
    const chartGridColor = getStyle('--chart-grid') || (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)');
    const chartTooltipBg = getStyle('--chart-tooltip-bg') || (isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)');
    const chartTooltipText = getStyle('--chart-tooltip-text') || (isDark ? '#f8fafc' : '#0f172a');

    const chartOptions = useMemo(() => ({
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true, position: 'top', align: 'end',
                labels: { color: chartTextColor, font: { family: "'Rubik', sans-serif", weight: '600' } }
            },
            tooltip: {
                backgroundColor: chartTooltipBg, titleColor: chartTooltipText,
                bodyColor: isDark ? '#cbd5e1' : '#64748b'
            }
        },
        scales: {
            x: { ticks: { color: isDark ? '#94a3b8' : 'var(--text-muted)' } },
            y: { grid: { color: chartGridColor }, ticks: { color: isDark ? '#94a3b8' : 'var(--text-muted)' } }
        }
    }), [chartTextColor, chartGridColor, chartTooltipBg, chartTooltipText, isDark]);

    const doughnutOptions = useMemo(() => ({
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: isDark ? '#ffffff' : '#1e293b' } },
            tooltip: { backgroundColor: chartTooltipBg, titleColor: chartTooltipText }
        }
    }), [chartTooltipBg, chartTooltipText, isDark]);

    // Removed heavy full-page loader to allow progressive rendering with skeletons

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Baitulmal Fajar Maqbul</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '0.4rem 0 0', fontSize: '1.5rem', fontWeight: 700 }}>
                        Ilallah, Ma'allah, Fillah
                        {rtLoading && <span style={{ fontSize: '0.8rem', marginLeft: '1rem', opacity: 0.5 }}>• Updating Live...</span>}
                    </p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <div style={{ position: 'relative' }}>
                        <input
                            type="month"
                            className="btn btn-ghost"
                            style={{ border: '1px solid var(--border-color)', borderRadius: '12px', paddingLeft: '2.5rem', width: '180px' }}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <Calendar size={16} className="text-primary" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    <button onClick={handlePrint} className="btn btn-primary" style={{ borderRadius: '12px', height: '42px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Printer size={18} /> Unduh Laporan
                    </button>
                </div>
            </div>

            <div ref={reportRef} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <Suspense fallback={
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" borderRadius="16px" />)}
                    </div>
                }>
                    <StatsGrid cardStats={cardStats} />
                </Suspense>

                <Suspense fallback={
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Skeleton height="400px" borderRadius="16px" />
                        <Skeleton height="400px" borderRadius="16px" />
                    </div>
                }>
                    <DashboardCharts
                        rtChartData={rtChartData}
                        chartOptions={chartOptions}
                        distributionData={distributionData}
                        doughnutOptions={doughnutOptions}
                    />
                </Suspense>

                <Suspense fallback={<Skeleton height="300px" borderRadius="16px" />}>
                    <ActivityTable muzaki={muzaki} sedekah={sedekah} />
                </Suspense>
            </div>
        </div>
    );
};

export default Dashboard;
