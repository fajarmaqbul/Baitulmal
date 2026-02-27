import React, { useState, useEffect } from 'react';
import { Wallet, Users, ArrowRight, Loader2, Info } from 'lucide-react';
import { fetchCapacity, fetchLoyalty, fetchParticipation } from '../services/sedekahAnalyticsApi';

const SedekahAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [capacityData, setCapacityData] = useState(null);
    const [loyaltyData, setLoyaltyData] = useState([]);
    const [participationData, setParticipationData] = useState([]);
    const [unitCost, setUnitCost] = useState(100000);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const [cap, loy, part] = await Promise.all([
                fetchCapacity(unitCost),
                fetchLoyalty(),
                fetchParticipation()
            ]);
            setCapacityData(cap.data);
            setLoyaltyData(loy.data);
            setParticipationData(part.data);
        } catch (error) {
            console.error("Failed to load analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, [unitCost]);

    if (loading && !capacityData) {
        return (
            <div className="d-flex justify-content-center py-5">
                <Loader2 className="spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="sedekah-analytics fade-in">
            {/* CAPACITY CALCULATOR */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="glass-card p-4 border-0 shadow-sm" style={{
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(0, 144, 231, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div className="row align-items-center">
                            <div className="col-md-7">
                                <h4 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                                    <Wallet size={24} className="me-2 text-primary" />
                                    Kalkulator Daya Jangkau Bantuan
                                </h4>
                                <p className="mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>Estimasi jumlah penerima manfaat yang bisa dibantu dengan saldo saat ini.</p>

                                <div className="d-flex flex-wrap gap-4">
                                    <div className="stat-item">
                                        <div className="small text-uppercase fw-bold mb-1" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>Saldo Bersih</div>
                                        <div className="h3 fw-bold mb-0" style={{ color: 'var(--success)' }}>
                                            Rp {capacityData?.net_balance.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <div className="stat-item border-start ps-4" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                                        <div className="small text-uppercase fw-bold mb-1" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>Dapat Membantu</div>
                                        <div className="h3 fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                                            {capacityData?.capacity_count} <span className="small fw-normal" style={{ color: 'rgba(255,255,255,0.5)' }}>Kepala Keluarga</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-5 mt-4 mt-md-0">
                                <div className="p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <label className="small fw-bold mb-2 d-block" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>BIAYA PER PAKET BANTUAN (RP)</label>
                                    <div className="input-group">
                                        <span className="input-group-text border-0 ps-3 bg-transparent" style={{ color: 'rgba(255,255,255,0.5)' }}>Rp</span>
                                        <input
                                            type="number"
                                            className="input flex-grow-1 shadow-none"
                                            value={unitCost}
                                            onChange={(e) => setUnitCost(Number(e.target.value))}
                                            style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}
                                        />
                                    </div>
                                    <div className="mt-2 d-flex align-items-center gap-1 small" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                        <Info size={14} />
                                        <span>Sesuaikan nilai untuk simulasi</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* RT PARTICIPATION HEATMAP */}
                <div className="col-lg-12">
                    <div className="glass-card p-4 h-100" style={{ borderRadius: '20px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                                <Activity size={18} className="me-2 text-warning" />
                                Peta Keaktifan Wilayah (Heatmap RT)
                            </h5>
                        </div>
                        <div className="row g-3">
                            {participationData.map(rt => (
                                <div className="col-md-3" key={rt.rt_id}>
                                    <div className="p-3 rounded-4 border transition-all hover-lift" style={{
                                        background: rt.intensity === 'High' ? 'rgba(16, 185, 129, 0.1)' : (rt.intensity === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.05)'),
                                        borderColor: rt.intensity === 'High' ? 'rgba(16, 185, 129, 0.3)' : (rt.intensity === 'Medium' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)')
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold">RT {rt.rt_kode}</span>
                                            <span className={`badge ${rt.intensity === 'High' ? 'bg-success' : (rt.intensity === 'Medium' ? 'bg-warning' : 'bg-secondary')} opacity-75`}>
                                                {rt.intensity}
                                            </span>
                                        </div>
                                        <div className="h5 fw-bold mb-1">Rp {rt.participation_ratio.toLocaleString('id-ID')}</div>
                                        <div className="small" style={{ color: 'rgba(255,255,255,0.6)' }}>Per Muzaki ({rt.muzaki_count} Warga)</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* DONOR LOYALTY TABLE */}
                <div className="col-lg-12">
                    <div className="glass-card" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-color)' }}>
                            <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                                <Users size={18} className="me-2 text-info" />
                                Analisis Loyalitas Donatur (RFM)
                            </h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table-compact w-100">
                                <thead>
                                    <tr>
                                        <th className="ps-4">DONATUR</th>
                                        <th>STATUS</th>
                                        <th>FREKUENSI</th>
                                        <th className="text-end">TOTAL SEDEKAH</th>
                                        <th className="text-end pe-4">RECENCY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loyaltyData.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-4 text-muted">Belum ada data donatur teridentifikasi.</td></tr>
                                    ) : (
                                        loyaltyData.slice(0, 10).map((donor, idx) => (
                                            <tr key={idx}>
                                                <td className="ps-4">
                                                    <div className="fw-bold" style={{ color: 'var(--text-main)' }}>{donor.name}</div>
                                                    <div className="small" style={{ color: 'rgba(255,255,255,0.5)' }}>{donor.phone || '-'}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge rounded-pill ${donor.status === 'Loyal' ? 'bg-primary' :
                                                        (donor.status === 'Potensial' ? 'bg-success' :
                                                            (donor.status === 'Pasif' ? 'bg-secondary' : 'bg-info'))
                                                        } px-3`}>
                                                        {donor.status}
                                                    </span>
                                                </td>
                                                <td>{donor.frequency}x Pelunasan</td>
                                                <td className="text-end fw-bold text-success">Rp {donor.total_amount.toLocaleString('id-ID')}</td>
                                                <td className="text-end pe-4" style={{ color: 'rgba(255,255,255,0.6)' }}>{donor.recency_days} Hari lalu</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SedekahAnalytics;

import { Activity } from 'lucide-react'; 
