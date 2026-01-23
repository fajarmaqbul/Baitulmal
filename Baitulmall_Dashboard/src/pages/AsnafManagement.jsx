import React, { useState, useEffect, useMemo, useRef } from 'react';
// Deprecated context removed
import { fetchAsnafList, createAsnaf, updateAsnaf as updateAsnafApi, deleteAsnaf as deleteAsnafApi, fetchRTs } from '../services/asnafApi';
import { fetchStrukturInti } from '../services/kepengurusanApi';
import { fetchSettings } from '../services/settingApi';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Loader2, AlertCircle as AlertIcon, X as XIcon } from 'lucide-react';

import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Filter,
    Users,
    ChevronRight,
    Upload,
    Download,
    Printer,
    FileText,
    HandCoins,
    UserCog,
    HeartHandshake,
    Sword,
    Tent,
    Scale,
    Unlock,
    Wallet,
    MapPin,
    Briefcase
} from 'lucide-react';
import { exportToExcel, importFromExcel } from '../utils/dataUtils';
import PrintLayout from '../components/PrintLayout';
import { usePagePrint } from '../hooks/usePagePrint';

const AsnafPrint = ({ data, rt, isSpecialCategoryMode, defaultKetua, rtChairman }) => (
    <PrintLayout
        title={`Daftar Asnaf - ${isSpecialCategoryMode ? rt : `RT ${rt}`}`}
    >
        <table className="table-print-boxed">
            <thead>
                <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                    <th>Nama Kepala Keluarga</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>RT</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Kategori</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Jiwa</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={item.id}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td>{item.nama}</td>
                        <td style={{ textAlign: 'center' }}>{item.rt}</td>
                        <td style={{ textAlign: 'center' }}>{item.kategori}</td>
                        <td style={{ textAlign: 'center' }}>{item.jumlahJiwa}</td>
                        <td></td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="signature-grid">
            <div className="signature-item">
                <div className="signature-title">Ketua Baitulmall</div>
                <div className="signature-name">{defaultKetua}</div>
            </div>
            <div className="signature-item">
                <div className="signature-title">Ketua RT {rt}</div>
                <div className="signature-name">{rtChairman}</div>
            </div>
        </div>
    </PrintLayout>
);

const AsnafManagement = () => {
    // Print State
    const printRef = useRef(null);
    const handlePrint = usePagePrint(printRef, 'Daftar Asnaf');

    // API State
    const [asnafData, setAsnafData] = useState([]);
    const [rtRw, setRtRw] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingFallback, setUsingFallback] = useState(false);
    const [settingsList, setSettingsList] = useState([]);

    const getSetting = (key, fallback) => {
        const s = settingsList.find(item => item.key_name === key);
        return s ? s.value : fallback;
    };

    const defaultKetua = getSetting('default_signer_ketua', '................');
    const getRtChairman = (rtNo) => {
        const rtObj = rtRw.find(r => r.kode === rtNo || r.nomor_rt === rtNo);
        return rtObj?.ketua || '................';
    };

    // Modal Delete State
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, loading: false });

    // Missing local state placeholders (previously from context)
    // Missing local state placeholders (previously from context)
    const [strukturInti, setStrukturInti] = useState([]);
    const [cardTheme, setCardTheme] = useState('clean');
    const [themeStyles, setThemeStyles] = useState({
        clean: {
            wrapper: { padding: '1.25rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' },
            iconBox: { padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'inline-flex', color: 'var(--text-main)' },
            pill: { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px' },
            number: { fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' },
            label: { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }
        },
        simple: { wrapper: {}, label: {}, number: {}, pill: {} }
    });

    // Form & Filter States
    const [selectedRt, setSelectedRt] = React.useState('01');
    const [selectedKategori, setSelectedKategori] = useState('Semua');
    // const [selectedTahun, setSelectedTahun] = useState('2026'); // DEPRECATED: show all years
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ rt: '01', kategori: 'Fakir', nama: '', jumlahJiwa: '', tahun: new Date().getFullYear().toString() });

    // Initial Data Fetching
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError(null);
                setUsingFallback(false);

                // Fetch RTs and Asnaf in parallel - removed year filter to show all
                const [rtsResponse, asnafResponse, strukturResponse, settingsRes] = await Promise.all([
                    fetchRTs(),
                    fetchAsnafList({ per_page: 500 }), // Fetch all regardless of year
                    fetchStrukturInti(),
                    fetchSettings()
                ]);

                if (settingsRes.success) {
                    setSettingsList(settingsRes.data);
                }

                setStrukturInti(strukturResponse);

                // Handle RT response (support both array and wrapped object)
                const rts = Array.isArray(rtsResponse) ? rtsResponse : (rtsResponse?.data || []);
                setRtRw(Array.isArray(rts) ? rts : []);

                // Handle Asnaf response
                const asnafList = asnafResponse?.data && Array.isArray(asnafResponse.data)
                    ? asnafResponse.data
                    : (Array.isArray(asnafResponse) ? asnafResponse : []);

                // Transform Asnaf data
                const transformedAsnaf = asnafList.map(a => ({
                    id: a.id,
                    rt: a.rt.kode,
                    kategori: a.kategori,
                    nama: a.nama,
                    jumlahJiwa: Number(a.jumlah_jiwa || 0), // Ensure number
                    tahun: a.tahun
                }));
                setAsnafData(transformedAsnaf);
                console.log('✅ Asnaf data loaded via API (All Years)');
            } catch (err) {
                console.error('⚠️ API Fetch Failed, using fallback:', err);
                setRtRw([]);
                setAsnafData([]);
                setUsingFallback(true);
                setError('Menggunakan data lokal (API tidak terjangkau)');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []); // Removed undefined dependencies fallbackRtRw, fallbackAsnafData

    // Special categories that show all RTs
    const specialCategories = ['Amil', 'Fisabilillah'];
    const isSpecialCategoryMode = specialCategories.includes(selectedRt);

    const kategoris = ['Fakir', 'Miskin', 'Amil', 'Mualaf', 'Riqab', 'Gharim', 'Fisabilillah', 'Ibnu Sabil'];
    const tahunList = ['2024', '2025', '2026'];

    // Modified filteredData to handle special category mode - removed year filter
    const filteredData = isSpecialCategoryMode
        ? asnafData.filter(a =>
            a.kategori === selectedRt &&
            (searchTerm === '' || a.nama.toLowerCase().includes(searchTerm.toLowerCase()))
        ).sort((a, b) => a.rt.localeCompare(b.rt))
        : asnafData.filter(a =>
            a.rt === selectedRt &&
            (selectedKategori === 'Semua' || a.kategori === selectedKategori) &&
            (searchTerm === '' || a.nama.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    // Stats for selected RT - removed year filter
    const stats = kategoris.map(kat => {
        const data = asnafData.filter(a => a.rt === selectedRt && a.kategori === kat);
        const totalJiwa = data.reduce((acc, curr) => acc + curr.jumlahJiwa, 0);
        return { kategori: kat, count: data.length, totalJiwa };
    });


    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            rt_id: rtRw.find(r => r.kode === formData.rt)?.id || 1,
            nama: formData.nama,
            kategori: formData.kategori,
            jumlah_jiwa: Number(formData.jumlahJiwa),
            tahun: Number(formData.tahun),
            status: 'active'
        };

        try {
            if (editId) {
                if (!usingFallback) {
                    await updateAsnafApi(editId, payload);
                    // Update local state
                    setAsnafData(prev => prev.map(a => a.id === editId ? { ...a, ...formData, jumlahJiwa: Number(formData.jumlahJiwa) } : a));
                }
            } else {
                if (!usingFallback) {
                    const response = await createAsnaf(payload);
                    // Add to local state - access id from response.data.id
                    const newAsnaf = {
                        id: response.data.id,
                        rt: formData.rt,
                        kategori: formData.kategori,
                        nama: formData.nama,
                        jumlahJiwa: Number(formData.jumlahJiwa),
                        tahun: formData.tahun
                    };
                    setAsnafData(prev => [...prev, newAsnaf]);
                }
            }
            closeModal();
            console.log('✅ Data saved successfully');
        } catch (err) {
            console.error('Failed to save data:', err);
            const validationErrors = err.response?.data?.errors;
            let errorMessage = 'Gagal menyimpan data ke API.';

            if (validationErrors) {
                errorMessage += '\n- ' + Object.values(validationErrors).flat().join('\n- ');
            } else if (err.response?.data?.message) {
                errorMessage += '\n' + err.response.data.message;
            } else {
                errorMessage += '\nPastikan Laravel backend berjalan.';
            }

            alert(errorMessage);
        }
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        setFormData({ rt: item.rt, kategori: item.kategori, nama: item.nama, jumlahJiwa: item.jumlahJiwa, tahun: item.tahun || '2026' });
        setShowModal(true);
    };

    const handleDeleteClick = (e, id) => {
        if (e) e.stopPropagation();
        setDeleteModal({ open: true, id, loading: false });
    };

    const confirmDelete = async () => {
        const id = deleteModal.id;
        if (!id) return;

        setDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            if (!usingFallback) {
                await deleteAsnafApi(id);
            }
            // Always update local state to reflect deletion immediately
            setAsnafData(prev => prev.filter(a => a.id !== id));
            console.log('✅ Data deleted');
            setDeleteModal({ open: false, id: null, loading: false });
        } catch (err) {
            console.error('Failed to delete:', err);
            alert('Gagal menghapus data dari API.');
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setFormData({ rt: selectedRt, kategori: 'Fakir', nama: '', jumlahJiwa: '', tahun: new Date().getFullYear().toString() });
    };

    const handleExport = () => {
        const dataToExport = filteredData.map(a => ({
            'RT': a.rt,
            'Kategori': a.kategori,
            'Nama Kepala Keluarga': a.nama,
            'Jumlah Jiwa': a.jumlahJiwa
        }));
        exportToExcel(dataToExport, `Data_Asnaf_RT${selectedRt} `);
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const data = await importFromExcel(file);
                for (const item of data) {
                    // Normalize keys from Excel (case insensitive)
                    const normalized = {};
                    Object.keys(item).forEach(k => normalized[k.toLowerCase()] = item[k]);

                    const payload = {
                        rt_id: rtRw.find(r => r.kode === (normalized.rt || selectedRt))?.id || 1,
                        nama: normalized.nama || normalized['nama kepala keluarga'] || 'Tanpa Nama',
                        kategori: normalized.kategori || 'Miskin',
                        jumlah_jiwa: Number(normalized.jumlahjiwa) || Number(normalized['jumlah jiwa']) || 1,
                        tahun: new Date().getFullYear(),
                        status: 'active'
                    };

                    if (!usingFallback) {
                        await createAsnaf(payload);
                    }
                }
                alert('Data berhasil diimpor!');
                // Reload data or update state manually here if needed
                window.location.reload();
                e.target.value = ''; // Reset input
            } catch (error) {
                alert('Gagal mengimpor data: ' + error.message);
            }
        }
    };

    return (
        <div className="asnaf-management-outer">


            <div className="dashboard-content">
                <header className="header glass-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Users className="text-primary" size={28} />
                            Manajemen Asnaf & Amil
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Data penerima manfaat (8 Asnaf) dan petugas amil per wilayah.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-ghost" disabled={loading} onClick={handlePrint}>
                            <Printer size={18} /> Print
                        </button>
                        <button className="btn btn-ghost" disabled={loading} onClick={handlePrint}>
                            <FileText size={18} /> Export PDF
                        </button>
                        <button className="btn btn-ghost" onClick={handleExport}>
                            <Download size={18} /> Export Excel
                        </button>
                    </div>
                </header>

                {usingFallback && (
                    <div className="glass-card" style={{ padding: '0.75rem 1.5rem', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <AlertIcon size={20} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 600 }}>Mode Fallback: Data diambil dari penyimpanan lokal (API Offline)</span>
                    </div>
                )}

                {/* Top Stats Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* Big Summary Card */}
                    <div className="card" style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)', color: 'white', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ zIndex: 1 }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{asnafData.reduce((acc, curr) => acc + curr.jumlahJiwa, 0)}</h2>
                            <p style={{ margin: 0, opacity: 0.9, fontWeight: 500 }}>Total Jiwa Penerima Manfaat</p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>
                                <Users size={16} /> {asnafData.length} Kepala Keluarga
                            </div>
                        </div>
                        <Users size={120} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.15 }} />
                    </div>

                    {/* Quick Category Stats */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '4px solid var(--danger)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Fakir & Miskin</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                            {asnafData.filter(a => ['Fakir', 'Miskin'].includes(a.kategori)).reduce((acc, curr) => acc + curr.jumlahJiwa, 0)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jiwa Prioritas</div>
                    </div>

                    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '4px solid var(--info)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Amil Active</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                            {asnafData.filter(a => a.kategori === 'Amil').length}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Petugas Terdaftar</div>
                    </div>
                </div>

                <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* Sticky Sidebar */}
                    <div className="sidebar" style={{ position: 'sticky', top: '1.5rem' }}>
                        <div className="card" style={{ padding: '1.25rem' }}>
                            <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' }}>
                                <Filter size={18} className="text-primary" /> Filter Lokasi
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {rtRw.map(rt => (
                                    <button
                                        key={rt.kode}
                                        onClick={() => setSelectedRt(rt.kode)}
                                        className={`btn ${selectedRt === rt.kode ? 'btn-primary' : 'btn-ghost'}`}
                                        style={{
                                            textAlign: 'left',
                                            justifyContent: 'space-between',
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: selectedRt === rt.kode ? 'var(--primary)' : 'transparent',
                                            fontWeight: selectedRt === rt.kode ? 600 : 400
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedRt === rt.kode ? '#fff' : '#cbd5e0' }}></div>
                                            RT {rt.kode}
                                        </div>
                                        {selectedRt === rt.kode && <ChevronRight size={16} />}
                                    </button>
                                ))}
                                <div style={{ borderTop: '1px solid #f0f0f0', margin: '0.5rem 0' }}></div>
                                {specialCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedRt(cat)}
                                        className={`btn ${selectedRt === cat ? 'btn-primary' : 'btn-ghost'}`}
                                        style={{
                                            textAlign: 'left',
                                            justifyContent: 'space-between',
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: selectedRt === cat ? 'var(--info)' : 'transparent',
                                            borderColor: selectedRt === cat ? 'var(--info)' : 'transparent',
                                            color: selectedRt === cat ? '#fff' : 'var(--text-main)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedRt === cat ? '#fff' : '#cbd5e0' }}></div>
                                            {cat}
                                        </div>
                                        {selectedRt === cat && <ChevronRight size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="content-area">
                        {/* Search & Filter Bar - Single Row Horizontal */}
                        <div className="card" style={{
                            padding: '0.75rem 1.25rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '1rem',
                            background: '#fff',
                            border: '1px solid #edf2f7',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            borderRadius: '12px',
                            flexWrap: 'nowrap'
                        }}>
                            {/* Search Input Container */}
                            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Cari nama kepala keluarga..."
                                    style={{
                                        paddingLeft: '36px',
                                        height: '40px',
                                        fontSize: '0.875rem',
                                        borderRadius: '8px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        width: '100%'
                                    }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Category Filter Container */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0 8px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                <Filter size={14} style={{ color: '#718096' }} />
                                <select
                                    className="form-control"
                                    style={{
                                        width: '135px',
                                        border: 'none',
                                        background: 'transparent',
                                        height: '100%',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        color: '#4a5568',
                                        padding: 0,
                                        cursor: 'pointer'
                                    }}
                                    value={selectedKategori}
                                    onChange={(e) => setSelectedKategori(e.target.value)}
                                >
                                    <option value="Semua">Semua Kategori</option>
                                    {kategoris.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>

                            {/* Separator */}
                            <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>

                            {/* Count Display */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#718096', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                <Users size={14} className="text-primary" />
                                <span>Menampilkan <strong>{filteredData.length}</strong> Data</span>
                            </div>

                            {/* Add Button */}
                            <button
                                className="btn btn-primary"
                                style={{
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0 1.25rem',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    background: 'var(--primary)',
                                    marginLeft: '1rem',
                                    border: 'none',
                                    boxShadow: '0 2px 4px rgba(15, 43, 70, 0.15)',
                                    whiteSpace: 'nowrap'
                                }}
                                onClick={() => {
                                    setEditId(null);
                                    setFormData({
                                        rt: selectedRt === 'Semua' ? '1' : selectedRt,
                                        kategori: 'Fakir',
                                        nama: '',
                                        jumlahJiwa: '',
                                        tahun: new Date().getFullYear().toString()
                                    });
                                    setShowModal(true);
                                }}
                            >
                                <Plus size={18} strokeWidth={3} /> Tambah Data
                            </button>
                        </div>

                        <div className="glass-card">
                            <div className="table-container">
                                <table className="table-compact">
                                    <thead>
                                        <tr>
                                            <th className="col-no">NO</th>
                                            <th>Nama Kepala Keluarga</th>
                                            <th>RT</th>
                                            <th>Kategori</th>
                                            <th>Jumlah Jiwa</th>
                                            <th className="no-print">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length > 0 ? filteredData.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="col-no">{index + 1}</td>
                                                <td style={{ fontWeight: 600, color: '#2d3748', fontSize: '1rem' }}>{item.nama}</td>
                                                <td><span style={{ background: '#edf2f7', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', color: '#4a5568' }}>RT {item.rt}</span></td>
                                                <td>
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700,
                                                        background: item.kategori === 'Fakir' ? '#fff5f5' : item.kategori === 'Miskin' ? '#fffaf0' : '#ebf8ff',
                                                        color: item.kategori === 'Fakir' ? '#c53030' : item.kategori === 'Miskin' ? '#c05621' : '#2b6cb0',
                                                        border: `1px solid ${item.kategori === 'Fakir' ? '#feb2b2' : item.kategori === 'Miskin' ? '#fbd38d' : '#bee3f8'}`
                                                    }}>
                                                        <div style={{
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            background: 'currentColor'
                                                        }}></div>
                                                        {item.kategori}
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 800, color: '#2d3748' }}>{item.jumlahJiwa} <span style={{ fontWeight: 400, color: '#718096', fontSize: '0.8rem' }}>Jiwa</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            className="btn btn-ghost"
                                                            style={{ padding: '0.5rem', color: '#4a5568', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                                            onClick={() => handleEdit(item)}
                                                            title="Edit data"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost"
                                                            style={{ padding: '0.5rem', color: '#e53e3e', background: '#fff5f5', border: '1px solid #fed7d7' }}
                                                            onClick={(e) => handleDeleteClick(e, item.id)}
                                                            title="Hapus data"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0' }}>
                                                            <Search size={40} />
                                                        </div>
                                                        <div>
                                                            <h5 style={{ margin: '0 0 0.25rem', color: '#4a5568', fontWeight: 700 }}>Data Tidak Ditemukan</h5>
                                                            <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.9rem' }}>Tidak ada data asnaf yang sesuai dengan kriteria pencarian ini.</p>
                                                        </div>
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ marginTop: '1rem', background: '#edf2f7', color: '#2d3748', border: 'none' }}
                                                            onClick={() => { setSearchTerm(''); setSelectedKategori('Semua'); }}
                                                        >
                                                            Reset Filter
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>
                                {editId ? 'Edit Data Asnaf' : 'Tambah Kepala Keluarga'}
                            </h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#f3f4f6'} onMouseLeave={(e) => e.target.style.background = 'none'}>
                                <XIcon size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.75rem' }}>
                                    <Users size={16} /> Nama Kepala Keluarga
                                </label>
                                <input
                                    className="form-control"
                                    value={formData.nama}
                                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Nama Lengkap"
                                    required
                                    style={{
                                        width: '100%',
                                        height: '46px',
                                        fontSize: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        padding: '0 1rem'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.75rem' }}>
                                        <MapPin size={16} /> Wilayah RT
                                    </label>
                                    <select
                                        className="form-control"
                                        value={formData.rt}
                                        onChange={e => setFormData({ ...formData, rt: e.target.value })}
                                        style={{
                                            width: '100%',
                                            height: '46px',
                                            fontSize: '1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            padding: '0 1rem'
                                        }}
                                    >
                                        {rtRw.map(rt => <option key={rt.kode} value={rt.kode}>RT {rt.kode}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.75rem' }}>
                                        <Filter size={16} /> Kategori Asnaf
                                    </label>
                                    <select
                                        className="form-control"
                                        value={formData.kategori}
                                        onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                                        style={{
                                            width: '100%',
                                            height: '46px',
                                            fontSize: '1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            padding: '0 1rem'
                                        }}
                                    >
                                        {kategoris.map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.75rem' }}>
                                    <Briefcase size={16} /> Jumlah Jiwa dalam Keluarga
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.jumlahJiwa}
                                        onChange={e => setFormData({ ...formData, jumlahJiwa: e.target.value })}
                                        placeholder="0"
                                        required
                                        style={{
                                            width: '100%',
                                            height: '46px',
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            padding: '0 1rem',
                                            textAlign: 'center'
                                        }}
                                    />
                                </div>
                                <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <AlertIcon size={14} /> Masukkan total anggota keluarga yang masih aktif.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    type="button"
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        height: '50px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        color: '#4a5568',
                                        fontWeight: 600,
                                        borderRadius: '10px'
                                    }}
                                    onClick={closeModal}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{
                                        flex: 1.5,
                                        height: '50px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        borderRadius: '10px',
                                        background: 'linear-gradient(135deg, var(--primary) 0%, #2c5282 100%)',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(15, 43, 70, 0.2)'
                                    }}
                                >
                                    <Plus size={20} strokeWidth={3} /> Simpan Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDeleteModal
                open={deleteModal.open}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, id: null, loading: false })}
                loading={deleteModal.loading}
            />
            {/* Hidden Print Container */}
            <div style={{ position: 'absolute', top: 0, left: -10000, width: '210mm', zIndex: -1000 }}>
                <div ref={printRef}>
                    <AsnafPrint
                        data={filteredData}
                        rt={selectedRt}
                        isSpecialCategoryMode={isSpecialCategoryMode}
                        defaultKetua={defaultKetua}
                        rtChairman={getRtChairman(selectedRt)}
                    />
                </div>
            </div>
        </div>
    );
};

export default AsnafManagement;
