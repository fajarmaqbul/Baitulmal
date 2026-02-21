import React, { useState, useMemo, useEffect } from 'react';
import {
    Users, Plus, Search, Filter, MoreVertical, Phone, MapPin, Briefcase,
    CheckCircle2, XCircle, Edit2, Trash2, UserCircle2, User, Loader2,
    X as XIcon, ArrowUpDown, ArrowUp, ArrowDown, Printer, Download, RefreshCw, Calendar
} from 'lucide-react';
import { exportToExcel } from '../utils/dataUtils';
import PrintLayout from '../components/PrintLayout';
import { usePagePrint } from '../hooks/usePagePrint';
import { fetchAsnafList, updateAsnaf, deleteAsnaf } from '../services/asnafApi';
import { fetchAssignments, savePengurusBaru, updatePengurus, deleteAssignment, fetchStructures } from '../services/sdmApi';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const KepengurusanGeneric = ({ title, kodeStruktur, defaultDivisi, showAmilTable = false }) => {
    // 1. Data State (API Integration)
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [structureId, setStructureId] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        const init = async () => {
            try {
                // Find structure by code
                const structuresRes = await fetchStructures();
                const target = structuresRes.data.find(s => s.kode_struktur === kodeStruktur);
                if (target) {
                    setStructureId(target.id);
                    await loadData(target.id);
                } else {
                    console.error('Structure not found:', kodeStruktur);
                    setLoadingMembers(false);
                }
            } catch (err) {
                console.error('Failed to initialize:', err);
                setLoadingMembers(false);
            }
        };
        init();
    }, [kodeStruktur]);

    const loadData = async (sid) => {
        setLoadingMembers(true);
        try {
            const res = await fetchAssignments(sid);
            if (res.success) {
                // Map API data to UI format
                const mapped = res.data.map(a => ({
                    id: a.id,
                    person_id: a.person_id,
                    nama: a.person?.nama_lengkap || 'Unknown',
                    jabatan: a.jabatan,
                    divisi: a.structure?.nama_struktur || defaultDivisi,
                    alamat: a.person?.alamat_domisili || '',
                    no_wa: a.person?.no_wa || '',
                    status: a.status || 'Aktif',
                    periode_mulai: a.tanggal_mulai ? a.tanggal_mulai.substring(0, 4) : '',
                    periode_selesai: a.tanggal_selesai ? a.tanggal_selesai.substring(0, 4) : (new Date().getFullYear() + 5).toString(),
                    job_desk: a.keterangan || '',
                    is_double_role: (a.is_double_role) || (a.person?.assignments_count > 1),
                    active_roles_count: a.active_roles_count || a.person?.assignments_count || 1
                }));
                setMembers(mapped);
            }
        } catch (err) {
            console.error('Failed to load members:', err);
        } finally {
            setLoadingMembers(false);
        }
    };

    // 2. States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDivisi, setSelectedDivisi] = useState('Semua');
    const [selectedJabatan, setSelectedJabatan] = useState('Semua');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Amil API State (Existing)
    const [amilData, setAmilData] = useState([]);
    const [loadingAmil, setLoadingAmil] = useState(false);

    // Fetch Amil Data if needed
    useEffect(() => {
        if (!showAmilTable) return;

        const loadAmil = async () => {
            setLoadingAmil(true);
            try {
                const response = await fetchAsnafList({ per_page: 500 });
                const allData = Array.isArray(response) ? response : (response?.data || []);
                const amil = allData.filter(a => a.kategori === 'Amil');
                setAmilData(amil);
            } catch (err) {
                console.error('Failed to fetch Amil:', err);
                setAmilData([]);
            } finally {
                setLoadingAmil(false);
            }
        };
        loadAmil();
    }, [showAmilTable]);

    // Form State
    const initialForm = {
        nama: '',
        jabatan: '',
        divisi: defaultDivisi,
        alamat: '',
        no_wa: '',
        status: 'Aktif',
        periode_mulai: new Date().getFullYear().toString(),
        periode_selesai: (new Date().getFullYear() + 5).toString(),
        job_desk: ''
    };
    const [formData, setFormData] = useState(initialForm);

    // 3. Helpers
    const divisions = useMemo(() => {
        const unique = Array.from(new Set(members.map(m => m.divisi)));
        if (!unique.includes(defaultDivisi)) unique.push(defaultDivisi);
        return unique;
    }, [members, defaultDivisi]);

    const jabatans = useMemo(() => {
        const unique = Array.from(new Set(members.map(m => m.jabatan).filter(Boolean)));
        return ['Semua', ...unique.sort()];
    }, [members]);

    const filteredMembers = useMemo(() => {
        if (!searchTerm.trim()) return members;

        const term = searchTerm.toLowerCase().trim();
        return members.filter(m => {
            const nama = (m.nama || '').toLowerCase();
            const jabatan = (m.jabatan || '').toLowerCase();
            const matchSearch = nama.includes(term) || jabatan.includes(term);
            const matchDivisi = selectedDivisi === 'Semua' || m.divisi === selectedDivisi;
            const matchJabatan = selectedJabatan === 'Semua' || m.jabatan === selectedJabatan;
            return matchSearch && matchDivisi && matchJabatan;
        });
    }, [members, searchTerm, selectedDivisi, selectedJabatan]);

    const sortedMembers = useMemo(() => {
        let sortableItems = [...filteredMembers];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (sortConfig.key === 'jabatan') {
                    const hierarchyOrder = {
                        'Mustahik': 1,
                        'Ketua': 2,
                        'Sekertaris': 3,
                        'Bendahara': 4,
                        'Distribusi': 5
                    };
                    const getWeight = (role) => {
                        // Normalize role string to match keys partially or exactly if needed
                        // For now, strict match or default
                        const key = Object.keys(hierarchyOrder).find(k => role?.includes(k)) || 'Other';
                        return hierarchyOrder[key] || 99;
                    };

                    const weightA = getWeight(a.jabatan);
                    const weightB = getWeight(b.jabatan);

                    if (weightA !== weightB) {
                        return sortConfig.direction === 'asc'
                            ? weightA - weightB
                            : weightB - weightA;
                    }
                    // If weights are equal, fallback to alphabetical
                    return a.jabatan?.localeCompare(b.jabatan);
                }

                const valA = (a[sortConfig.key] || '').toString().toLowerCase();
                const valB = (b[sortConfig.key] || '').toString().toLowerCase();
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredMembers, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleEdit = (member) => {
        setIsEditing(true);
        setCurrentId(member.id);
        setFormData(member);
        setShowModal(true);
    };

    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, type: 'member' });
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
            } catch (err) {
                console.error('Failed to delete member assignment:', err);
                alert('Gagal menghapus anggota.');
            } finally {
                setDeleteModal({ open: false, id: null, type: 'member' });
            }
        } else if (deleteModal.type === 'amil') {
            try {
                await deleteAsnaf(deleteModal.id);
                setAmilData(prev => prev.filter(a => a.id !== deleteModal.id));
            } catch (err) {
                console.error('Failed to delete Amil:', err);
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
                await updatePengurus(currentId, formData);
                await loadData(structureId);
                alert('Data pengurus berhasil diperbarui!');
            } else {
                await savePengurusBaru(formData, structureId);
                await loadData(structureId);
                alert('Pengurus baru berhasil ditambahkan!');
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

    // Print Handling
    const printRef = React.useRef(null);
    const handlePrint = usePagePrint(printRef, `Laporan ${title}`);

    return (
        <div className="kepengurusan-container">
            {/* Header Stats & Actions */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                        {title}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Manajemen struktur organisasi dan pengurus {title.toLowerCase()}.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>

                    {/* Year Selector */}
                    <div className="input d-flex align-items-center justify-content-between" style={{ height: '42px', fontWeight: 700, background: 'rgba(0,0,0,0.03)', padding: '0 12px', cursor: 'default', minWidth: '100px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <span>{new Date().getFullYear()}</span>
                        <Calendar size={16} style={{ opacity: 0.5 }} />
                    </div>

                    {/* Refresh Button */}
                    <button
                        className="btn btn-ghost"
                        onClick={() => loadData(structureId)}
                        disabled={loadingMembers}
                        title="Refresh Data"
                        style={{ border: '1px solid var(--border-color)', height: '42px', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px', fontWeight: 600 }}
                    >
                        <RefreshCw size={18} className={loadingMembers ? 'spin' : ''} style={{ color: 'var(--success)' }} />
                        <span>Refresh</span>
                    </button>

                    {/* Print Button */}
                    <button
                        className="btn btn-ghost"
                        onClick={handlePrint}
                        title="Cetak Laporan"
                        style={{ border: '1px solid var(--border-color)', height: '42px', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px', fontWeight: 600 }}
                    >
                        <Printer size={18} className="text-primary" />
                        <span>Cetak</span>
                    </button>

                    {/* Download Button */}
                    <button
                        className="btn btn-primary"
                        onClick={() => exportToExcel(members, `Data_${title.replace(/\s+/g, '_')}`)}
                        style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', padding: '0 1.25rem', gap: '0.5rem', borderRadius: '10px' }}
                    >
                        <Download size={18} />
                        <span>EXPORT</span>
                    </button>
                </div>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Pengurus</div>
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
                    <select
                        className="form-control"
                        style={{ width: '200px', cursor: 'pointer' }}
                        value={selectedJabatan}
                        onChange={e => setSelectedJabatan(e.target.value)}
                    >
                        <option value="Semua">Semua Jabatan</option>
                        {jabatans.filter(j => j !== 'Semua').map(j => (
                            <option key={j} value={j}>{j}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Members Table */}
            {loadingMembers ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader2 className="spin" size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <p>Memuat data pengurus...</p>
                </div>
            ) : (
                <div className="table-container shadow-sm border-0">
                    <table className="table-compact">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>NO</th>
                                <th>NAMA LENGKAP</th>
                                <th
                                    onClick={() => requestSort('jabatan')}
                                    style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    JABATAN
                                    {sortConfig.key === 'jabatan' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                    ) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}
                                </th>
                                <th>DIVISI / WILAYAH</th>
                                <th>KONTAK (WA)</th>
                                <th>ALAMAT</th>
                                <th>STATUS & PERIODE</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMembers.map((member, index) => (
                                <tr key={member.id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--avatar-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid var(--avatar-border)' }}>
                                                <User size={16} />
                                            </div>
                                            <div style={{ fontWeight: 600 }}>{member.nama}</div>
                                            {member.is_double_role && (
                                                <span className="badge" style={{
                                                    background: 'rgba(234, 179, 8, 0.1)',
                                                    color: '#ca8a04',
                                                    fontSize: '0.65rem',
                                                    padding: '2px 6px',
                                                    border: '1px solid rgba(234, 179, 8, 0.3)',
                                                    marginLeft: '4px'
                                                }}>
                                                    Double Jabatan
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{member.jabatan}</td>
                                    <td>
                                        <span className="badge badge-primary" style={{ background: 'rgba(15, 43, 70, 0.1)', color: 'var(--primary)', fontWeight: 600 }}>
                                            {member.divisi}
                                        </span>
                                    </td>
                                    <td>
                                        {member.no_wa ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Phone size={14} className="text-muted" />
                                                <span>{member.no_wa}</span>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }} title={member.alamat}>
                                            {member.alamat || '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: member.status === 'Aktif' ? 'var(--success)' : 'var(--danger)' }}>
                                                {member.status === 'Aktif' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {member.status}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                {member.periode_mulai} - {member.periode_selesai}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                            <button className="btn btn-ghost" style={{ padding: '0.4rem', borderRadius: '4px' }} onClick={() => handleEdit(member)} title="Ubah">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn btn-ghost" style={{ padding: '0.4rem', borderRadius: '4px', color: 'var(--danger)' }} onClick={() => handleDelete(member.id)} title="Hapus">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sortedMembers.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Belum ada data pengurus di kategori ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Amil Table Section (Optional) */}
            {showAmilTable && (
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
                                                    <button className="btn btn-ghost" style={{ padding: '0.4rem', borderRadius: '4px' }} onClick={() => handleEditAmil(amil)}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="btn btn-ghost" style={{ padding: '0.4rem', borderRadius: '4px', color: 'var(--danger)' }} onClick={() => handleDeleteAmil(amil.id)}>
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
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    zIndex: 1050, padding: '1rem'
                }}>
                    <div className="card shadow-lg" style={{
                        width: '100%', maxWidth: '650px', maxHeight: '90vh',
                        overflowY: 'auto', background: 'var(--card-bg)', borderRadius: '8px',
                        padding: '2rem', color: 'var(--text-main)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <User size={24} />
                                    {isEditing ? 'Ubah Data Pengurus' : 'Tambah Pengurus Baru'}
                                </h3>
                            </div>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <XIcon size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="label">Nama Lengkap</label>
                                    <input className="form-control" value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="label">Nomor WhatsApp</label>
                                    <input className="form-control" value={formData.no_wa} onChange={e => setFormData({ ...formData, no_wa: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Alamat Domisili</label>
                                <input className="form-control" value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="label">Jabatan</label>
                                    <input className="form-control" value={formData.jabatan} onChange={e => setFormData({ ...formData, jabatan: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="label">Divisi</label>
                                    <input className="form-control" value={formData.divisi} onChange={e => setFormData({ ...formData, divisi: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline-danger" style={{ flex: 1 }} onClick={closeModal}>
                                    BATAL
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }}>
                                    {isEditing ? 'SIMPAN PERUBAHAN' : 'TAMBAH PENGURUS'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDeleteModal
                open={deleteModal.open}
                title={deleteModal.type === 'amil' ? 'Hapus Data Amil' : 'Hapus Pengurus'}
                description="Apakah Anda yakin ingin menghapus data ini?"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, id: null })}
            />

            {/* Hidden Print Layout */}
            <div className="print-only">
                <div ref={printRef}>
                    <PrintLayout title={`Laporan ${title}`}>
                        <table className="table-print-boxed">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>No</th>
                                    <th>Nama Lengkap</th>
                                    <th>Jabatan</th>
                                    <th>Divisi/Wilayah</th>
                                    <th>Kontak</th>
                                    <th>Alamat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMembers.map((m, i) => (
                                    <tr key={m.id}>
                                        <td style={{ textAlign: 'center' }}>{i + 1}</td>
                                        <td>{m.nama}</td>
                                        <td>{m.jabatan}</td>
                                        <td>{m.divisi}</td>
                                        <td>{m.no_wa || '-'}</td>
                                        <td>{m.alamat || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </PrintLayout>
                </div>
            </div>
        </div>
    );
};

export default KepengurusanGeneric;
