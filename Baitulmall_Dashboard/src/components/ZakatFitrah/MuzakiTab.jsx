import React from 'react';
import { Search, Printer, Edit2, Trash2, Loader2, Plus, AlertCircle } from 'lucide-react';

const MuzakiTab = ({
    muzakiList,
    pagination,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    loading,
    handleOpenReceipt,
    handleEdit,
    handleDeleteClick,
    canDeleteMuzaki
}) => {
    return (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: 'none' }}>
            <div className="overflow-x-auto">
                <table className="table-compact w-full">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>NO</th>
                            <th>Nama Muzaki</th>
                            <th>RT</th>
                            <th style={{ textAlign: 'center' }}>Jiwa</th>
                            <th>Jumlah Beras</th>
                            <th>Status</th>
                            <th>Input Stamp</th>
                            <th style={{ width: '150px', textAlign: 'center' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" className="text-center py-8"><Loader2 className="spin" /></td></tr>
                        ) : muzakiList.map((m, index) => (
                            <tr key={m.id}>
                                <td>{index + 1}</td>
                                <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{m.nama}</td>
                                <td><span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>RT {m.rt?.kode || '-'}</span></td>
                                <td style={{ textAlign: 'center', fontWeight: 600 }}>{m.jumlah_jiwa}</td>
                                <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{Number(m.jumlah_beras_kg).toLocaleString()} KG</td>
                                <td>
                                    <div className="status-indicator">
                                        <div className="dot dot-success"></div>
                                        <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.75rem' }}>VERIFIED</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                            {m.updater?.name || m.creator?.name || 'Sistem'}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            {m.updated_at ? new Date(m.updated_at).toLocaleDateString('id-ID') : '-'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--primary)' }} onClick={() => handleOpenReceipt(m)} title="Cetak Kuitansi"><Printer size={14} /></button>
                                        <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => handleEdit(m)}><Edit2 size={14} /></button>
                                        {canDeleteMuzaki && (
                                            <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => handleDeleteClick(m.id)} title="Hapus"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination.last_page > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-[var(--border-color)] bg-[rgba(0,0,0,0.01)]">
                    <span className="text-xs text-muted">
                        Halaman {pagination.current_page} dari {pagination.last_page}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1 || loading}
                            className="px-3 py-1 text-xs rounded border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Sebelumnya
                        </button>
                        <button
                            onClick={() => setPage(prev => Math.min(prev + 1, pagination.last_page))}
                            disabled={page === pagination.last_page || loading}
                            className="px-3 py-1 text-xs rounded border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(MuzakiTab);
