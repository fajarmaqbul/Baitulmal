import React from 'react';
// Deprecated context removed
console.warn('Deprecated context detected in Dashboard.jsx');
import {
    TrendingUp,
    Users,
    Gift,
    Heart,
    Coins,
    ArrowUpRight,
    MapPin
} from 'lucide-react';
import { fetchAsnafStatistics } from '../services/asnafApi';
import { fetchZakatFitrahList } from '../services/zakatFitrahApi';
import { fetchSedekahList } from '../services/santunanApi';
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
import { Bar, Pie, Line } from 'react-chartjs-2';

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
    // Local state placeholders (replace with real API calls later)
    const [muzaki, setMuzaki] = React.useState([]);
    const [sedekah, setSedekah] = React.useState([]);
    const [asnafStats, setAsnafStats] = React.useState(null);
    const [cardTheme, setCardTheme] = React.useState('clean');
    const [themeStyles, setThemeStyles] = React.useState({
        clean: {
            wrapper: { padding: '1.25rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' },
            iconBox: { padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'inline-flex', color: 'var(--text-main)' },
            pill: { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px' },
            number: { fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' },
            label: { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }
        },
        simple: { wrapper: {}, label: {}, number: {}, pill: {} },
        modern: { wrapper: { borderRadius: '12px' }, label: {}, number: {}, pill: {}, iconBox: { padding: '10px', borderRadius: '10px' } },
        classic: { wrapper: { borderRadius: '12px' }, label: {}, number: {}, pill: {}, iconBox: { padding: '10px', borderRadius: '10px' } }
    });
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load data from API
    React.useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                const currentYear = new Date().getFullYear();

                const [statsRes, muzakiRes, sedekahRes] = await Promise.all([
                    fetchAsnafStatistics(currentYear),
                    fetchZakatFitrahList({ per_page: 5 }),
                    fetchSedekahList({ per_page: 5 })
                ]);

                setAsnafStats(statsRes);
                setMuzaki(muzakiRes.data || []);
                setSedekah(sedekahRes.data || []);
            } catch (err) {
                console.error('Failed to load Dashboard data:', err);
                setError(err?.message || 'Gagal memuat data Dashboard');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);


    const totalZakatFitrah = muzaki.reduce((acc, curr) => acc + (curr.jumlah_jiwa || 0), 0);
    const totalSedekah = sedekah.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
    const totalSantunan = 0; // Placeholder
    const totalZakatMall = 0; // Placeholder

    const cardStats = [
        { label: 'Total Muzaki (Jiwa)', value: `${totalZakatFitrah.toLocaleString()}`, icon: Gift, color: '#4B49AC', trend: '+12%' },
        { label: 'Total Sedekah', value: `Rp ${totalSedekah.toLocaleString()}`, icon: Heart, color: '#F95F53', trend: '+5%' },
        { label: 'Total Asnaf (KK)', value: `${asnafStats?.total_kk || 0}`, icon: Users, color: '#00D1B2', trend: '+2%' },
        { label: 'Total Jiwa Asnaf', value: `${asnafStats?.total_jiwa || 0}`, icon: TrendingUp, color: '#FFA117', trend: '+4%' },
    ];

    // Prepare RT Chart Data
    const rtLabels = asnafStats ? Object.keys(asnafStats.by_rt_kategori) : [];
    const fakirData = rtLabels.map(rt => asnafStats.by_rt_kategori[rt]?.['Fakir'] || 0);
    const miskinData = rtLabels.map(rt => asnafStats.by_rt_kategori[rt]?.['Miskin'] || 0);

    const rtChartData = {
        labels: rtLabels.map(rt => `RT ${rt}`),
        datasets: [
            {
                label: 'Fakir',
                data: fakirData,
                backgroundColor: '#F95F53',
                borderRadius: 4,
            },
            {
                label: 'Miskin',
                data: miskinData,
                backgroundColor: '#FFA117',
                borderRadius: 4,
            }
        ]
    };

    const distributionData = {
        labels: ['Fakir', 'Miskin', 'Amil', 'Lainnya'],
        datasets: [{
            data: asnafStats ? [
                asnafStats.by_kategori['Fakir']?.jumlah_kk || 0,
                asnafStats.by_kategori['Miskin']?.jumlah_kk || 0,
                asnafStats.by_kategori['Amil']?.jumlah_kk || 0,
                (asnafStats.total_kk || 0) - (asnafStats.by_kategori['Fakir']?.jumlah_kk || 0) - (asnafStats.by_kategori['Miskin']?.jumlah_kk || 0) - (asnafStats.by_kategori['Amil']?.jumlah_kk || 0)
            ] : [0, 0, 0, 0],
            backgroundColor: ['#F95F53', '#FFA117', '#4B49AC', '#e2e8f0'],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#6C7383' } },
            y: { grid: { color: '#f1f1f1' }, ticks: { color: '#6C7383' } }
        }
    };

    return (
        <div>
            <header className="header">
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Welcome back, Admin</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Here's what's happening with the Baitulmall today.</p>
                </div>
            </header>

            <div className="stats-grid">
                {cardStats.map((stat, i) => {
                    const currentStyle = themeStyles[cardTheme];
                    return (
                        <div key={i} className="stat-hover" style={currentStyle.wrapper}>
                            {cardTheme === 'simple' ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '4px', height: '24px', background: stat.color, borderRadius: '2px' }}></div>
                                        <span style={currentStyle.label}>{stat.label}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={currentStyle.number}>{stat.value}</div>
                                        <span style={{ fontSize: '0.75rem', color: stat.color }}>{stat.trend}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ ...currentStyle.iconBox, background: cardTheme === 'modern' ? stat.color : `${stat.color}15`, color: cardTheme === 'modern' ? '#fff' : stat.color }}>
                                            <stat.icon size={cardTheme === 'simple' ? 0 : 18} strokeWidth={2} />
                                        </div>
                                        <span style={{
                                            ...currentStyle.pill,
                                            color: stat.color,
                                            background: `${stat.color}15`,
                                            borderRadius: '12px'
                                        }}>
                                            {stat.trend}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 style={{ ...currentStyle.number, fontSize: '1.5rem', color: cardTheme === 'classic' ? '#0f172a' : 'var(--text-main)' }}>
                                            {stat.value}
                                        </h3>
                                        <p style={currentStyle.label}>
                                            {stat.label}
                                        </p>
                                    </div>

                                    {cardTheme === 'clean' && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background: stat.color,
                                            opacity: 0.6
                                        }} />
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Penyebaran Asnaf per RT</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fakir & Miskin</span>
                    </div>
                    <div style={{ height: '300px' }}>
                        <Bar
                            data={rtChartData}
                            options={{
                                ...chartOptions,
                                plugins: { legend: { display: true, position: 'bottom' } },
                                scales: {
                                    y: { beginAtZero: true, grid: { color: '#f1f1f1' } },
                                    x: { grid: { display: false } }
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Distribui Sumber Dana</h4>
                        <Users size={20} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        <Pie data={distributionData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Aktivitas Terbaru</h4>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>View All</button>
                </div>
                <div className="table-container">
                    <table className="table-compact">
                        <thead>
                            <tr>
                                <th className="col-no">NO</th>
                                <th>NAMA / SUMBER</th>
                                <th>KATEGORI</th>
                                <th>NOMINAL</th>
                                <th>TANGGAL</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {muzaki.map((m, index) => (
                                <tr key={m.id}>
                                    <td className="col-no">{index + 1}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.nama}</td>
                                    <td>Zakat Fitrah</td>
                                    <td style={{ fontWeight: 600 }}>{m.jumlah_beras_kg} Kg</td>
                                    <td>{m.tanggal_bayar ? new Date(m.tanggal_bayar).toLocaleDateString('id-ID') : '-'}</td>
                                    <td>
                                        <div className="status-indicator">
                                            <div className={`dot ${m.status_bayar === 'lunas' ? 'dot-success' : 'dot-warning'}`}></div>
                                            {m.status_bayar === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sedekah.map((s, index) => (
                                <tr key={s.id}>
                                    <td className="col-no">{muzaki.length + index + 1}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.amil?.nama || 'Umum'}</td>
                                    <td>{s.jenis === 'penerimaan' ? 'Infaq/Sedekah' : 'Penyaluran'}</td>
                                    <td style={{ fontWeight: 600 }}>Rp {Number(s.jumlah).toLocaleString('id-ID')}</td>
                                    <td>{new Date(s.tanggal).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <div className="status-indicator">
                                            <div className="dot dot-success"></div>
                                            Verified
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
