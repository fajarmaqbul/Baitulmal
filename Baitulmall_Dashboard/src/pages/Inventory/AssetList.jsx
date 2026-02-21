import React, { useState, useEffect } from 'react';
import { fetchAssets, createAsset, deleteAsset } from '../../services/inventoryApi';
import { Plus, Search, Trash2, Edit, Box, Loader2, X } from 'lucide-react';

const AssetList = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // New Asset Form State
    const [newAsset, setNewAsset] = useState({
        name: '',
        code: '',
        category: 'Elektronik',
        condition: 'good',
        value: '',
        is_lendable: true
    });

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        setLoading(true);
        try {
            const data = await fetchAssets();
            setAssets(data);
        } catch (error) {
            console.error("Failed to load assets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createAsset(newAsset);
            setIsCreating(false);
            setNewAsset({ name: '', code: '', category: 'Elektronik', condition: 'good', value: '', is_lendable: true });
            loadAssets();
        } catch (error) {
            alert('Gagal membuat aset. Pastikan kode unik.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin hapus aset ini?')) {
            try {
                await deleteAsset(id);
                loadAssets();
            } catch (error) {
                alert('Gagal menghapus aset');
            }
        }
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
    };

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Inventaris Aset</h2>
                    <p className="small mb-0" style={{ color: 'var(--text-muted)' }}>Kelola aset masjid dan barang inventaris</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 fw-bold"
                    onClick={() => setIsCreating(true)}
                >
                    <Plus size={16} /> Tambah Aset
                </button>
            </div>

            {/* STATS SUMMARY (Optional) */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="glass-card d-flex align-items-center gap-3 p-3">
                        <div style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <Box size={24} />
                        </div>
                        <div>
                            <p className="mb-0 small text-muted font-weight-bold">Total Aset</p>
                            <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{assets.length}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <div className="position-relative">
                    <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                    <input
                        type="text"
                        className="input w-100 ps-5"
                        placeholder="Cari nama barang atau kode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* ASSETS GRID */}
            {loading ? (
                <div className="text-center py-5">
                    <Loader2 className="spin" size={40} style={{ color: 'var(--primary)' }} />
                </div>
            ) : (
                <div className="row g-3">
                    {filteredAssets.length === 0 ? (
                        <div className="col-12 p-5 text-center text-muted border dashed rounded">
                            Tidak ada data aset ditemukan.
                        </div>
                    ) : (
                        filteredAssets.map(asset => (
                            <div key={asset.id} className="col-md-6 col-lg-4">
                                <div className="glass-card h-100 p-0 overflow-hidden hover-lift d-flex flex-column">
                                    <div className="p-3 d-flex justify-content-between align-items-start border-bottom" style={{ borderColor: 'var(--border-color)', background: 'rgba(255, 255, 255, 0.03)' }}>
                                        <div>
                                            <span className="badge bg-secondary mb-1" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{asset.category}</span>
                                            <h5 className="fw-bold mb-0 text-truncate" style={{ color: 'var(--text-main)', maxWidth: '200px' }}>{asset.name}</h5>
                                            <small className="font-monospace text-muted">{asset.code}</small>
                                        </div>
                                        <button className="btn btn-ghost btn-sm text-danger p-1" onClick={() => handleDelete(asset.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="p-3 flex-grow-1">
                                        <div className="d-flex justify-content-between mb-2 small">
                                            <span className="text-muted">Nilai:</span>
                                            <span className="fw-bold" style={{ color: 'var(--text-main)' }}>{asset.value ? formatRupiah(asset.value) : '-'}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2 small">
                                            <span className="text-muted">Kondisi:</span>
                                            <span className={`badge ${asset.condition === 'good' ? 'bg-success' : asset.condition === 'damaged' ? 'bg-warning' : 'bg-danger'}`}>
                                                {asset.condition === 'good' ? 'Baik' : asset.condition === 'damaged' ? 'Rusak' : 'Hilang'}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-0 small">
                                            <span className="text-muted">Status:</span>
                                            <span className={asset.is_lendable ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                                {asset.is_lendable ? 'Bisa Saja Dipinjam' : 'Tidak Dipinjamkan'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* CREATE MODAL */}
            {isCreating && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-card shadow-lg p-0 fade-in action-menu" style={{ width: '600px', borderRadius: '16px', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-color)' }}>
                            <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Tambah Aset Baru</h5>
                            <button className="btn btn-sm btn-ghost" onClick={() => setIsCreating(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleCreate}>
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <div className="mb-3">
                                            <label className="label mb-1 small fw-bold text-muted">Nama Barang</label>
                                            <input
                                                className="input w-100"
                                                placeholder="Contoh: Sound System Portable"
                                                value={newAsset.name}
                                                onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="label mb-1 small fw-bold text-muted">Kode</label>
                                            <input
                                                className="input w-100"
                                                placeholder="INF-001"
                                                value={newAsset.code}
                                                onChange={e => setNewAsset({ ...newAsset, code: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="label mb-1 small fw-bold text-muted">Kategori</label>
                                            <select
                                                className="input w-100"
                                                value={newAsset.category}
                                                onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
                                            >
                                                <option value="Elektronik">Elektronik</option>
                                                <option value="Furniture">Furniture</option>
                                                <option value="Kendaraan">Kendaraan</option>
                                                <option value="Perlengkapan">Perlengkapan</option>
                                                <option value="Lainnya">Lainnya</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="label mb-1 small fw-bold text-muted">Kondisi</label>
                                            <select
                                                className="input w-100"
                                                value={newAsset.condition}
                                                onChange={e => setNewAsset({ ...newAsset, condition: e.target.value })}
                                            >
                                                <option value="good">Baik</option>
                                                <option value="damaged">Rusak</option>
                                                <option value="lost">Hilang</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="label mb-1 small fw-bold text-muted">Nilai Aset (Rp)</label>
                                            <input
                                                type="number"
                                                className="input w-100"
                                                placeholder="0"
                                                value={newAsset.value}
                                                onChange={e => setNewAsset({ ...newAsset, value: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="lendableSwitch"
                                                checked={newAsset.is_lendable}
                                                onChange={e => setNewAsset({ ...newAsset, is_lendable: e.target.checked })}
                                            />
                                            <label className="form-check-label small" htmlFor="lendableSwitch" style={{ color: 'var(--text-main)' }}>
                                                Bisa dipinjamkan ke warga?
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button type="button" className="btn btn-ghost" onClick={() => setIsCreating(false)} style={{ color: 'var(--text-muted)' }}>Batal</button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold">Simpan Aset</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetList;
