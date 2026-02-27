import React, { useState, useEffect } from 'react';
import {
    BrainCircuit,
    Info,
    ChevronRight,
    User,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Search,
    MapPin,
    Users
} from 'lucide-react';
import { fetchMustahikScores } from '../services/mustahikScoringApi';

const MustahikScoring = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetchMustahikScores();
                setData(res.data || []);
            } catch (err) {
                console.error('Failed to load scoring data', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredData = data.filter(item =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rt_kode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getScoreColor = (score) => {
        if (score >= 80) return '#ef4444'; // Red
        if (score >= 60) return '#f59e0b'; // Amber
        if (score >= 40) return '#3b82f6'; // Blue
        return '#10b981'; // Green
    };

    const getScoreBackground = (score) => {
        if (score >= 80) return 'rgba(239, 68, 68, 0.1)';
        if (score >= 60) return 'rgba(245, 158, 11, 0.1)';
        if (score >= 40) return 'rgba(59, 130, 246, 0.1)';
        return 'rgba(16, 185, 129, 0.1)';
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '400px', color: 'var(--text-muted)' }}>
                <BrainCircuit size={48} className="spin mb-3" style={{ opacity: 0.5 }} />
                <p className="fw-bold">Menganalisis Data Mustahik...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header / Intro */}
            <div className="card mb-4" style={{
                background: 'linear-gradient(135deg, rgba(0, 144, 231, 0.05) 0%, rgba(0, 144, 231, 0) 100%)',
                border: '1px solid rgba(0, 144, 231, 0.2)',
                padding: '1.5rem'
            }}>
                <div className="d-flex align-items-start gap-3">
                    <div style={{
                        padding: '0.8rem',
                        borderRadius: '12px',
                        background: 'var(--primary)',
                        color: '#fff',
                        boxShadow: '0 8px 16px rgba(0, 144, 231, 0.2)'
                    }}>
                        <BrainCircuit size={24} />
                    </div>
                    <div>
                        <h4 className="mb-1 fw-bold" style={{ color: 'var(--text-main)' }}>Mustahik AI Priority Scoring</h4>
                        <p className="small mb-0" style={{ maxWidth: '700px', color: 'rgba(255, 255, 255, 0.7)' }}>
                            Sistem ini menggunakan algoritma **Simple Additive Weighting (SAW)** untuk memberikan skor prioritas bantuan secara otomatis berdasarkan indikator kemiskinan (Pendapatan, Jumlah Tanggungan, dan Kondisi Fisik Rumah).
                        </p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="search-box" style={{ position: 'relative', width: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="form-control ps-5"
                        placeholder="Cari Nama atau RT..."
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', height: '42px', borderRadius: '10px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="small text-muted">
                    Menampilkan <span className="fw-bold text-main">{filteredData.length}</span> Warga Teranalisis
                </div>
            </div>

            {/* Ranking Grid */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredData.map((item, index) => (
                    <div key={item.id} className="card scoring-card-hover" style={{
                        padding: '1.25rem',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div className="row align-items-center">
                            {/* Rank & Info */}
                            <div className="col-md-5 d-flex align-items-center gap-3">
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: index < 3 ? 'var(--primary-light)' : 'var(--background)',
                                    color: index < 3 ? 'var(--primary)' : 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.9rem'
                                }}>
                                    #{index + 1}
                                </div>
                                <div>
                                    <div className="fw-bold text-main mb-0" style={{ fontSize: '1.05rem' }}>{item.nama}</div>
                                    <div className="d-flex gap-2 mt-1">
                                        <span className="badge bg-light text-dark small" style={{ fontSize: '0.7rem' }}>
                                            <MapPin size={10} className="me-1" /> RT {item.rt_kode}
                                        </span>
                                        <span className="badge bg-light text-dark small" style={{ fontSize: '0.7rem' }}>
                                            <TrendingUp size={10} className="me-1" /> {item.kategori}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics Breakdown */}
                            <div className="col-md-4">
                                <div className="d-flex gap-4">
                                    <div className="text-center">
                                        <div className="small text-muted mb-1" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pendapatan</div>
                                        <div className="fw-bold small">Rp {(item.metrics.income || 0).toLocaleString()}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="small text-muted mb-1" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggungan</div>
                                        <div className="fw-bold small d-flex align-items-center justify-content-center gap-1">
                                            <Users size={12} /> {item.metrics.family} Jiwa
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="small text-muted mb-1" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kepemilikan</div>
                                        <div className="fw-bold small">{item.metrics.status_rumah || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Score & Label */}
                            <div className="col-md-3 text-end">
                                <div className="d-inline-flex flex-column align-items-end">
                                    <div className="d-flex align-items-baseline gap-2">
                                        <span className="small text-muted fw-bold" style={{ fontSize: '0.7rem' }}>URGENCY SCORE</span>
                                        <span style={{
                                            fontSize: '1.4rem',
                                            fontWeight: 900,
                                            color: getScoreColor(item.score)
                                        }}>
                                            {item.score}
                                        </span>
                                    </div>
                                    <div className="px-2 py-1 rounded" style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        background: getScoreBackground(item.score),
                                        color: getScoreColor(item.score)
                                    }}>
                                        {item.ranking_label}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Legend */}
            <div className="mt-4 p-3 rounded d-flex justify-content-center gap-4 border" style={{ background: 'var(--background)', fontSize: '0.8rem' }}>
                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                    <span className="text-muted">Prioritas Utama ( {'>'} 80)</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
                    <span className="text-muted">Prioritas Tinggi (60 - 80)</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></div>
                    <span className="text-muted">Prioritas Menengah (40 - 60)</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                    <span className="text-muted">Monitor ({'<'} 40)</span>
                </div>
            </div>

            <style>{`
                .scoring-card-hover:hover {
                    transform: translateX(5px);
                    border-color: var(--primary) !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
            `}</style>
        </div>
    );
};

export default MustahikScoring;
