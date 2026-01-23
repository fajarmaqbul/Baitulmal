import React, { useState, useMemo } from 'react';
import {
    Users,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Phone,
    MapPin,
    Briefcase,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    UserCircle2,
    User,
    Loader2,
    X as XIcon
} from 'lucide-react';
import { fetchAsnafList, updateAsnaf, deleteAsnaf } from '../services/asnafApi';
import { fetchKepengurusan, savePengurusBaru, deleteAssignment } from '../services/sdmApi'; // New Service
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const Kepengurusan = () => {
    // 1. Data State (API Integration)
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);

    // Initial Data Fetch
    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await fetchKepengurusan();
            if (res.success) {
                setMembers(res.data);
            }
        } catch (err) {
            console.error('Failed to load members:', err);
        } finally {
            setLoadingMembers(false);
        }
    };

    // Default Structure ID (Hardcoded for now)
    const DEFAULT_STRUCTURE_ID = 1;

    // 2. States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDivisi, setSelectedDivisi] = useState('Semua');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Amil API State (Existing)
    const [amilData, setAmilData] = useState([]);
    const [loadingAmil, setLoadingAmil] = useState(true);

    // Fetch Amil Data
    React.useEffect(() => {
        const loadAmil = async () => {
            // ... (keep existing amil fetch logic)
            try {
                // Try fetching from API
                const response = await fetchAsnafList({ per_page: 500 });
                const allData = Array.isArray(response) ? response : (response?.data || []);
                const amil = allData.filter(a => a.kategori === 'Amil');

                if (amil.length > 0) {
                    setAmilData(amil);
                } else {
                    // Start fresh with no mock data
                    setAmilData([]);
                }
            } catch (err) {
                console.error('Failed to fetch Amil:', err);
                setAmilData([]);
            } finally {
                setLoadingAmil(false);
            }
        };
        loadAmil();
    }, []);

    // Form State
    const initialForm = {
        nama: '',
        jabatan: '',
        divisi: 'Pengurus Inti',
        alamat: '',
        no_wa: '',
        status: 'Aktif',
        periode_mulai: new Date().getFullYear().toString(),
        periode_selesai: (new Date().getFullYear() + 5).toString(),
        job_desk: ''
    };
    const [formData, setFormData] = useState(initialForm);

    // 3. Helpers
    const divisions = ['Pengurus Inti', 'Divisi Sosial', 'Keuangan', 'Operasional', 'Humas'];

    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            const matchSearch = m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
            const matchDivisi = selectedDivisi === 'Semua' || m.divisi === selectedDivisi;
            return matchSearch && matchDivisi;
        });
    }, [members, searchTerm, selectedDivisi]);

    const handleEdit = (member) => {
        setIsEditing(true);
        setCurrentId(member.id);
        setFormData(member);
        setShowModal(true);
    };



    // ... (in component)
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, type: 'member' }); // type: 'member' or 'amil'
    const [editAmilModal, setEditAmilModal] = useState({ open: false, data: null });

    const handleDelete = (id) => {
        setDeleteModal({ open: true, id, type: 'member' });
    };

    const handleDeleteAmil = (id) => {
        setDeleteModal({ open: true, id, type: 'amil' });
    };

    const handleEditAmil = (amil) => {
        setEditAmilModal({ open: true, data: amil });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;

        if (deleteModal.type === 'member') {
            try {
                await deleteAssignment(deleteModal.id);
                setMembers(prev => prev.filter(m => m.id !== deleteModal.id));
                console.log('✅ Member assignment deleted');
            } catch (err) {
                console.error('Failed to delete member assignment:', err);
                alert('Gagal menghapus anggota.');
            } finally {
                setDeleteModal({ open: false, id: null, type: 'member' });
            }
        } else if (deleteModal.type === 'amil') {
            try {
                // Determine if ID is mock or real
                // If ID is small integer (101, 102...), it's likely mock in this context, but let's assume API first
                // Actually, our mock IDs were 101, 102. Real IDs from DB are usually just integers. 
                // We'll try API delete.
                await deleteAsnaf(deleteModal.id);
                // Update local state
                setAmilData(prev => prev.filter(a => a.id !== deleteModal.id));
                console.log('✅ Amil deleted');
            } catch (err) {
                console.error('Failed to delete Amil (might be mock data):', err);
                // If fail (e.g. mock data), just remove from UI
                setAmilData(prev => prev.filter(a => a.id !== deleteModal.id));
            } finally {
                setDeleteModal({ open: false, id: null, type: 'member' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditing) {
                // Not implemented fully for this demo (requires updating Person & Assignment separately)
                // For now, we only support ADD via the new SDM flow properly
                // Or we can mock update locally for now since the main goal is "Data Sourcing"
                alert('Fitur Update Lengkap belum tersedia di demo ini. Silakan Hapus & Buat Baru.');
            } else {
                await savePengurusBaru(formData, DEFAULT_STRUCTURE_ID);
                await loadData(); // Reload from API
            }
            closeModal();
        } catch (err) {
            console.error('Failed to save:', err);
            alert('Gagal menyimpan data.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setFormData(initialForm);
    };

    // 4. Render Components
    return (
        <div className="kepengurusan-container">
            {/* Header Stats */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    Pengurus Baitulmall Fajar Maqbul
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Manajemen struktur organisasi, pengurus inti, dan petugas amil lapangan.
                </p>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Pengurus Inti</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{members.length}</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'rgba(15, 43, 70, 0.1)', borderRadius: '50%', color: 'var(--primary)' }}>
                        <Users size={24} />
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status Aktif</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                            {members.filter(m => m.status === 'Aktif').length}
                        </div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'rgba(25, 135, 84, 0.1)', borderRadius: '50%', color: 'var(--success)' }}>
                        <CheckCircle2 size={24} />
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Divisi</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info)' }}>
                            {new Set(members.map(m => m.divisi)).size}
                        </div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'rgba(13, 202, 240, 0.1)', borderRadius: '50%', color: 'var(--info)' }}>
                        <Briefcase size={24} />
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onClick={() => {
                            setFormData(initialForm);
                            setIsEditing(false);
                            setCurrentId(null);
                            setShowModal(true);
                        }}
                    >
                        <Plus size={32} />
                        <span>Tambah Pengurus</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            className="form-control"
                            style={{ paddingLeft: '40px', width: '100%' }}
                            placeholder="Cari nama atau jabatan..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} className="text-muted" />
                        <select
                            className="form-control"
                            style={{ width: '180px' }}
                            value={selectedDivisi}
                            onChange={e => setSelectedDivisi(e.target.value)}
                        >
                            <option value="Semua">Semua Divisi</option>
                            {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Members Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredMembers.map(member => (
                    <div key={member.id} className="card" style={{ position: 'relative', overflow: 'hidden', padding: '0' }}>
                        {/* Card Header / Banner */}
                        <div style={{ height: '80px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)' }}></div>

                        <div style={{ padding: '1.5rem', marginTop: '-40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff', padding: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                        <User size={40} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={() => handleEdit(member)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--danger)' }} onClick={() => handleDelete(member.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{member.nama}</h3>
                                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{member.jabatan}</p>
                                <span style={{ fontSize: '0.75rem', background: '#e5e7eb', padding: '2px 8px', borderRadius: '12px', color: '#4b5563' }}>{member.divisi}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#4b5563', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Phone size={16} className="text-muted" />
                                    <span>{member.no_wa}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <MapPin size={16} className="text-muted" style={{ marginTop: '2px' }} />
                                    <span style={{ lineHeight: '1.4' }}>{member.alamat}</span>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    {member.status === 'Aktif' ? (
                                        <CheckCircle2 size={14} className="text-success" />
                                    ) : (
                                        <XCircle size={14} className="text-danger" />
                                    )}
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: member.status === 'Aktif' ? 'var(--success)' : 'var(--danger)' }}>
                                        {member.status}
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Periode: {member.periode_mulai}-{member.periode_selesai}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Amil Table Section */}
            <div className="glass-card" style={{ marginTop: '2rem' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Users className="text-info" size={24} />
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Data Amil & Petugas Lapangan</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Data diambil dari database Asnaf (Kategori: Amil)</p>
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table className="table-compact">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>No</th>
                                <th>Nama Lengkap</th>
                                <th>Wilayah Tugas</th>
                                <th>Kontak / WhatsApp</th>
                                <th>Status</th>
                                <th>Keterangan</th>
                                <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingAmil ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                            <Loader2 className="spin" size={20} /> Memuat data amil...
                                        </div>
                                    </td>
                                </tr>
                            ) : amilData.length > 0 ? (
                                amilData.map((amil, index) => (
                                    <tr key={amil.id}>
                                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{amil.nama}</td>
                                        <td>
                                            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                RT {amil.rt?.kode || amil.rt}
                                            </span>
                                        </td>
                                        <td>
                                            {amil.no_wa ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                    <i className="fab fa-whatsapp" style={{ color: '#25D366' }}></i>
                                                    {amil.no_wa}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></div>
                                                <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>Aktif</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {amil.keterangan || '-'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ padding: '0.4rem', borderRadius: '4px' }}
                                                    onClick={() => handleEditAmil(amil)}
                                                    title="Edit Amil"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ padding: '0.4rem', borderRadius: '4px', color: 'var(--danger)' }}
                                                    onClick={() => handleDeleteAmil(amil.id)}
                                                    title="Hapus Amil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        Belum ada data Amil terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050,
                    padding: '1rem'
                }}>
                    <div className="card shadow-lg" style={{
                        width: '100%',
                        maxWidth: '650px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        background: '#fff',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        padding: '2rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '2rem'
                        }}>
                            <div>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <div style={{
                                        padding: '0.5rem',
                                        background: 'rgba(15, 43, 70, 0.05)',
                                        borderRadius: '8px',
                                        color: 'var(--primary)',
                                        display: 'flex'
                                    }}>
                                        <User size={24} />
                                    </div>
                                    {isEditing ? 'Ubah Data Pengurus' : 'Tambah Pengurus Baru'}
                                </h3>
                                <p style={{ margin: '0.5rem 0 0 3.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {isEditing ? 'Perbarui informasi kepengurusan' : 'Daftarkan pengurus baru ke sistem'}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#adb5bd',
                                    padding: '0.5rem',
                                    display: 'flex'
                                }}
                            >
                                <XIcon size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Nama Lengkap</label>
                                    <input
                                        className="form-control"
                                        value={formData.nama}
                                        onChange={e => setFormData({ ...formData, nama: e.target.value })}
                                        required
                                        placeholder="Nama Lengkap"
                                        style={{ height: '2.75rem' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Nomor WhatsApp</label>
                                    <input
                                        className="form-control"
                                        value={formData.no_wa}
                                        onChange={e => setFormData({ ...formData, no_wa: e.target.value })}
                                        required
                                        placeholder="08..."
                                        style={{ height: '2.75rem' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Alamat Domisili</label>
                                <input
                                    className="form-control"
                                    value={formData.alamat}
                                    onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                                    required
                                    placeholder="Alamat Lengkap"
                                    style={{ height: '2.75rem' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Jabatan</label>
                                    <input
                                        className="form-control"
                                        value={formData.jabatan}
                                        onChange={e => setFormData({ ...formData, jabatan: e.target.value })}
                                        required
                                        placeholder="Contoh: Sekretaris"
                                        style={{ height: '2.75rem' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Divisi</label>
                                    <select
                                        className="form-control"
                                        value={formData.divisi}
                                        onChange={e => setFormData({ ...formData, divisi: e.target.value })}
                                        style={{ height: '2.75rem' }}
                                    >
                                        {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{
                                padding: '1.25rem',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                border: '1px solid #e9ecef',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '1.25rem'
                            }}>
                                <div className="form-group">
                                    <label className="label" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Status</label>
                                    <select
                                        className="form-control"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        style={{ height: 'auto', background: 'transparent', border: 'none', padding: 0 }}
                                    >
                                        <option value="Aktif">Aktif</option>
                                        <option value="Cuti">Cuti</option>
                                        <option value="Non-Aktif">Non-Aktif</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Periode Mulai</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.periode_mulai}
                                        onChange={e => setFormData({ ...formData, periode_mulai: e.target.value })}
                                        style={{ height: 'auto', background: 'transparent', border: 'none', padding: 0 }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Periode Selesai</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.periode_selesai}
                                        onChange={e => setFormData({ ...formData, periode_selesai: e.target.value })}
                                        style={{ height: 'auto', background: 'transparent', border: 'none', padding: 0 }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Tugas & Tanggung Jawab</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={formData.job_desk}
                                    onChange={e => setFormData({ ...formData, job_desk: e.target.value })}
                                    placeholder="Deskripsi singkat tugas..."
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ flex: 1, height: '2.75rem' }}
                                    onClick={closeModal}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1, height: '2.75rem' }}
                                >
                                    {isEditing ? 'Simpan Perubahan' : 'Tambah Pengurus'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Amil Edit Modal */}
            {editAmilModal.open && editAmilModal.data && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1060,
                    padding: '1rem'
                }}>
                    <div className="card shadow-lg" style={{
                        width: '100%',
                        maxWidth: '500px',
                        padding: '2rem',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        background: '#fff'
                    }}>
                        <div style={{
                            paddingBottom: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>Edit Data Amil</h3>
                                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Perbarui informasi petugas amil lapangan</p>
                            </div>
                            <button
                                onClick={() => setEditAmilModal({ open: false, data: null })}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd', padding: '0.5rem' }}
                            >
                                <XIcon size={20} />
                            </button>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const payload = {
                                    nama: editAmilModal.data.nama,
                                    no_wa: editAmilModal.data.no_wa,
                                    keterangan: editAmilModal.data.keterangan
                                };
                                await updateAsnaf(editAmilModal.data.id, payload);
                                setAmilData(prev => prev.map(a => a.id === editAmilModal.data.id ? { ...a, ...payload } : a));
                                setEditAmilModal({ open: false, data: null });
                                alert('Data Amil berhasil diperbarui.');
                            } catch (err) {
                                console.error('Failed update amil:', err);
                                alert('Gagal update data.');
                            }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Nama Lengkap</label>
                                <input
                                    className="form-control"
                                    value={editAmilModal.data.nama}
                                    onChange={e => setEditAmilModal(prev => ({ ...prev, data: { ...prev.data, nama: e.target.value } }))}
                                    required
                                    style={{ height: '2.75rem' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Nomor WhatsApp</label>
                                <input
                                    className="form-control"
                                    value={editAmilModal.data.no_wa || ''}
                                    onChange={e => setEditAmilModal(prev => ({ ...prev, data: { ...prev.data, no_wa: e.target.value } }))}
                                    placeholder="08..."
                                    style={{ height: '2.75rem' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Keterangan / Posisi</label>
                                <input
                                    className="form-control"
                                    value={editAmilModal.data.keterangan || ''}
                                    onChange={e => setEditAmilModal(prev => ({ ...prev, data: { ...prev.data, keterangan: e.target.value } }))}
                                    placeholder="Ex: Koordinator Lapangan"
                                    style={{ height: '2.75rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1, height: '2.75rem' }} onClick={() => setEditAmilModal({ open: false, data: null })}>Batal</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '2.75rem' }}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDeleteModal
                open={deleteModal.open}
                title={deleteModal.type === 'amil' ? 'Hapus Data Amil' : 'Hapus Pengurus'}
                description="Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, id: null })}
            />
        </div>
    );
};

export default Kepengurusan;
