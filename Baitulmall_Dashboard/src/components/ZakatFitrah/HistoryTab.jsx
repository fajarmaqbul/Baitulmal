import React, { useMemo } from 'react';
import { Trash2, CheckCircle, Circle } from 'lucide-react';

const HistoryTab = ({
    distribusiHistoryList,
    selectedHistoryIds,
    toggleHistorySelection,
    toggleAllHistorySelection,
    setBulkDistDeleteModal,
    setDistDeleteModal,
    canDeleteMuzaki
}) => {
    const groupedHistory = useMemo(() => {
        return distribusiHistoryList.reduce((acc, curr) => {
            const cat = curr.kategori_asnaf || 'Lainnya';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(curr);
            return acc;
        }, {});
    }, [distribusiHistoryList]);

    if (distribusiHistoryList.length === 0) {
        return (
            <div className="table-container">
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                    <p style={{ fontStyle: 'italic' }}>Belum ada data distribusi yang tercatat.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--success)' }}>Laporan Distribusi Realisasi (Grup by Asnaf)</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Ringkasan realisasi penyaluran beras berdasarkan kategori Mustahik.
                    </p>
                </div>
                {selectedHistoryIds.length > 0 && canDeleteMuzaki && (
                    <button
                        className="btn btn-primary"
                        style={{ background: 'var(--danger)', borderColor: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => setBulkDistDeleteModal({ open: true, loading: false })}
                    >
                        <Trash2 size={16} /> Hapus Terpilih ({selectedHistoryIds.length})
                    </button>
                )}
            </div>

            {Object.entries(groupedHistory).map(([category, items]) => (
                <div key={category} className="glass-card" style={{ marginBottom: '2rem', padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div style={{
                        padding: '0.75rem 1.25rem',
                        background: 'rgba(59, 130, 246, 0.08)',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h4 style={{ margin: 0, color: 'var(--primary)', fontWeight: 800 }}>{category}</h4>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                            Total Group: <span style={{ color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>{items.reduce((sum, i) => sum + Number(i.jumlah_kg), 0).toFixed(2)} KG</span>
                        </div>
                    </div>
                    <div style={{ padding: '0.5rem' }}>
                        <table className="table-compact">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px', textAlign: 'center' }}>
                                        {canDeleteMuzaki && (
                                            <button
                                                onClick={canDeleteMuzaki ? toggleAllHistorySelection : undefined}
                                                style={{ border: 'none', background: 'transparent', cursor: canDeleteMuzaki ? 'pointer' : 'not-allowed', color: selectedHistoryIds.length === distribusiHistoryList.length && distribusiHistoryList.length > 0 ? 'var(--primary)' : 'var(--text-muted)', opacity: canDeleteMuzaki ? 1 : 0.5 }}
                                                title={canDeleteMuzaki ? "Pilih Semua" : "Tidak ada izin"}
                                            >
                                                {selectedHistoryIds.length === distribusiHistoryList.length && distribusiHistoryList.length > 0 ? <CheckCircle size={16} /> : <Circle size={16} />}
                                            </button>
                                        )}
                                    </th>
                                    <th style={{ width: '50px' }}>NO</th>
                                    <th>Nama Penerima</th>
                                    <th>RT</th>
                                    <th style={{ textAlign: 'center' }}>Jumlah Beras</th>
                                    <th>Tgl Distribusi</th>
                                    <th>Admin Audit</th>
                                    <th style={{ textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, iIdx) => (
                                    <tr key={item.id} style={{ background: selectedHistoryIds.includes(item.id) ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                                        <td style={{ textAlign: 'center' }}>
                                            {canDeleteMuzaki && (
                                                <button
                                                    onClick={canDeleteMuzaki ? () => toggleHistorySelection(item.id) : undefined}
                                                    style={{ border: 'none', background: 'transparent', cursor: canDeleteMuzaki ? 'pointer' : 'not-allowed', color: selectedHistoryIds.includes(item.id) ? 'var(--primary)' : 'var(--text-muted)', opacity: canDeleteMuzaki ? 1 : 0.5 }}
                                                    title={canDeleteMuzaki ? "Pilih item ini" : "Tidak ada izin"}
                                                >
                                                    {selectedHistoryIds.includes(item.id) ? <CheckCircle size={16} /> : <Circle size={16} />}
                                                </button>
                                            )}
                                        </td>
                                        <td>{iIdx + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{item.asnaf?.nama || '-'}</td>
                                        <td>RT {item.asnaf?.rt?.kode || '-'}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--success)' }}>{Number(item.jumlah_kg).toFixed(2)} KG</td>
                                        <td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                                        <td style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            oleh {item.admin?.name || 'Sistem'}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {canDeleteMuzaki && (
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ color: 'var(--danger)', padding: '0.25rem' }}
                                                    onClick={() => setDistDeleteModal({ open: true, id: item.id, loading: false })}
                                                    title="Hapus / Batalkan Penyaluran"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default React.memo(HistoryTab);
