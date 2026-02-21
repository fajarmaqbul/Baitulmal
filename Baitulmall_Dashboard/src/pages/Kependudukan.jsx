import React, { useState } from 'react';
// Deprecated context removed
// Deprecated context removed
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Filter,
    Users as UsersIcon,
    Home
} from 'lucide-react';

const Kependudukan = () => {
    // Local state placeholders (replace with real API calls later)
    const [penduduk, setPenduduk] = React.useState([
        { id: 1, nama: 'Budi Santoso', alamat: 'Kandri RT 01/01 No. 5', rt: '01', rw: '01', asnaf: true },
        { id: 2, nama: 'Siti Aminah', alamat: 'Kandri RT 01/01 No. 12', rt: '01', rw: '01', asnaf: false }
    ]);
    const [rtRw, setRtRw] = React.useState([
        { id: 1, kode: '01', rw: '01', ketua: 'Gunawan' },
        { id: 2, kode: '02', rw: '01', ketua: 'Supriyanto' }
    ]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ nama: '', alamat: '', rt: '01', rw: '01', asnaf: false });

    const filteredPenduduk = penduduk.filter(p =>
        p.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            setPenduduk(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
        } else {
            setPenduduk(prev => [...prev, { id: Date.now(), ...formData }]);
        }
        setShowModal(false);
        setEditingId(null);
        setFormData({ nama: '', alamat: '', rt: '01', rw: '01', asnaf: false });
    };

    const handleEdit = (p) => {
        setFormData(p);
        setEditingId(p.id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Hapus data penduduk ini?')) {
            setPenduduk(prev => prev.filter(p => p.id !== id));
        }
    };

    const statsPerRt = rtRw.map(rt => {
        const residents = penduduk.filter(p => p.rt === rt.kode);
        const asnafCount = residents.filter(p => p.asnaf).length;
        return { ...rt, total: residents.length, asnaf: asnafCount };
    });

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <UsersIcon className="text-primary" size={28} />
                        Data Kependudukan
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manajemen data RT, RW, dan Penduduk (Asnaf/Non-Asnaf).</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ height: '42px', fontWeight: 700 }}>
                    <Plus size={18} className="me-2" /> Tambah Penduduk
                </button>
            </div>

            <div className="stats-grid">
                {statsPerRt.map(stat => (
                    <div key={stat.id} className="card stat-hover" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(0, 144, 231, 0.1)', color: 'var(--primary)' }}>
                                <Home size={18} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>RT {stat.kode} / RW {stat.rw}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{stat.total}</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>TOTAL WARGA</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="status-indicator" style={{ justifyContent: 'flex-end' }}>
                                    <div className="dot dot-success"></div>
                                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }}>{stat.asnaf}</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>ASNAF</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Cari nama penduduk..."
                            style={{ paddingLeft: '36px', height: '42px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-ghost" style={{ border: '1px solid var(--border-color)', height: '42px' }}>
                        <Filter size={18} className="me-2" /> Filter Wilayah
                    </button>
                </div>

                <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                    <table className="table-compact">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>NO</th>
                                <th>Nama Lengkap</th>
                                <th>Alamat</th>
                                <th style={{ textAlign: 'center' }}>RT/RW</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPenduduk.length > 0 ? filteredPenduduk.map((p, index) => (
                                <tr key={p.id}>
                                    <td>{index + 1}</td>
                                    <td style={{ fontWeight: 600 }}>{p.nama}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.alamat}</td>
                                    <td style={{ textAlign: 'center' }}><span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>{p.rt}/{p.rw}</span></td>
                                    <td>
                                        <div className="status-indicator" style={{ justifyContent: 'center' }}>
                                            <div className={`dot ${p.asnaf ? 'dot-success' : 'dot-muted'}`}></div>
                                            <span style={{ color: p.asnaf ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                                                {p.asnaf ? 'ASNAF' : 'WARGA'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => handleEdit(p)}><Edit2 size={14} /></button>
                                            <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8">
                                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Data tidak ditemukan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{editingId ? 'Edit Data Penduduk' : 'Tambah Penduduk Baru'}</h3>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            <div className="form-group">
                                <label className="label">Nama Lengkap</label>
                                <input
                                    className="input"
                                    value={formData.nama}
                                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                                    required
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Alamat</label>
                                <input
                                    className="input"
                                    value={formData.alamat}
                                    onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                                    required
                                    placeholder="Alamat domisili"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="label">Wilayah RT</label>
                                    <select
                                        className="input"
                                        value={formData.rt}
                                        onChange={e => setFormData({ ...formData, rt: e.target.value })}
                                    >
                                        {rtRw.map(rt => <option key={rt.kode} value={rt.kode}>RT {rt.kode}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="label">Status Warga</label>
                                    <select
                                        className="input"
                                        value={formData.asnaf}
                                        onChange={e => setFormData({ ...formData, asnaf: e.target.value === 'true' })}
                                    >
                                        <option value="false">Warga Biasa</option>
                                        <option value="true">Penerima Asnaf</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border-color)' }} onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1.5, fontWeight: 700 }}>Simpan Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Kependudukan;
