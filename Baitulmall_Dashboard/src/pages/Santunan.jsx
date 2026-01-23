import React, { useState, useEffect, useRef } from 'react';
import {
    ShieldCheck,
    Plus,
    Heart,
    UserPlus,
    ArrowRightCircle,
    TrendingUp,
    Edit2,
    Trash2,
    Search,
    Printer,
    Loader2
} from 'lucide-react';
import { formatDate } from '../utils/dataUtils';
import { fetchRTs } from '../services/asnafApi';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import {
    fetchSedekahList,
    createSedekah,
    fetchSantunanList,
    createSantunan,
    updateSantunanApi,
    deleteSantunanApi
} from '../services/santunanApi';
import PrintLayout from '../components/PrintLayout';
import { usePagePrint } from '../hooks/usePagePrint';
import { fetchSettings } from '../services/settingApi';

const SantunanPrint = ({ data, defaultKetua, defaultKoordinator }) => (
    <PrintLayout title="Daftar Penerima Santunan Anak Yatim">
        <table className="table-print-boxed">
            <thead>
                <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                    <th>Nama Anak</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>RT</th>
                    <th style={{ width: '150px' }}>Besaran (Rp)</th>
                    <th style={{ width: '120px' }}>Status</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={item.id}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td>{item.nama}</td>
                        <td style={{ textAlign: 'center' }}>{item.rt}</td>
                        <td style={{ fontWeight: 600 }}>Rp {item.besaran.toLocaleString()}</td>
                        <td>{item.statusPenerimaan}</td>
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
                <div className="signature-title">Koordinator Santunan</div>
                <div className="signature-name">{defaultKoordinator}</div>
            </div>
        </div>
    </PrintLayout>
);

const Santunan = () => {
    // Print State
    const printRef = useRef(null);
    const handlePrint = usePagePrint(printRef, 'Laporan Santunan Yatim');
    // API State
    const [donasiSantunan, setDonasiSantunan] = useState([]);
    const [anakYatim, setAnakYatim] = useState([]);
    const [rtRw, setRtRw] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, type: null, loading: false });
    const [error, setError] = useState(null);
    const [settingsList, setSettingsList] = useState([]);

    const getSetting = (key, fallback) => {
        const s = settingsList.find(item => item.key_name === key);
        return s ? s.value : fallback;
    };

    const defaultKetua = getSetting('default_signer_ketua', '................');
    const defaultKoordinator = getSetting('default_signer_koordinator', '................');

    // Form & UI State
    const [activeTab, setActiveTab] = useState('yatim');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('donasi');
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ sumber: '', jumlah: '', nama: '', rt: '01', besaran: '', nama_orang_tua: '', umur: '', rekening: '' });
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Initial Data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [sedekahRes, santunanRes, rtRes, settingsRes] = await Promise.all([
                    fetchSedekahList({ jenis: 'penerimaan', per_page: 100 }),
                    fetchSantunanList({ per_page: 500 }),
                    fetchRTs(),
                    fetchSettings()
                ]);

                if (settingsRes.success) {
                    setSettingsList(settingsRes.data);
                }

                setDonasiSantunan(sedekahRes.data.map(d => ({
                    id: d.id,
                    sumber: d.tujuan, // Using 'tujuan' field for source
                    jumlah: Number(d.jumlah),
                    tanggal: d.tanggal
                })));

                setAnakYatim(santunanRes.data.map(a => ({
                    id: a.id,
                    nama: a.nama_anak,
                    rt: a.rt?.kode || '??',
                    besaran: Number(a.besaran),
                    nama_orang_tua: a.nama_orang_tua || '-',
                    umur: a.umur || '-',
                    rekening: a.rekening || '-',
                    statusPenerimaan: a.status_penerimaan.charAt(0).toUpperCase() + a.status_penerimaan.slice(1)
                })));

                setRtRw(Array.isArray(rtRes) ? rtRes : (rtRes?.data || []));
            } catch (err) {
                console.error('Failed to load Santunan data:', err);
                setError('Gagal memuat data dari server.');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const totalDonasi = donasiSantunan.reduce((acc, curr) => acc + curr.jumlah, 0);
    const totalAnak = anakYatim.length;
    const totalSantunanKeluar = anakYatim.reduce((acc, curr) => acc + curr.besaran, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalType === 'donasi') {
                const payload = {
                    jumlah: Number(formData.jumlah),
                    jenis: 'penerimaan',
                    tujuan: formData.sumber, // Using 'tujuan' for source
                    tanggal: new Date().toISOString().split('T')[0],
                    tahun: new Date().getFullYear(),
                    rt_id: rtRw.find(r => r.kode === '01')?.id || 1 // Default to RT 01
                };
                const res = await createSedekah(payload);
                const newData = {
                    id: res.data.id,
                    sumber: res.data.tujuan,
                    jumlah: Number(res.data.jumlah),
                    tanggal: res.data.tanggal
                };
                setDonasiSantunan(prev => [newData, ...prev]);
                alert('Donasi berhasil disimpan!');
            } else if (modalType === 'yatim') {
                const rtObj = rtRw.find(r => r.kode === formData.rt);
                const payload = {
                    nama_anak: formData.nama,
                    rt_id: rtObj?.id || 1,
                    besaran: Number(formData.besaran),
                    nama_orang_tua: formData.nama_orang_tua,
                    umur: formData.umur,
                    rekening: formData.rekening,
                    status_penerimaan: 'belum',
                    tahun: new Date().getFullYear()
                };

                if (editId) {
                    const res = await updateSantunanApi(editId, payload);
                    setAnakYatim(prev => prev.map(a => a.id === editId ? {
                        id: res.data.id,
                        nama: res.data.nama_anak,
                        rt: res.data.rt?.kode || '??',
                        besaran: Number(res.data.besaran),
                        nama_orang_tua: res.data.nama_orang_tua || formData.nama_orang_tua,
                        umur: res.data.umur || formData.umur,
                        rekening: res.data.rekening || formData.rekening,
                        statusPenerimaan: res.data.status_penerimaan.charAt(0).toUpperCase() + res.data.status_penerimaan.slice(1)
                    } : a));
                    alert('Data anak berhasil diperbarui!');
                } else {
                    const res = await createSantunan(payload);
                    const newData = {
                        id: res.data.id,
                        nama: res.data.nama_anak,
                        rt: res.data.rt?.kode || '??',
                        besaran: Number(res.data.besaran),
                        nama_orang_tua: res.data.nama_orang_tua || formData.nama_orang_tua,
                        umur: res.data.umur || formData.umur,
                        rekening: res.data.rekening || formData.rekening,
                        statusPenerimaan: res.data.status_penerimaan.charAt(0).toUpperCase() + res.data.status_penerimaan.slice(1)
                    };
                    setAnakYatim(prev => [...prev, newData]);
                    alert('Data anak berhasil ditambahkan!');
                }
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan data.');
        }
    };

    const handleDeleteClick = (id, type) => {
        setDeleteModal({ open: true, id, type, loading: false });
    };

    const confirmDelete = async () => {
        const { id, type } = deleteModal;
        if (!id) return;

        setDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            if (type === 'donasi') {
                await deleteSedekahApi(id);
                setDonasiSantunan(prev => prev.filter(d => d.id !== id));
            } else { // type === 'yatim'
                await deleteSantunanApi(id);
                setAnakYatim(prev => prev.filter(a => a.id !== id));
            }
            setDeleteModal({ open: false, id: null, type: null, loading: false });
        } catch (err) {
            alert('Gagal menghapus data');
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };


    const handleEditYatim = (item) => {
        setModalType('yatim');
        setEditId(item.id);
        setFormData({
            ...formData,
            nama: item.nama,
            rt: item.rt === '??' ? '01' : item.rt,
            besaran: item.besaran,
            nama_orang_tua: item.nama_orang_tua || '',
            umur: item.umur || '',
            rekening: item.rekening || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setModalType('donasi');
        setFormData({ sumber: '', jumlah: '', nama: '', rt: '01', besaran: '', nama_orang_tua: '', umur: '', rekening: '' });
    };

    const filteredAnakYatim = anakYatim.filter(a =>
        a.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="santunan-container">
            {/* Hidden Print Layout Removed */}

            {/* Global Stats & Layout Reorganization */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--success)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Saldo Donasi</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>Rp {totalDonasi.toLocaleString()}</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Jumlah Anak</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{totalAnak} Jiwa</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--warning)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Rencana Salur</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>Rp {totalSantunanKeluar.toLocaleString()}</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--info)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Donasi Masuk</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--info)' }}>{donasiSantunan.length} Tx</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignContent: 'start' }}>
                        <button className="btn" style={{ border: '1px solid var(--card-border)', background: '#fff' }}>2026</button>
                        <button className="btn" onClick={handlePrint} disabled={loading} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff', border: '1px solid var(--card-border)' }}>
                            <Printer size={16} /> Print
                        </button>
                        <button className="btn" style={{ border: '1px solid var(--card-border)', background: '#fff' }}>Info</button>
                    </div>
                </div>

                {/* Inline Forms */}
                {activeTab === 'yatim' && (
                    <div className="card" style={{ padding: '1.5rem', background: '#e9ecef', marginBottom: '1.5rem', border: 'none' }}>
                        <form onSubmit={(e) => { e.preventDefault(); setModalType('yatim'); handleSubmit(e); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Nama Anak</label>
                                <input className="form-control" value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} placeholder="Nama Lengkap" required style={{ background: '#fff' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Nama Orang Tua/Wali</label>
                                <input className="form-control" value={formData.nama_orang_tua} onChange={e => setFormData({ ...formData, nama_orang_tua: e.target.value })} placeholder="Nama Wali" style={{ background: '#fff' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Umur (Thn)</label>
                                <input type="number" className="form-control" value={formData.umur} onChange={e => setFormData({ ...formData, umur: e.target.value })} placeholder="Contoh: 10" style={{ background: '#fff' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>No. Rekening</label>
                                <input className="form-control" value={formData.rekening} onChange={e => setFormData({ ...formData, rekening: e.target.value })} placeholder="Bank - No Rek" style={{ background: '#fff' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>RT</label>
                                <select className="form-control" value={formData.rt} onChange={e => setFormData({ ...formData, rt: e.target.value })} style={{ background: '#fff' }}>
                                    {rtRw.map(rt => <option key={rt.kode} value={rt.kode}>RT {rt.kode}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Besaran (Rp)</label>
                                <input type="number" className="form-control" value={formData.besaran} onChange={e => setFormData({ ...formData, besaran: e.target.value })} placeholder="0" required style={{ background: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', gridColumn: 'span 2' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
                                <button type="button" className="btn btn-ghost" style={{ flex: 1, background: '#fff', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={() => setFormData({ sumber: '', jumlah: '', nama: '', rt: '01', besaran: '', nama_orang_tua: '', umur: '', rekening: '' })}>Batal</button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'donasi' && (
                    <div className="card" style={{ padding: '1.5rem', background: '#e9ecef', marginBottom: '1.5rem', border: 'none' }}>
                        <form onSubmit={(e) => { e.preventDefault(); setModalType('donasi'); handleSubmit(e); }} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Sumber Donasi</label>
                                <input className="form-control" value={formData.sumber} onChange={e => setFormData({ ...formData, sumber: e.target.value })} placeholder="Contoh: Hamba Allah" required style={{ background: '#fff' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Jumlah Donasi (Rp)</label>
                                <input type="number" className="form-control" value={formData.jumlah} onChange={e => setFormData({ ...formData, jumlah: e.target.value })} placeholder="0" required style={{ background: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
                                <button type="button" className="btn btn-ghost" style={{ flex: 1, background: '#fff', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={() => setFormData({ sumber: '', jumlah: '', nama: '', rt: '01', besaran: '', nama_orang_tua: '', umur: '', rekening: '' })}>Batal</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', marginBottom: '1.5rem', alignItems: 'center' }}>
                    {['yatim', 'donasi'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '1rem 2rem',
                                background: 'none',
                                border: 'none',
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === 'yatim' ? 'Data Penerima (Anak Yatim)' : 'Log Donasi Masuk'}
                        </button>
                    ))}
                </div>

                <div className="table-container">
                    {activeTab === 'yatim' && (
                        <table className="table-compact table-print-boxed">
                            <thead>
                                <tr>
                                    <th className="col-no">NO</th>
                                    <th>Nama Anak</th>
                                    <th>Wali / Orang Tua</th>
                                    <th style={{ textAlign: 'center' }}>Umur</th>
                                    <th>RT</th>
                                    <th>No. Rekening</th>
                                    <th>Besaran</th>
                                    <th className="no-print">Status</th>
                                    <th className="no-print">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="spin" /></td></tr>
                                ) : filteredAnakYatim.length === 0 ? (
                                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data anak yatim.</td></tr>
                                ) : filteredAnakYatim.map((a, index) => (
                                    <tr key={a.id}>
                                        <td className="col-no">{index + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{a.nama}</td>
                                        <td>{a.nama_orang_tua}</td>
                                        <td style={{ textAlign: 'center' }}>{a.umur}</td>
                                        <td style={{ textAlign: 'center' }}>RT {a.rt}</td>
                                        <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{a.rekening}</td>
                                        <td style={{ fontWeight: 600 }}>Rp {a.besaran.toLocaleString()}</td>
                                        <td className="no-print">
                                            <span style={{
                                                background: a.statusPenerimaan === 'Sudah' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                                color: a.statusPenerimaan === 'Sudah' ? 'var(--success)' : 'var(--warning)',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {a.statusPenerimaan}
                                            </span>
                                        </td>
                                        <td className="no-print">
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-ghost" style={{ padding: '4px' }} onClick={() => handleEditYatim(a)}><Edit2 size={14} /></button>
                                                <button className="btn btn-ghost" style={{ padding: '4px', color: 'var(--danger)' }} onClick={() => handleDeleteClick(a.id, 'yatim')}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'donasi' && (
                        <table className="table-compact">
                            <thead>
                                <tr>
                                    <th className="col-no">NO</th>
                                    <th>Sumber Donasi</th>
                                    <th>Tanggal</th>
                                    <th>Jumlah</th>
                                    <th className="no-print">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donasiSantunan.map((d, index) => (
                                    <tr key={d.id}>
                                        <td className="col-no">{index + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{d.sumber}</td>
                                        <td>{formatDate(d.tanggal)}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>+ Rp {d.jumlah.toLocaleString()}</td>
                                        <td className="no-print">
                                            <button className="btn btn-ghost" style={{ padding: '4px', color: 'var(--danger)' }} onClick={() => handleDeleteClick(d.id, 'donasi')}><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <ConfirmDeleteModal
                open={deleteModal.open}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, id: null, type: null, loading: false })}
                loading={deleteModal.loading}
            />
            {/* Hidden Print Container */}
            <div style={{ position: 'absolute', top: 0, left: -10000, width: '210mm', zIndex: -1000 }}>
                <div ref={printRef}>
                    <SantunanPrint data={filteredAnakYatim} defaultKetua={defaultKetua} defaultKoordinator={defaultKoordinator} />
                </div>
            </div>
        </div>
    );
};

export default Santunan;
