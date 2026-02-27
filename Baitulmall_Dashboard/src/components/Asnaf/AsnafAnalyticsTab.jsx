import React, { useState, useEffect } from 'react';
import { ShieldAlert, Map, LineChart, TrendingUp, AlertTriangle, Briefcase, ChevronRight, Activity } from 'lucide-react';
import asnafAnalyticsApi from '../../services/asnafAnalyticsApi';

const AsnafAnalyticsTab = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anomalies, setAnomalies] = useState([]);
    const [heatmap, setHeatmap] = useState([]);
    const [hadKifayah, setHadKifayah] = useState(null);
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const [anomaliesRes, heatmapRes, hkRes, candidatesRes] = await Promise.all([
                    asnafAnalyticsApi.getAnomalies(),
                    asnafAnalyticsApi.getRtHeatmap(),
                    asnafAnalyticsApi.getHadKifayah(1500000), // Setting default to 1.5M per capita
                    asnafAnalyticsApi.getProductiveCandidates()
                ]);

                setAnomalies(anomaliesRes.data || []);
                setHeatmap(heatmapRes.data || []);
                setHadKifayah(hkRes.data || null);
                setCandidates(candidatesRes.data || []);
                setError(null);
            } catch (err) {
                console.error("Failed to load analytics", err);
                setError(err.message || 'Gagal memuat data analitik');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Memproses analitik data Asnaf skala besar...</p>
        </div>
    );

    if (error) return (
        <div className="alert alert-danger" style={{ margin: '2rem' }}>
            <ShieldAlert className="mr-2" /> {error}
        </div>
    );

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            {/* Header / Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card stat-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--danger)' }}>
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(252,66,74,0.1)', color: 'var(--danger)' }}>
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2rem', margin: 0 }}>{anomalies.length}</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Anomali Data Ditemukan</p>
                    </div>
                </div>
                <div className="card stat-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--warning-main)' }}>
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', color: 'var(--warning-main)' }}>
                        <Map size={28} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2rem', margin: 0 }}>{heatmap.length > 0 ? heatmap[0].rt : '-'}</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>RT Paling Rentan</p>
                    </div>
                </div>
                <div className="card stat-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--danger-main)' }}>
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger-main)' }}>
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>
                            Rp {hadKifayah ? (hadKifayah.total_defisit_ekstrem / 1000000).toFixed(1) : 0} Juta
                        </h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Total Defisit Had Kifayah</p>
                    </div>
                </div>
                <div className="card stat-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--success-main)' }}>
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--success-main)' }}>
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2rem', margin: 0 }}>{candidates.length}</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Kandidat Modal Usaha</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* 1. Anomaly Detection */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                        <ShieldAlert size={20} /> Deteksi Anomali Data (Fraud)
                    </h3>
                    <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {anomalies.length > 0 ? anomalies.map(anomaly => (
                            <div key={anomaly.id} style={{
                                padding: '1rem',
                                background: 'rgba(252,66,74,0.05)',
                                border: '1px solid rgba(252,66,74,0.2)',
                                borderRadius: '8px',
                                marginBottom: '0.75rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>{anomaly.nama}</strong>
                                    <span style={{ fontSize: '0.8rem', background: 'var(--danger)', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>
                                        RT {anomaly.rt} • {anomaly.kategori}
                                    </span>
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
                                    {anomaly.flags.map((flag, idx) => <li key={idx}>{flag}</li>)}
                                </ul>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <ShieldAlert size={32} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                                <p>Tidak ditemukan anomali pada data asnaf.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Candidate Zakat Produktif */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-main)' }}>
                        <Briefcase size={20} /> Rekomendasi Zakat Produktif (Modal)
                    </h3>
                    <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {candidates.length > 0 ? candidates.slice(0, 10).map((cand, i) => (
                            <div key={cand.id} style={{
                                padding: '1rem',
                                background: 'var(--table-row-hover)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                marginBottom: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'var(--success-main)', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0
                                }}>
                                    #{i + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                        {cand.nama}
                                        <span style={{ fontSize: '0.8rem', color: 'var(--success-main)', fontWeight: 600 }}>
                                            Skor: {cand.potensi_score}
                                        </span>
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {cand.reasons[0]} • Jiwa: {cand.jumlah_jiwa} • Kategori: {cand.kategori}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <p>Belum ada kandidat zakat produktif.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* 3. Had Kifayah */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning-main)' }}>
                        <TrendingUp size={20} /> Gap Had Kifayah (Urgensi Bantuan)
                    </h3>
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem' }}>
                        Standar yang digunakan: <strong>Rp {hadKifayah ? hadKifayah.standard_had_kifayah.toLocaleString('id-ID') : 0}</strong> / jiwa / bulan
                    </div>

                    <table className="table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                            <tr>
                                <th>Keluarga</th>
                                <th style={{ textAlign: 'right' }}>Defisit (Rp)</th>
                                <th style={{ textAlign: 'center' }}>Keparahan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hadKifayah?.top_deficits?.slice(0, 5).map(def => (
                                <tr key={def.id}>
                                    <td>
                                        <strong>{def.nama}</strong><br />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RT {def.rt} • {def.jumlah_jiwa} Jiwa</span>
                                    </td>
                                    <td style={{ textAlign: 'right', color: 'var(--danger-main)', fontWeight: 600 }}>
                                        - {def.defisit.toLocaleString('id-ID')}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{
                                            background: def.tingkat_keparahan > 80 ? 'var(--danger-main)' : 'var(--warning-main)',
                                            color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem'
                                        }}>
                                            {def.tingkat_keparahan}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 4. RT Heatmap */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--info)' }}>
                        <Map size={20} /> Heatmap Kerentanan Wilayah (RT)
                    </h3>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {heatmap.map((rtData, idx) => (
                            <div key={rtData.rt} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                                    <strong>RT {rtData.rt}</strong>
                                    <span style={{ color: 'var(--text-muted)' }}>Skor Kerentanan: {rtData.vulnerability_index}</span>
                                </div>
                                {/* Progress bar visualization */}
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(100, (rtData.vulnerability_index / (heatmap[0]?.vulnerability_index || 1)) * 100)}%`,
                                        background: idx === 0 ? 'var(--danger)' : (idx < 3 ? 'var(--warning-main)' : 'var(--info)'),
                                        borderRadius: '4px'
                                    }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <span>{rtData.total_kk_miskin} KK Prioritas</span>
                                    <span>{rtData.total_jiwa_rentan} Jiwa Rentan</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsnafAnalyticsTab;
