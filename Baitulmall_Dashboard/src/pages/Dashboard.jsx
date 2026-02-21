import React from 'react';
import {
    TrendingUp,
    Users,
    Gift,
    Heart,
    Coins,
    ArrowUpRight,
    MapPin,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { fetchAsnafStatistics } from '../services/asnafApi';
import { fetchZakatFitrahList, fetchMuzakiStats } from '../services/zakatFitrahApi';
import { fetchSedekahList, fetchSedekahSummary } from '../services/santunanApi';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    // ... (existing state)
    const [muzaki, setMuzaki] = React.useState([]);
    const [sedekah, setSedekah] = React.useState([]);
    const [asnafStats, setAsnafStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const [realSedekahTotal, setRealSedekahTotal] = React.useState(0);
    const [muzakiStats, setMuzakiStats] = React.useState(null);

    // ... (existing useEffect and stats calculation)
    React.useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth() + 1;

                const [statsRes, muzakiRes, sedekahRes, realSedekahRes, muzakiStatsRes] = await Promise.all([
                    fetchAsnafStatistics(currentYear),
                    fetchZakatFitrahList({ per_page: 10 }),
                    fetchSedekahList({ per_page: 10 }),
                    fetchSedekahSummary({ tahun: currentYear }), // Get annual total from real API
                    fetchMuzakiStats(currentYear)
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
    }, []);

    // const totalZakatFitrah = muzaki.reduce((acc, curr) => acc + (curr.jumlah_jiwa || 0), 0); // OLD calculation based on pagination

    const cardStats = [
        { label: 'Total Muzaki (Jiwa)', value: (muzakiStats?.total_jiwa || 0).toLocaleString(), icon: Gift, color: 'var(--primary)', trend: '+12%' },
        { label: 'Total Sedekah (Tahun Ini)', value: `Rp ${(realSedekahTotal || 0).toLocaleString('id-ID')}`, icon: Heart, color: 'var(--danger)', trend: 'Realtime' },
        { label: 'Total Asnaf (KK)', value: asnafStats?.total_kk || 0, icon: Users, color: 'var(--success)', trend: '+2%' },
        { label: 'Total Asnaf (Jiwa)', value: asnafStats?.total_jiwa || 0, icon: TrendingUp, color: 'var(--warning)', trend: '+4%' },
    ];

    const rtLabels = asnafStats ? Object.keys(asnafStats.by_rt_kategori) : [];
    const fakirData = rtLabels.map(rt => asnafStats.by_rt_kategori[rt]?.['Fakir']?.jumlah_jiwa || 0);
    const miskinData = rtLabels.map(rt => asnafStats.by_rt_kategori[rt]?.['Miskin']?.jumlah_jiwa || 0);

    // Create gradient for Bar Chart
    // Memoize gradient creation to avoid re-defining function
    const createGradient = React.useCallback((ctx, color1, color2) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    }, []);

    const rtChartData = React.useMemo(() => ({
        labels: rtLabels.map(rt => `RT ${rt}`),
        datasets: [
            {
                label: 'Fakir',
                data: fakirData,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx } = chart;
                    return createGradient(ctx, '#3b82f6', '#1d4ed8');
                },
                hoverBackgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx } = chart;
                    return createGradient(ctx, '#2563eb', '#1e40af');
                },
                borderRadius: 12,
                barThickness: 16,
                borderSkipped: false,
            },
            {
                label: 'Miskin',
                data: miskinData,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx } = chart;
                    return createGradient(ctx, '#a78bfa', '#7c3aed');
                },
                hoverBackgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx } = chart;
                    return createGradient(ctx, '#8b5cf6', '#6d28d9');
                },
                borderRadius: 12,
                barThickness: 16,
                borderSkipped: false,
            }
        ]
    }), [rtLabels, fakirData, miskinData, createGradient]);

    const distributionData = React.useMemo(() => ({
        labels: ['Fakir', 'Miskin', 'Amil', 'Lainnya'],
        datasets: [{
            data: asnafStats ? [
                asnafStats.by_kategori['Fakir']?.jumlah_kk || 0,
                asnafStats.by_kategori['Miskin']?.jumlah_kk || 0,
                asnafStats.by_kategori['Amil']?.jumlah_kk || 0,
                (asnafStats.total_kk || 0) - (asnafStats.by_kategori['Fakir']?.jumlah_kk || 0) - (asnafStats.by_kategori['Miskin']?.jumlah_kk || 0) - (asnafStats.by_kategori['Amil']?.jumlah_kk || 0)
            ] : [0, 0, 0, 0],
            backgroundColor: [
                '#1d4ed8', // Deep Blue
                '#3b82f6', // Sky Blue
                '#60a5fa', // Light Blue
                '#e0e7ff'  // Very Light Lavender
            ],
            hoverBackgroundColor: [
                '#1e40af',
                '#2563eb',
                '#3b82f6',
                '#c7d2fe'
            ],
            hoverOffset: 12,
            borderWidth: 0,
            cutout: '75%',
            spacing: 2,
            borderRadius: 8
        }]
    }), [asnafStats]);

    // Theme Detection for Chart Colors
    const [theme, setTheme] = React.useState(() => {
        return document.documentElement.getAttribute('data-theme') || localStorage.getItem('cardTheme') || 'slate-dark-pro';
    });

    React.useEffect(() => {
        // Initial check
        setTheme(document.documentElement.getAttribute('data-theme') || 'clean');

        // Observer for attribute changes on <html>
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    setTheme(document.documentElement.getAttribute('data-theme') || 'clean');
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => observer.disconnect();
    }, []);

    // Check if theme is one of the known dark themes
    const isDark = ['slate-dark-pro', 'charcoal-mix'].includes(theme);

    // Use Computed Style to get CSS variables
    // We use a ref to store the computed styles to avoid re-calculating on every render if not needed
    // But since theme changes, we need to recalculate.

    const getStyle = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

    const chartTextColor = getStyle('--chart-text') || (isDark ? '#f8fafc' : '#1e293b');
    const chartGridColor = getStyle('--chart-grid') || (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)');
    const chartTooltipBg = getStyle('--chart-tooltip-bg') || (isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)');
    const chartTooltipText = getStyle('--chart-tooltip-text') || (isDark ? '#f8fafc' : '#0f172a');

    const chartOptions = React.useMemo(() => ({
        maintainAspectRatio: false,
        animation: {
            duration: 800, // Reduced from 1200 for snappier feel
            easing: 'easeOutQuart', // Smoother deceleration
            delay: (context) => {
                let delay = 0;
                if (context.type === 'data' && context.mode === 'default') {
                    delay = context.dataIndex * 40; // Reduced stagger from 80
                }
                return delay;
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 8,
                    padding: 20,
                    font: { size: 13, family: "'Rubik', sans-serif", weight: '600' },
                    color: chartTextColor
                }
            },
            tooltip: {
                backgroundColor: chartTooltipBg,
                titleColor: chartTooltipText,
                bodyColor: isDark ? '#cbd5e1' : '#64748b',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 2,
                padding: { top: 12, bottom: 12, left: 16, right: 16 },
                cornerRadius: 12,
                displayColors: true,
                boxPadding: 6,
                titleFont: { size: 13, weight: '700', family: "'Rubik', sans-serif" },
                bodyFont: { size: 12, family: "'Rubik', sans-serif" },
                boxWidth: 12,
                boxHeight: 12,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += context.parsed.y + ' Jiwa';
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: isDark ? '#94a3b8' : 'var(--text-muted)',
                    font: { size: 11, weight: '600', family: "'Rubik', sans-serif" },
                    padding: 8
                },
                border: { display: false }
            },
            y: {
                grid: {
                    display: true,
                    color: chartGridColor,
                    lineWidth: 1
                },
                ticks: {
                    display: true,
                    color: isDark ? '#94a3b8' : 'var(--text-muted)',
                    font: { size: 10, family: "'Rubik', sans-serif" },
                    padding: 8,
                    callback: function (value) {
                        return value + ' Jiwa';
                    }
                },
                border: { display: false }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        layout: {
            padding: { top: 10, bottom: 10, left: 10, right: 10 }
        }
    }), [chartTextColor, chartGridColor, chartTooltipBg, chartTooltipText, isDark]);

    const doughnutOptions = React.useMemo(() => ({
        maintainAspectRatio: false,
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1200, // Smooth slow animation
            easing: 'easeOutQuart'
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                align: 'center',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 50, // Nice vertical spacing
                    boxWidth: 8, // Smaller minimalist dots
                    boxHeight: 8,
                    font: {
                        size: 13,
                        weight: '500', // Cleaner lighter weight
                        family: "'Rubik', sans-serif"
                    },
                    color: isDark ? '#ffffff' : '#1e293b'
                }
            },
            tooltip: {
                backgroundColor: chartTooltipBg,
                titleColor: chartTooltipText,
                bodyColor: isDark ? '#cbd5e1' : '#64748b',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1, // Thinner border
                padding: 12, // Cleaner padding
                cornerRadius: 8, // Slightly less rounded
                displayColors: true,
                boxPadding: 4,
                titleFont: { size: 12, weight: '700', family: "'Rubik', sans-serif" },
                bodyFont: { size: 12, family: "'Rubik', sans-serif" },
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${percentage}%`;
                    }
                }
            }
        }
    }), [chartTextColor, chartTooltipBg, chartTooltipText, isDark]);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* ... (Header and Stats Grid remain visually same, assuming they are fine) */}
            {/* Header Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Baitulmal Fajar Maqbul</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '0.4rem 0 0', fontSize: '1.5rem', fontWeight: 700 }}>Ilallah, Ma'allah, Fillah</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-ghost" style={{ border: '1px solid var(--border-color)', borderRadius: '12px', fontWeight: 600, height: '42px' }}>
                        <Calendar size={16} className="me-2 text-primary" /> Jan 2026
                    </button>
                    <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '0 1.5rem', fontWeight: 700, height: '42px' }}>Unduh Laporan</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ gap: '1.5rem' }}>
                {cardStats.map((stat, i) => (
                    <div key={i} className="card stat-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{
                                padding: '1rem',
                                borderRadius: '16px',
                                background: stat.color === 'var(--primary)' ? 'rgba(0,144,231,0.1)' :
                                    stat.color === 'var(--danger)' ? 'rgba(252,66,74,0.1)' :
                                        stat.color === 'var(--success)' ? 'rgba(0,210,91,0.1)' : 'rgba(255,171,0,0.1)',
                                color: stat.color
                            }}>
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', background: 'rgba(0,210,91,0.08)', padding: '4px 10px', borderRadius: '20px' }}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', lineHeight: 1 }}>{stat.value}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.75rem 0 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                        <div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Penyebaran Asnaf</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Data Fakir & Miskin per wilayah RT</p>
                        </div>

                    </div>
                    <div style={{ height: '350px' }}>
                        <Bar data={rtChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Komposisi Asnaf</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Berdasarkan kategori</p>
                        </div>
                        <div style={{ background: 'rgba(241, 245, 249, 0.5)', padding: '0.5rem', borderRadius: '10px' }}>
                            <ArrowUpRight size={20} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    </div>
                    <div style={{ height: '380px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                        <Doughnut
                            data={distributionData}
                            options={doughnutOptions}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Aktivitas Pengelolaan Terbaru</h4>
                    <button className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>Lihat Semua <ArrowRight size={14} className="ms-1" /></button>
                </div>
                <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                    <table className="table-compact">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>NO</th>
                                <th>SUMBER / PENERIMA</th>
                                <th>KATEGORI</th>
                                <th>NOMINAL / JUMLAH</th>
                                <th>TANGGAL</th>
                                <th>KONFIRMASI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {muzaki.slice(0, 5).map((m, index) => (
                                <tr key={m.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.nama}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RT {m.rt?.kode || '-'}</div>
                                    </td>
                                    <td><span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem' }}>ZAKAT FITRAH</span></td>
                                    <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{m.jumlah_beras_kg} KG</td>
                                    <td>{m.tanggal_bayar ? new Date(m.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</td>
                                    <td>
                                        <div className="status-indicator">
                                            <div className={`dot ${m.status_bayar === 'lunas' ? 'dot-success' : 'dot-warning'}`}></div>
                                            <span style={{ color: m.status_bayar === 'lunas' ? 'var(--success)' : 'var(--warning)', letterSpacing: '0.5px' }}>
                                                {m.status_bayar === 'lunas' ? 'VERIFIED' : 'PENDING'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sedekah.slice(0, 5).map((s, index) => (
                                <tr key={s.id}>
                                    <td>{muzaki.length + index + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.amil?.nama || 'Umum'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.keterangan || 'Infaq Masjid'}</div>
                                    </td>
                                    <td><span style={{ color: s.jenis === 'penerimaan' ? 'var(--success)' : 'var(--danger)', fontWeight: 700, fontSize: '0.8rem' }}>{s.jenis === 'penerimaan' ? 'INFAQ' : 'PENYALURAN'}</span></td>
                                    <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>Rp {Number(s.jumlah).toLocaleString('id-ID')}</td>
                                    <td>{new Date(s.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</td>
                                    <td>
                                        <div className="status-indicator">
                                            <div className="dot dot-success"></div>
                                            <span style={{ color: 'var(--success)', letterSpacing: '0.5px' }}>COMPLETED</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
