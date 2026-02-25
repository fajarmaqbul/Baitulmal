import React from 'react';
import { Users, CheckCircle, Circle, Filter } from 'lucide-react';

const DistributionTab = ({
    distribusiScope,
    setDistribusiScope,
    distribusiKategori,
    setDistribusiKategori,
    selectedRt,
    setSelectedRt,
    rtList,
    filteredAsnafDistribusi,
    totalJiwaView,
    totalBerasView,
    distribusiStatus,
    confirmDistribution,
    handleCheckAll,
    getBerasPerJiwa,
    zakatDistribution,
    toggleDistribusi,
    canConfirmDist
}) => {
    return (
        <div style={{ marginBottom: '1.5rem' }} className="animate-fade-in p-4">
            {/* Scope Selector */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button
                    className={`btn ${distribusiScope === 'warga' ? 'btn-primary' : 'btn-ghost'} `}
                    onClick={() => { setDistribusiScope('warga'); setDistribusiKategori('Fakir'); }}
                    style={{ flex: 1 }}
                >
                    <Users size={16} style={{ marginRight: '0.5rem' }} /> Warga (Per RT)
                </button>
                <button
                    className={`btn ${distribusiScope === 'khusus' ? 'btn-primary' : 'btn-ghost'} `}
                    onClick={() => { setDistribusiScope('khusus'); setDistribusiKategori('Amil'); }}
                    style={{ flex: 1 }}
                >
                    <CheckCircle size={16} style={{ marginRight: '0.5rem' }} /> Khusus (Amil & Sabil)
                </button>
            </div>

            {/* Filters Bar */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                {distribusiScope === 'warga' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={16} className="text-muted" />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>RT:</span>
                            <select
                                className="input"
                                style={{ width: '80px', padding: '0.5rem' }}
                                value={selectedRt}
                                onChange={(e) => setSelectedRt(e.target.value)}
                            >
                                {rtList.map(rt => (
                                    <option key={rt.kode} value={rt.kode}>{rt.kode}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ width: '1px', height: '24px', background: 'var(--card-border)' }}></div>
                    </>
                )}

                {/* Category Selector */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {distribusiScope === 'warga' ? (
                        <>
                            {['Fakir', 'Miskin'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setDistribusiKategori(cat)}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        border: '1px solid var(--primary)',
                                        background: distribusiKategori === cat ? 'var(--primary)' : 'transparent',
                                        color: distribusiKategori === cat ? '#fff' : 'var(--primary)',
                                        cursor: 'pointer', fontSize: '0.85rem'
                                    }}
                                >{cat}</button>
                            ))}
                        </>
                    ) : (
                        <>
                            {['Amil', 'Fisabilillah'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setDistribusiKategori(cat)}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        border: '1px solid var(--primary)',
                                        background: distribusiKategori === cat ? 'var(--primary)' : 'transparent',
                                        color: distribusiKategori === cat ? '#fff' : 'var(--primary)',
                                        cursor: 'pointer', fontSize: '0.85rem'
                                    }}
                                >{cat === 'Fisabilillah' ? 'Sabilillah' : cat}</button>
                            ))}
                        </>
                    )}
                </div>

                <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>
                        <strong>{filteredAsnafDistribusi.length}</strong> KK | <strong>{totalJiwaView}</strong> Jiwa | <strong style={{ color: 'var(--primary)' }}>{totalBerasView.toFixed(2)} KG</strong>
                    </span>
                    {Object.values(distribusiStatus).some(Boolean) && canConfirmDist && (
                        <button
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            onClick={confirmDistribution}
                        >
                            Konfirmasi Masuk Data
                        </button>
                    )}
                </span>
            </div>

            {/* Table */}
            <table className="table-compact" style={{ marginTop: '1rem' }}>
                <thead>
                    <tr>
                        <th style={{ width: '60px' }}>NO</th>
                        <th>Kepala Keluarga</th>
                        <th>Kategori</th>
                        {distribusiScope === 'khusus' && <th>Asal RT</th>}
                        <th style={{ textAlign: 'center' }}>Jiwa</th>
                        <th style={{ textAlign: 'center' }}>Jatah (KG)</th>
                        <th style={{ textAlign: 'center' }}>Total (KG)</th>
                        <th style={{ width: '180px' }}>
                            Status
                            <button
                                style={{
                                    marginLeft: '12px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: canConfirmDist ? 'pointer' : 'not-allowed',
                                    color: filteredAsnafDistribusi.length > 0 && filteredAsnafDistribusi.every(item => distribusiStatus[item.id]) ? 'var(--primary)' : 'var(--text-muted)',
                                    opacity: canConfirmDist ? 1 : 0.5
                                }}
                                onClick={canConfirmDist ? handleCheckAll : undefined}
                                title={canConfirmDist ? "Check All" : "Tidak ada izin"}
                            >
                                {filteredAsnafDistribusi.length > 0 && filteredAsnafDistribusi.every(item => distribusiStatus[item.id])
                                    ? <CheckCircle size={16} />
                                    : <Circle size={16} />
                                }
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAsnafDistribusi.map((item, index) => {
                        const perJiwa = getBerasPerJiwa(item.kategori);
                        const totalTerima = (Number(item.jumlah_jiwa) || 0) * perJiwa;
                        const isDistributed = (Array.isArray(zakatDistribution) ? zakatDistribution : []).map(Number).includes(Number(item.id));
                        const isSelected = !!distribusiStatus[item.id];

                        return (
                            <tr key={item.id} style={{ opacity: isDistributed ? 0.6 : 1 }}>
                                <td>{index + 1}</td>
                                <td style={{ fontWeight: 600 }}>{item.nama}</td>
                                <td>
                                    <span style={{
                                        padding: '2px 10px',
                                        borderRadius: '4px',
                                        background: 'rgba(255,255,255,0.05)',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        {item.kategori === 'Fisabilillah' ? 'Sabil' : item.kategori}
                                    </span>
                                </td>
                                {distribusiScope === 'khusus' && <td>RT {item.rt?.kode || '-'}</td>}
                                <td style={{ textAlign: 'center' }}>{item.jumlah_jiwa}</td>
                                <td style={{ textAlign: 'center' }}>{perJiwa.toFixed(2)}</td>
                                <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--primary)' }}>{totalTerima.toFixed(1)}</td>
                                <td>
                                    {isDistributed ? (
                                        <div style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                                            <CheckCircle size={14} /> DISTRIBUSI OK
                                        </div>
                                    ) : (
                                        <button
                                            className={`btn ${isSelected ? 'btn-danger' : 'btn-outline-primary'}`}
                                            style={{ width: '100%', padding: '0.25rem', fontSize: '0.7rem' }}
                                            onClick={() => canConfirmDist && toggleDistribusi(item.id)}
                                            disabled={!canConfirmDist}
                                        >
                                            {isSelected ? 'BATALKAN' : 'SALURKAN'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default React.memo(DistributionTab);
