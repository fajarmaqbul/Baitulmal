import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    Timer,
    AlertTriangle,
    CheckCircle2,
    TrendingDown,
    Wallet,
    Info,
    ArrowDownRight
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const RunwayAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_URL}/analytics/runway`);
                setData(res.data.data);
            } catch (err) {
                console.error('Failed to fetch runway data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4 text-center text-muted">Menganalisis Ketahanan Dana...</div>;
    if (!data) return null;

    const { current_balance, avg_monthly_spent, runway_months, status, projections } = data;

    const getStatusConfig = (status) => {
        switch (status) {
            case 'CRITICAL':
                return { color: '#ef4444', icon: <AlertTriangle className="text-danger" />, label: 'Kritis', bg: 'rgba(239, 68, 68, 0.1)' };
            case 'WARNING':
                return { color: '#f59e0b', icon: <AlertTriangle className="text-warning" />, label: 'Waspada', bg: 'rgba(245, 158, 11, 0.1)' };
            default:
                return { color: '#10b981', icon: <CheckCircle2 className="text-success" />, label: 'Aman', bg: 'rgba(16, 185, 129, 0.1)' };
        }
    };

    const config = getStatusConfig(status);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(20, 20, 20, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '10px',
                    borderRadius: '8px',
                    backdropFilter: 'blur(4px)'
                }}>
                    <p className="small mb-1 text-muted">{label}</p>
                    <p className="fw-bold mb-0" style={{ color: '#fff' }}>
                        Rp {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card border-0 shadow-sm overflow-hidden" style={{ background: 'var(--card-bg)', borderRadius: '16px' }}>
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                            <Timer size={20} className="text-primary" />
                            Runway Analytics
                        </h5>
                        <p className="small text-muted mb-0">Estimasi ketahanan dana berdasarkan tren pengeluaran</p>
                    </div>
                    <div className="px-3 py-1 rounded-pill d-flex align-items-center gap-2" style={{ background: config.bg, color: config.color, fontSize: '0.75rem', fontWeight: 700 }}>
                        {config.icon}
                        {config.label}
                    </div>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="p-3 rounded-xl border bg-light-soft h-100">
                            <div className="small text-muted mb-2 d-flex align-items-center gap-1">
                                <Wallet size={14} /> Saldo Tersedia
                            </div>
                            <h4 className="fw-bold mb-0">
                                Rp {current_balance.toLocaleString()}
                            </h4>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 rounded-xl border bg-light-soft h-100">
                            <div className="small text-muted mb-2 d-flex align-items-center gap-1">
                                <TrendingDown size={14} /> Pengeluaran Bulanan
                            </div>
                            <h4 className="fw-bold mb-0">
                                Rp {avg_monthly_spent.toLocaleString()}
                            </h4>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 rounded-xl border h-100 text-white" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0076bd 100%)' }}>
                            <div className="small opacity-80 mb-2 d-flex align-items-center gap-1">
                                <Timer size={14} /> Sisa Ketahanan
                            </div>
                            <h3 className="fw-black mb-0">
                                {runway_months < 0 ? 'Habis' : `${runway_months} Bulan`}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-end mb-3">
                        <div className="small fw-bold text-uppercase letter-spacing-1" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                            Proyeksi Saldo (6 Bulan Ke Depan)
                        </div>
                        {runway_months < 3 && runway_months >= 0 && (
                            <div className="small text-warning d-flex align-items-center gap-1">
                                <ArrowDownRight size={14} /> Dana menipis segera!
                            </div>
                        )}
                    </div>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                            <AreaChart data={projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                                />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorBalance)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-4 p-3 rounded bg-warning-soft border border-warning d-flex gap-3">
                    <Info size={20} className="text-warning shrink-0" />
                    <p className="small mb-0 text-white" style={{ lineHeight: '1.4', opacity: 0.8 }}>
                        <strong>Tip Keuangan:</strong> {runway_months >= 6
                            ? "Kondisi keuangan sangat sehat. Anda dapat mempertimbangkan program santunan baru atau peningkatan nominal bantuan."
                            : "Disarankan untuk meningkatkan aktivitas penggalangan dana dalam waktu dekat untuk menjaga kestabilan program santunan."}
                    </p>
                </div>
            </div>

            <style>{`
                .rounded-xl { border-radius: 12px; }
                .bg-light-soft { background: rgba(255,255,255,0.02); }
                .bg-warning-soft { background: rgba(245, 158, 11, 0.05); }
                .letter-spacing-1 { letter-spacing: 1px; }
            `}</style>
        </div>
    );
};

export default RunwayAnalytics;
