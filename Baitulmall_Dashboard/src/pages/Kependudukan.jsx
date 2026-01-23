import React, { useState } from 'react';
// Deprecated context removed
console.warn('Deprecated context detected in Kependudukan.jsx');
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
    const [penduduk, setPenduduk] = React.useState([]);
    const [rtRw, setRtRw] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Placeholder data load (TODO: replace with actual service calls)
    React.useEffect(() => {
        try {
            // Example: fetchPenduduk(), fetchRTs()
            // For now keep empty arrays
        } catch (err) {
            console.error('Failed to load Kependudukan data:', err);
            setError(err?.message || 'Gagal memuat data Kependudukan');
        } finally {
            setLoading(false);
        }
    }, []);

    // Local state update functions (previously from context)
    const addPenduduk = (data) => setPenduduk(prev => [...prev, { id: Date.now(), ...data }]);
    const updatePenduduk = (id, data) => setPenduduk(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    const deletePenduduk = (id) => setPenduduk(prev => prev.filter(p => p.id !== id));

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
            updatePenduduk(editingId, formData);
        } else {
            addPenduduk(formData);
        }
        setShowModal(false);
        setEditingId(null);
        setFormData({ nama: '', alamat: '', rt: '01', rw: '01', asnaf: false });
    };

    const handleEdit = (penduduk) => {
        setFormData(penduduk);
        setEditingId(penduduk.id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        deletePenduduk(Number(id));
    };

    // Statistics per RT
    const statsPerRt = rtRw.map(rt => {
        const residents = penduduk.filter(p => p.rt === rt.kode);
        const asnafCount = residents.filter(p => p.asnaf).length;
        return { ...rt, total: residents.length, asnaf: asnafCount };
    });

    return (
        <div>
            <header className="header">
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Data Kependudukan</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manajemen data RT, RW, dan Penduduk (Asnaf/Non-Asnaf).</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Tambah Penduduk
                </button>
            </header>

            <div className="stats-grid">
                {statsPerRt.map(stat => (
                    <div key={stat.id} className="glass-card stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <Home className="text-muted" size={18} />
                            <span style={{ fontWeight: 600 }}>RT {stat.kode} / RW {stat.rw}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div>
                                <p className="stat-label">Total Warga</p>
                                <h4 style={{ fontSize: '1.25rem' }}>{stat.total}</h4>
                            </div>
                            <div>
                                <p className="stat-label" style={{ color: 'var(--secondary)' }}>Asnaf</p>
                                <h4 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>{stat.asnaf}</h4>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Cari nama penduduk..."
                            style={{ paddingLeft: '40px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-ghost">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nama Lengkap</th>
                                <th>Alamat</th>
                                <th>RT/RW</th>
                                <th>Status Asnaf</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPenduduk.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 500 }}>{p.nama}</td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{p.alamat}</td>
                                    <td>{p.rt}/{p.rw}</td>
                                    <td>
                                        {p.asnaf ? (
                                            <span style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--secondary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Asnaf</span>
                                        ) : (
                                            <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem' }}>Biasa</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button type="button" className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => handleEdit(p)}><Edit2 size={14} style={{ pointerEvents: 'none' }} /></button>
                                            <button type="button" className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--danger)' }} onClick={() => handleDelete(p.id)}><Trash2 size={14} style={{ pointerEvents: 'none' }} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Data Penduduk' : 'Tambah Penduduk Baru'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="label">Nama Lengkap</label>
                                <input
                                    className="input"
                                    value={formData.nama}
                                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Alamat</label>
                                <input
                                    className="input"
                                    value={formData.alamat}
                                    onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="label">RT</label>
                                    <select
                                        className="input"
                                        value={formData.rt}
                                        onChange={e => setFormData({ ...formData, rt: e.target.value })}
                                    >
                                        {rtRw.map(rt => <option key={rt.kode} value={rt.kode}>{rt.kode}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Status Asnaf</label>
                                    <select
                                        className="input"
                                        value={formData.asnaf}
                                        onChange={e => setFormData({ ...formData, asnaf: e.target.value === 'true' })}
                                    >
                                        <option value="false">Tidak (Warga Biasa)</option>
                                        <option value="true">Ya (Penerima Bantuan)</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Kependudukan;
