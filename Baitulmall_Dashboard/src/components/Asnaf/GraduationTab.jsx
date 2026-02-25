import React, { useState, useEffect } from 'react';
import { fetchGraduationIndex } from '../../services/asnafApi';
import { Loader2, TrendingUp, TrendingDown, Minus, Trophy, AlertCircle, Info } from 'lucide-react';

const GraduationTab = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [tahun, setTahun] = useState(new Date().getFullYear());

    useEffect(() => {
        loadData();
    }, [tahun]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetchGraduationIndex(tahun);
            setData(res);
        } catch (err) {
            console.error(err);
            setError('Gagal memuat data Indeks Graduasi. ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem', color: 'var(--text-muted)' }}>
                <Loader2 size={32} className="spin text-primary" />
                <span>Menganalisis data mobilitas sosial...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
                <AlertCircle size={40} style={{ marginBottom: '1rem', opacity: 0.8 }} />
                <p style={{ fontWeight: 600 }}>{error}</p>
                <button className="btn btn-outline" onClick={loadData} style={{ marginTop: '1rem' }}>Coba Lagi</button>
            </div>
        );
    }

    if (!data || !data.summary) return null;

    const summary = data.summary;
    const { graduated, improved, declined, stagnant } = data.details;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Indeks Graduasi Mustahik</h2>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>
                        Perbandingan skor kelayakan asnaf tahun <strong>{tahun}</strong> vs <strong>{tahun - 1}</strong>.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    {[2024, 2025, 2026].map(y => (
                        <button
                            key={y}
                            onClick={() => setTahun(y)}
                            className={`btn ${tahun === y ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600 }}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </div>

            {summary.total_evaluated === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Info size={48} className="text-info" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>Data Historis Tidak Cukup</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: '400px' }}>
                        Tidak ada data Asnaf pada tahun sebelumnya untuk membandingkan pergerakan mobilitas sosial di tahun {tahun}.
                    </p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                        <div className="stat-card" style={{ background: 'var(--card-bg)', border: '1px solid rgba(0,210,91,0.3)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.05, transform: 'rotate(15deg)' }}>
                                <Trophy size={100} />
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,210,91,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trophy size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', lineHeight: 1 }}>{summary.graduated}</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Lulus (Graduasi)</div>
                            </div>
                        </div>

                        <div className="stat-card" style={{ background: 'var(--card-bg)', border: '1px solid rgba(0,144,231,0.3)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,144,231,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{summary.improved}</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Kondisi Membaik</div>
                            </div>
                        </div>

                        <div className="stat-card" style={{ background: 'var(--card-bg)', border: '1px solid rgba(156,163,175,0.3)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(156,163,175,0.1)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Minus size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{summary.stagnant}</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Stagnan / Tetap</div>
                            </div>
                        </div>

                        <div className="stat-card" style={{ background: 'var(--card-bg)', border: '1px solid rgba(252,66,74,0.3)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(252,66,74,0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingDown size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{summary.declined}</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Kondisi Menurun</div>
                            </div>
                        </div>
                    </div>

                    {/* Lists */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>

                        {/* Box Graduasi */}
                        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid var(--success)' }}>
                            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                                <Trophy size={18} /> Lulus dari Garis Kemiskinan
                            </h3>
                            {graduated.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Belum ada asnaf yang lulus di tahun ini.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {graduated.map((item, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.1)', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
                                            <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>{item.nama} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(RT {item.rt})</span></div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Dari <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{item.prev_kategori}</span> ➔ <span style={{ color: 'var(--success)', fontWeight: 600 }}>{item.alasan}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Box Membaik */}
                        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary)' }}>
                            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                <TrendingUp size={18} /> Mengalami Peningkatan Skor
                            </h3>
                            {improved.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Belum ada data peningkatan skor.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {improved.map((item, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.1)', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>{item.nama} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(RT {item.rt})</span></div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.current_kategori}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{item.prev_score}</div>
                                                <TrendingUp size={12} className="text-primary" />
                                                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{item.current_score}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default GraduationTab;
