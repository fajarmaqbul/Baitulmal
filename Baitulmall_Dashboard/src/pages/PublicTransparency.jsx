import React, { useState, useEffect } from 'react';
import {
    Heart,
    Zap,
    ShieldCheck,
    TrendingUp,
    Users,
    ArrowRight,
    Globe,
    Landmark,
    ShoppingBag,
    Loader2,
    PieChart as PieIcon,
    BarChart as BarIcon,
    Activity,
    ChevronLeft,
    ChevronRight,
    Quote
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { fetchPublicStatistics, fetchPublicStories, fetchLiveStats } from '../services/transparencyApi';

const AnimatedNumber = ({ value, prefix = "", suffix = "", decimal = 0, isCompact = false }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = displayValue;
        let end = parseFloat(value);
        if (start === end) return;

        let totalDuration = 1000;
        let frameDuration = 1000 / 60;
        let totalFrames = Math.round(totalDuration / frameDuration);
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const easeOutQuad = progress * (2 - progress);
            const current = start + (end - start) * easeOutQuad;

            setDisplayValue(current);

            if (frame === totalFrames) {
                clearInterval(timer);
                setDisplayValue(end);
            }
        }, frameDuration);

        return () => clearInterval(timer);
    }, [value]);

    const format = (val) => {
        if (isCompact && val >= 1000000) {
            const millions = val / 1000000;
            return millions.toLocaleString('id-ID', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }) + " Jt";
        }
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: decimal,
            maximumFractionDigits: decimal
        }).format(val);
    };

    return (
        <span style={{
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            display: 'inline-block'
        }}>
            {prefix}{format(displayValue)}{suffix}
        </span>
    );
};

const PublicTransparency = () => {
    const [apiData, setApiData] = useState(null);
    const [liveStats, setLiveStats] = useState(null);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [selectedStory, setSelectedStory] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [statsRes, storiesRes, liveRes] = await Promise.all([
                    fetchPublicStatistics(),
                    fetchPublicStories(),
                    fetchLiveStats()
                ]);
                setApiData(statsRes);
                setStories(storiesRes.data || []);
                setLiveStats(liveRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();

        // Polling live stats every 10 seconds
        const pollInterval = setInterval(async () => {
            try {
                const liveRes = await fetchLiveStats();
                setLiveStats(liveRes.data);
                setLastUpdate(new Date());
            } catch (err) {
                console.error('Polling failed:', err);
            }
        }, 10000);

        return () => clearInterval(pollInterval);
    }, []);

    const nextStory = () => {
        setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
    };

    const prevStory = () => {
        setCurrentStoryIndex((prev) => (prev - 1 + stories.length) % stories.length);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212]">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-[#a1a1aa] font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Menghubungkan ke Baitulmal Public...</p>
            </div>
        );
    }

    const { recent_activity, current_year } = apiData || {};
    const stats = apiData?.stats || {};
    const distributed = stats?.distributed || {};

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#e4e4e7] selection:bg-primary selection:text-white font-['Inter',_sans-serif] scroll-smooth">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-2xl">
                <div className="w-full px-10 h-[72px] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/10">
                            <Heart className="text-white" size={18} fill="currentColor" />
                        </div>
                        <h3 className="font-black text-xl tracking-tighter text-white m-0 leading-none">Baitulmal<span className="text-primary"> Fajar Maqbul</span></h3>
                    </div>
                    <div className="flex items-center gap-10">
                        <a href="/public" className="text-[13px] font-bold text-white transition-all decoration-none border-b-2 border-primary pb-1">Public</a>
                        <a href="/tatakelola" className="text-[13px] font-bold text-[#94a3b8] hover:text-white transition-all decoration-none">Tata Kelola</a>
                        <a href="/tatakelola/zakat-fitrah" className="text-[13px] font-bold text-[#94a3b8] hover:text-white transition-all decoration-none">Zakat Fitrah</a>
                        <a href="/tatakelola/zakat-produktif" className="text-[13px] font-bold text-[#94a3b8] hover:text-white transition-all decoration-none">Zakat Produktif</a>
                        <a href="/etalase" className="text-[13px] font-bold text-[#94a3b8] hover:text-white transition-all decoration-none">Etalase</a>
                        <a href="/login" style={{
                            padding: '10px 20px', borderRadius: '12px', background: 'var(--primary)',
                            fontSize: '0.8rem', fontWeight: 800, color: 'white', textDecoration: 'none',
                            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.5)'
                        }}>ADMIN PORTAL</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header id="overview" className="relative h-[30vh] min-h-[300px] flex items-center justify-center px-10 overflow-hidden pt-0">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="file:///C:/Users/Ikiasaku/.gemini/antigravity/brain/4a0bba4a-0014-4de3-a1a4-a3f1e98d4afa/modern_charity_hero_1771851496593.png"
                        alt="Hero background"
                        className="w-full h-full object-cover opacity-20 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a] to-[#0a0a0a]"></div>
                </div>

                <div className="max-w-6xl mx-auto text-center relative z-10 transition-all mt-0">

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        Baitulmal <span className="text-primary">Fajar Maqbul</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-white text-base md:text-lg leading-relaxed font-bold mb-4 animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-150 uppercase tracking-[0.2em]">
                        ilallah, MaAllah, Fillah
                    </p>
                </div>
            </header>

            {/* Logistics Pipeline Cards, Analytics Hub & Information (v9) */}
            <section id="stats" className="px-10 -mt-36 relative z-20">
                <div className="max-w-7xl mx-auto">
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Beras Terkumpul', val: liveStats?.overall?.total_donasi_beras, unit: 'KG', color: '#0ea5e9', icon: TrendingUp },
                            { label: 'Total Mustahik', val: stats?.zakat?.mustahik_jiwa, unit: 'Jiwa', color: '#6366f1', icon: Users },
                            { label: 'Siap Distribusi', val: (stats?.zakat?.beras || 0) - (stats?.distributed?.fitrah_beras || 0), unit: 'KG', color: '#f59e0b', icon: Zap },
                            { label: 'Telah Terdistribusi', val: distributed?.fitrah_beras, unit: 'KG', color: '#10b981', icon: ShoppingBag },
                        ].map((item, i) => (
                            <div key={i} className="bg-[#121212] border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-[10px] font-black text-[#71717a] uppercase tracking-[0.3em] mb-4 relative z-10">{item.label}</span>
                                <div className="text-5xl font-black text-white leading-none tracking-tighter relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                                    <AnimatedNumber value={item.val || 0} />
                                </div>
                                <span className="text-xs font-bold text-[#71717a] mt-3 uppercase tracking-widest relative z-10 opacity-60">{item.unit}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* Grand Total Cash */}
                        <div className="bg-[#121212] border-2 border-primary/30 rounded-[3rem] p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] group/grand">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-30"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/[0.03] rounded-full blur-[120px]"></div>

                            <span className="text-primary font-black uppercase tracking-[0.5em] text-[12px] mb-8 block relative z-10 opacity-80">Total Saldo Public (Cash)</span>
                            <div className="text-[5.5rem] md:text-[7rem] font-black text-white m-0 tracking-tighter leading-none tabular-nums relative z-10 drop-shadow-[0_0_35px_rgba(var(--primary-rgb),0.3)]">
                                <AnimatedNumber value={liveStats?.overall?.total_donasi_cash || 0} prefix="Rp" isCompact={true} />
                            </div>

                            <div className="flex items-center gap-4 mt-8 relative z-10">
                                <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl">
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"></span>
                                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">LIVE DATA FEED — {lastUpdate.toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Fitrah Overview - Large View */}
                        <div className="bg-[#121212] border border-emerald-500/20 rounded-[3rem] p-12 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
                            <span className="text-emerald-500 font-black uppercase tracking-[0.5em] text-[12px] mb-8 block relative z-10 opacity-80">Pembayar Fitrah (Tahun Ini)</span>
                            <div className="flex items-center gap-16 relative z-10">
                                <div className="text-center">
                                    <div className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.1)]">
                                        <AnimatedNumber value={stats?.zakat?.jiwa || 0} />
                                    </div>
                                    <p className="text-[#71717a] font-black uppercase tracking-[0.3em] text-[10px] mt-4 m-0 opacity-60">Jiwa</p>
                                </div>
                                <div className="w-px h-20 bg-white/10"></div>
                                <div className="text-center">
                                    <div className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.1)]">
                                        <AnimatedNumber value={stats?.zakat?.muzaki || 0} />
                                    </div>
                                    <p className="text-[#71717a] font-black uppercase tracking-[0.3em] text-[10px] mt-4 m-0 opacity-60">KK (Muzaki)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Live Detailed Statistics */}
                    <div className="mb-20">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight m-0 uppercase italic">Live Counting Dashboard</h3>
                                <p className="text-[9px] font-bold text-[#71717a] tracking-[0.2em] uppercase m-0">Statistik Real-Time Per Kategori</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {[
                                { label: 'Zakat Fitrah', val: liveStats?.categories?.zakat_fitrah?.beras, unit: 'KG', color: '#0ea5e9' },
                                { label: 'Zakat Mal', val: liveStats?.categories?.zakat_mal?.nominal, unit: 'IDR', color: '#6366f1' },
                                { label: 'Sedekah', val: liveStats?.categories?.sedekah?.nominal, unit: 'IDR', color: '#10b981' },
                                { label: 'Santunan', val: liveStats?.categories?.santunan?.nominal, unit: 'IDR', color: '#f59e0b' },
                                { label: 'Tematik', val: liveStats?.categories?.donasi_tematik?.nominal, unit: 'IDR', color: '#ec4899' },
                            ].map((cat, i) => (
                                <div key={i} className="bg-[#121212] border border-white/10 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center group transition-all hover:border-white/20 relative overflow-hidden">
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-current opacity-40" style={{ color: cat.color }}></div>
                                    <span className="text-[10px] font-black text-[#71717a] uppercase tracking-[0.3em] block mb-5">{cat.label}</span>
                                    <div className="text-3xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                        <AnimatedNumber
                                            value={cat.val || 0}
                                            prefix={cat.unit === 'IDR' ? 'Rp' : ''}
                                            suffix={cat.unit === 'KG' ? ' KG' : ''}
                                            isCompact={cat.unit === 'IDR'}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <div className="bg-[#121212] border border-primary/20 p-10 rounded-[2.5rem] flex items-center justify-between group overflow-hidden relative shadow-xl">
                                <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div>
                                    <span className="text-[12px] font-black text-primary uppercase tracking-[0.4em] block mb-3 opacity-80">Total Donatur</span>
                                    <h4 className="text-6xl font-black text-white m-0 tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                        <AnimatedNumber value={liveStats?.overall?.jumlah_donatur || 0} />
                                    </h4>
                                </div>
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
                                    <Users size={36} />
                                </div>
                            </div>
                            <div className="bg-[#121212] border border-white/10 p-10 rounded-[2.5rem] flex items-center justify-between group overflow-hidden relative shadow-xl">
                                <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div>
                                    <span className="text-[12px] font-black text-[#71717a] uppercase tracking-[0.4em] block mb-3 opacity-80">Total Transaksi</span>
                                    <h4 className="text-6xl font-black text-white m-0 tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                        <AnimatedNumber value={liveStats?.overall?.jumlah_transaksi || 0} />
                                    </h4>
                                </div>
                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white/40 group-hover:scale-110 transition-transform">
                                    <Activity size={36} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Section: Activity Grid */}
            <section id="activity" className="py-16 px-10 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8">
                            <div className="flex items-center justify-between mb-12 pb-6 border-b border-white/[0.05]">
                                <h3 className="text-xl font-black text-white tracking-tight m-0 uppercase">Aktivitas Terkini</h3>
                                <span className="text-[9px] font-bold text-primary tracking-[0.2em] uppercase">Transparansi Publik</span>
                            </div>
                            <div className="space-y-3">
                                {recent_activity?.slice(0, 8).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-6 p-6 rounded-2xl bg-[#121212]/50 border border-white/[0.03] hover:border-white/[0.08] transition-all group">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${item.tipe === 'Zakat Fitrah' ? 'bg-blue-500/5 text-blue-500' :
                                            item.tipe === 'Zakat Mal' ? 'bg-primary/5 text-primary' : 'bg-emerald-500/5 text-emerald-500'
                                            }`}>
                                            {item.tipe === 'Zakat Fitrah' ? <Landmark size={18} /> :
                                                item.tipe === 'Zakat Mal' ? <Landmark size={18} /> : <Heart size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-bold text-white text-xs m-0 leading-none">{item.nama}</h4>
                                                <span className="text-[9px] font-bold text-[#71717a] uppercase tabular-nums opacity-60">{(new Date(item.tanggal)).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#71717a]">{item.tipe}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-white m-0 tabular-nums">
                                                {typeof item.nominal === 'number' ? formatCurrency(item.nominal) : item.nominal}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Solid CTA Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 p-10 rounded-[2rem] bg-[#121212] border border-white/[0.05] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <h4 className="text-xl font-black mb-6 leading-tight m-0 text-white">Butuh Dukungan? <br /> Hubungi Admin 🏠</h4>
                                <p className="text-[#a1a1aa] text-sm font-medium mb-10 m-0 leading-relaxed">
                                    Kepercayaan publik adalah prioritas kami. Hubungi sekretariat untuk informasi verifikasi data lebih lanjut.
                                </p>
                                <button className="w-full py-4 rounded-xl bg-primary text-white font-bold text-xs tracking-widest uppercase hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2">
                                    KONTAK SEKRETARIAT <ArrowRight size={14} />
                                </button>
                                <div className="mt-10 pt-10 border-t border-white/[0.05]">
                                    <p className="text-[10px] font-bold tracking-[0.2rem] text-primary uppercase m-0 mb-2">Lokasi Kami</p>
                                    <p className="text-[#71717a] text-xs font-medium m-0 leading-relaxed">Jl. Raya Kandri, Kec. Gunung Pati, Kota Semarang</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* Footer */}
            <footer className="py-16 border-t border-white/[0.03] text-center bg-black/20">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                        <Heart size={14} fill="currentColor" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-widest uppercase">Baitulmal Fajar Maqbul Portal</span>
                </div>
                <p className="text-[#a1a1aa] text-[9px] font-bold tracking-[0.5em] uppercase mb-10 m-0">Transparency &bull; Integrity &bull; Accountability</p>
                <div className="text-[10px] text-[#71717a] font-medium">&copy; {new Date().getFullYear()} Baitulmal Digital Ecosystem.</div>
            </footer>
        </div>
    );
};


export default PublicTransparency;
