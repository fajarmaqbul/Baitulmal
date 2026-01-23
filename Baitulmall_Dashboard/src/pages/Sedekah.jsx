import React, { useState, useRef } from 'react';

import {
    Heart,
    Plus,
    Search,
    TrendingUp,
    Calendar,
    User,
    Edit2,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    FileText,
    Printer,
    Loader2
} from 'lucide-react';
import { exportToExcel, formatDate } from '../utils/dataUtils';
import { fetchAsnafList, fetchRTs } from '../services/asnafApi';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { fetchSedekahList, createSedekah, deleteSedekahApi } from '../services/santunanApi';
import PrintLayout from '../components/PrintLayout';
import { usePagePrint } from '../hooks/usePagePrint';
import { fetchSettings } from '../services/settingApi';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
    Title
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, Title);

const SedekahPrint = ({ activeTab, sedekah, penyaluranSedekah, amilData, defaultKetua, defaultBendahara }) => (
    <PrintLayout
        title={`Laporan Sedekah - ${activeTab === 'amil' ? 'Daftar Amil' : activeTab === 'penyaluran' ? 'Penyaluran' : 'Penerimaan'}`}
    >
        {activeTab === 'penerimaan' && (
            <table className="table-print-boxed">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>No</th>
                        <th>Amil</th>
                        <th>RT</th>
                        <th>Tanggal</th>
                        <th>Nominal</th>
                    </tr>
                </thead>
                <tbody>
                    {sedekah.map((s, index) => (
                        <tr key={s.id}>
                            <td style={{ textAlign: 'center' }}>{index + 1}</td>
                            <td>{s.amil}</td>
                            <td style={{ textAlign: 'center' }}>{s.rt}</td>
                            <td style={{ textAlign: 'center' }}>{formatDate(s.tanggal)}</td>
                            <td style={{ fontWeight: 600, textAlign: 'right' }}>Rp {s.jumlah.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
        {activeTab === 'penyaluran' && (
            <table className="table-print-boxed">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>No</th>
                        <th>Tujuan</th>
                        <th>Tanggal</th>
                        <th>Nominal</th>
                    </tr>
                </thead>
                <tbody>
                    {penyaluranSedekah.map((s, index) => (
                        <tr key={s.id}>
                            <td style={{ textAlign: 'center' }}>{index + 1}</td>
                            <td>{s.tujuan}</td>
                            <td style={{ textAlign: 'center' }}>{formatDate(s.tanggal)}</td>
                            <td style={{ fontWeight: 600, textAlign: 'right' }}>Rp {s.jumlah.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
        {activeTab === 'amil' && (
            <table className="table-print-boxed">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>No</th>
                        <th>Nama Amil</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {amilData.map((s, index) => (
                        <tr key={s.id}>
                            <td style={{ textAlign: 'center' }}>{index + 1}</td>
                            <td>{s.nama}</td>
                            <td style={{ textAlign: 'center' }}>{s.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
        <div className="signature-grid">
            <div className="signature-item">
                <div className="signature-title">Ketua Baitulmall</div>
                <div className="signature-name">{defaultKetua}</div>
            </div>
            <div className="signature-item">
                <div className="signature-title">Bendahara</div>
                <div className="signature-name">{defaultBendahara}</div>
            </div>
        </div>
    </PrintLayout>
);

const Sedekah = () => {
    // Print State
    const printRef = useRef(null);
    const handlePrint = usePagePrint(printRef, 'Laporan Sedekah');
    // Local state fallback (will be replaced with API calls when available)
    const [sedekah, setSedekah] = React.useState([]);
    const [amilData, setAmilData] = React.useState([]);
    const [penyaluranSedekah, setPenyaluranSedekah] = React.useState([]);
    const [rtRw, setRtRw] = React.useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, type: null, loading: false });
    const [settingsList, setSettingsList] = useState([]);

    const getSetting = (key, fallback) => {
        const s = settingsList.find(item => item.key_name === key);
        return s ? s.value : fallback;
    };

    const defaultKetua = getSetting('default_signer_ketua', '................');
    const defaultBendahara = getSetting('default_signer_bendahara', '................');
    const [error, setError] = React.useState(null);

    // Fetch data from API
    React.useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [sedekahRes, penyaluranRes, amilRes, rtRes, settingsRes] = await Promise.all([
                    fetchSedekahList({ jenis: 'penerimaan', per_page: 50 }),
                    fetchSedekahList({ jenis: 'penyaluran', per_page: 50 }),
                    fetchAsnafList({ kategori: 'Amil', per_page: 100 }),
                    fetchRTs(),
                    fetchSettings()
                ]);

                if (settingsRes.success) {
                    setSettingsList(settingsRes.data);
                }

                // Map Sedekah (penerimaan)
                setSedekah(sedekahRes.data.map(s => ({
                    id: s.id,
                    amil: s.amil?.nama || 'N/A',
                    rt: s.rt?.kode || '??',
                    tanggal: s.tanggal,
                    jumlah: Number(s.jumlah)
                })));

                // Map Penyaluran
                setPenyaluranSedekah(penyaluranRes.data.map(p => ({
                    id: p.id,
                    tujuan: p.tujuan,
                    tanggal: p.tanggal,
                    jumlah: Number(p.jumlah)
                })));

                // Map Amil from Asnaf
                setAmilData(amilRes.data.map(a => ({
                    id: a.id,
                    nama: a.nama,
                    status: a.status === 'active' ? 'Aktif' : 'Non-Aktif'
                })));

                setRtRw(Array.isArray(rtRes) ? rtRes : (rtRes?.data || []));
            } catch (err) {
                console.error('Failed to load Sedekah data:', err);
                setError(err?.message || 'Gagal memuat data Sedekah');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Local state update functions (previously from context)
    const addSedekah = (data) => setSedekah(prev => [...prev, { id: Date.now(), ...data }]);
    const updateSedekah = (id, data) => setSedekah(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    const deleteSedekah = (id) => setSedekah(prev => prev.filter(s => s.id !== id));

    const addAmil = (data) => setAmilData(prev => [...prev, { id: Date.now(), ...data }]);
    const updateAmil = (id, data) => setAmilData(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    const deleteAmil = (id) => setAmilData(prev => prev.filter(a => a.id !== id));

    const addPenyaluranSedekah = (data) => setPenyaluranSedekah(prev => [...prev, { id: Date.now(), ...data }]);
    const updatePenyaluranSedekah = (id, data) => setPenyaluranSedekah(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    const deletePenyaluranSedekah = (id) => setPenyaluranSedekah(prev => prev.filter(p => p.id !== id));


    const [activeTab, setActiveTab] = useState('penerimaan');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('penerimaan');
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ amil: '', rt: '01', jumlah: '', nama: '', tujuan: '' });

    const totalSedekah = sedekah.reduce((acc, curr) => acc + curr.jumlah, 0);
    const totalPenyaluran = penyaluranSedekah.reduce((acc, curr) => acc + curr.jumlah, 0);
    const saldoSedekah = totalSedekah - totalPenyaluran;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const numJumlah = Number(formData.jumlah);

        try {
            if (modalType === 'penerimaan') {
                const amilObj = amilData.find(a => a.nama === formData.amil);
                const rtObj = rtRw.find(r => r.kode === formData.rt);

                const payload = {
                    amil_id: amilObj?.id,
                    rt_id: rtObj?.id,
                    jumlah: numJumlah,
                    jenis: 'penerimaan',
                    tujuan: `Zakat/Sedekah via ${formData.amil}`,
                    tanggal: new Date().toISOString().split('T')[0],
                    tahun: new Date().getFullYear()
                };

                const res = await createSedekah(payload);
                setSedekah(prev => [{
                    id: res.data.id,
                    amil: res.data.amil?.nama || formData.amil,
                    rt: res.data.rt?.kode || formData.rt,
                    tanggal: res.data.tanggal,
                    jumlah: Number(res.data.jumlah)
                }, ...prev]);
                alert('Data penerimaan berhasil disimpan!');

            } else if (modalType === 'penyaluran') {
                const payload = {
                    jumlah: numJumlah,
                    jenis: 'penyaluran',
                    tujuan: formData.tujuan,
                    tanggal: new Date().toISOString().split('T')[0],
                    tahun: new Date().getFullYear()
                };

                const res = await createSedekah(payload);
                setPenyaluranSedekah(prev => [{
                    id: res.data.id,
                    tujuan: res.data.tujuan,
                    tanggal: res.data.tanggal,
                    jumlah: Number(res.data.jumlah)
                }, ...prev]);
                alert('Data penyaluran berhasil disimpan!');
            } else if (modalType === 'amil') {
                alert('Manajemen amil dilakukan di halaman Manajemen Asnaf.');
            }
            closeModal();
        } catch (err) {
            console.error('Error saving data:', err);
            const validationErrors = err.response?.data?.errors;
            let errorMessage = 'Gagal menyimpan data ke server.';

            if (validationErrors) {
                errorMessage += '\n- ' + Object.values(validationErrors).flat().join('\n- ');
            } else if (err.response?.data?.message) {
                errorMessage += '\n' + err.response.data.message;
            }

            alert(errorMessage);
        }
    };

    const handleEdit = (type, item) => {
        setModalType(type);
        setEditId(item.id);
        if (type === 'penerimaan') {
            setFormData({ ...formData, amil: item.amil, rt: item.rt, jumlah: item.jumlah });
        } else if (type === 'amil') {
            setFormData({ ...formData, nama: item.nama });
        } else if (type === 'penyaluran') {
            setFormData({ ...formData, tujuan: item.tujuan, jumlah: item.jumlah });
        }
        setShowModal(true);
    };

    const handleDeleteClick = (type, id) => {
        if (type === 'amil') {
            alert('Peringatan: Menghapus amil harus dilakukan di halaman Manajemen Asnaf.');
            return;
        }
        setDeleteModal({ open: true, id, type, loading: false });
    };

    const confirmDelete = async () => {
        const { id, type } = deleteModal;
        if (!id || !type) return;

        setDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            await deleteSedekahApi(id);
            if (type === 'penerimaan') {
                setSedekah(prev => prev.filter(item => item.id !== id));
            } else if (type === 'penyaluran') {
                setPenyaluranSedekah(prev => prev.filter(item => item.id !== id));
            }
            alert('Data berhasil dihapus.');
            setDeleteModal({ open: false, id: null, type: null, loading: false });
        } catch (err) {
            console.error('Error deleting data:', err);
            alert('Gagal menghapus data.');
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleExport = (format) => {
        if (format === 'EXCEL') {
            let dataToExport = [];
            let fileName = 'Laporan_Sedekah';

            if (activeTab === 'penerimaan') {
                dataToExport = sedekah.map(s => ({
                    'Amil': s.amil,
                    'RT': s.rt,
                    'Tanggal': s.tanggal,
                    'Nominal': s.jumlah
                }));
                fileName = 'Laporan_Penerimaan_Sedekah';
            } else if (activeTab === 'penyaluran') {
                dataToExport = penyaluranSedekah.map(p => ({
                    'Tujuan': p.tujuan,
                    'Tanggal': p.tanggal,
                    'Nominal': p.jumlah
                }));
                fileName = 'Laporan_Penyaluran_Sedekah';
            } else {
                dataToExport = amilData.map(a => ({
                    'Nama Amil': a.nama,
                    'Status': a.status
                }));
                fileName = 'Daftar_Amil';
            }
            exportToExcel(dataToExport, fileName);
            exportToExcel(dataToExport, fileName);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setModalType('penerimaan');
        setFormData({ amil: '', rt: '01', jumlah: '', nama: '', tujuan: '' });
    };

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
        datasets: [{
            label: 'Donation Trend',
            data: [4200000, 5900000, 4500000, 6100000, 5200000, totalSedekah],
            borderColor: '#4B49AC',
            backgroundColor: 'rgba(75, 73, 172, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#fff'
        }]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#6C7383', font: { size: 11 } } },
            y: { grid: { color: '#f1f1f1' }, ticks: { color: '#6C7383', font: { size: 11 } } }
        }
    };

    return (
        <div className="sedekah-container">
            {/* Hidden Print Layout Removed */}

            {/* Global Stats & Layout Reorganization */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Penerimaan</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>Rp {totalSedekah.toLocaleString()}</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--danger)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Penyaluran</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>Rp {totalPenyaluran.toLocaleString()}</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--success)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Saldo Saat Ini</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>Rp {saldoSedekah.toLocaleString()}</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--info)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Transaksi</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--info)' }}>{(sedekah.length + penyaluranSedekah.length).toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Action Buttons (Top Right) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignContent: 'start' }}>
                        <button className="btn" style={{ border: '1px solid var(--card-border)', background: '#fff' }}>
                            2026
                        </button>
                        <button className="btn" onClick={handlePrint} disabled={loading} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff', border: '1px solid var(--card-border)' }}>
                            <Printer size={16} /> Print
                        </button>
                        <button className="btn" style={{ border: '1px solid var(--card-border)', background: '#fff' }} onClick={() => handleExport('EXCEL')}>
                            Excel
                        </button>
                    </div>
                </div>

                {/* Inline Forms - Always Visible based on Active Tab */}
                {activeTab === 'penerimaan' && (
                    <div className="card" style={{ padding: '1.5rem', background: '#e9ecef', marginBottom: '1.5rem', border: 'none' }}>
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '1rem', alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Pilih Amil</label>
                                <select className="form-control" value={formData.amil} onChange={e => setFormData({ ...formData, amil: e.target.value })} required style={{ background: '#fff' }}>
                                    <option value="">-- Pilih Amil --</option>
                                    {amilData.map(a => <option key={a.id} value={a.nama}>{a.nama}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>RT</label>
                                <select className="form-control" value={formData.rt} onChange={e => setFormData({ ...formData, rt: e.target.value })} style={{ background: '#fff' }}>
                                    {rtRw.map(rt => <option key={rt.kode} value={rt.kode}>RT {rt.kode}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Jumlah (Rp)</label>
                                <input type="number" className="form-control" value={formData.jumlah} onChange={e => setFormData({ ...formData, jumlah: e.target.value })} placeholder="0" required style={{ background: '#fff' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Simpan</button>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <button type="button" className="btn btn-ghost" style={{ width: '100%', background: '#fff', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={() => setFormData({ amil: '', rt: '01', jumlah: '', nama: '', tujuan: '' })}>Batal</button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'penyaluran' && (
                    <div className="card" style={{ padding: '1.5rem', background: '#e9ecef', marginBottom: '1.5rem', border: 'none' }}>
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto auto', gap: '1rem', alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Tujuan Penyaluran</label>
                                <input type="text" className="form-control" value={formData.tujuan} onChange={e => setFormData({ ...formData, tujuan: e.target.value })} placeholder="Masukkan tujuan penyaluran..." required style={{ background: '#fff' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Jumlah (Rp)</label>
                                <input type="number" className="form-control" value={formData.jumlah} onChange={e => setFormData({ ...formData, jumlah: e.target.value })} placeholder="0" required style={{ background: '#fff' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <button type="submit" className="btn btn-primary" style={{ width: '100px' }}>Simpan</button>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <button type="button" className="btn btn-ghost" style={{ width: '100px', background: '#fff', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={() => setFormData({ amil: '', rt: '01', jumlah: '', nama: '', tujuan: '' })}>Batal</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>




            <div className="glass-card print-area">
                <div className="no-print" style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', marginBottom: '1.5rem', alignItems: 'center' }}>
                    {['penerimaan', 'penyaluran', 'amil'].map(tab => (
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
                            {tab === 'amil' ? 'Daftar Amil' : tab}
                        </button>
                    ))}
                    <div style={{ marginLeft: 'auto', padding: '0.5rem' }}>
                        {/* Actions Removed - Inline Form Used */}
                    </div>
                </div>

                <div className="table-container">
                    {activeTab === 'penerimaan' && (
                        <table className="table-compact table-print-boxed">
                            <thead>
                                <tr>
                                    <th className="col-no">NO</th>
                                    <th>Amil</th>
                                    <th>RT</th>
                                    <th>Tanggal</th>
                                    <th>Nominal</th>
                                    <th className="no-print">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sedekah.map((s, index) => (
                                    <tr key={s.id}>
                                        <td className="col-no" style={{ textAlign: 'center' }}>{index + 1}</td>
                                        <td>{s.amil}</td>
                                        <td style={{ textAlign: 'center' }}>RT {s.rt}</td>
                                        <td style={{ textAlign: 'center' }}>{formatDate(s.tanggal)}</td>
                                        <td style={{ fontWeight: 600 }}>Rp {s.jumlah.toLocaleString()}</td>
                                        <td className="no-print">
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => handleEdit('penerimaan', s)}><Edit2 size={14} style={{ pointerEvents: 'none' }} /></button>
                                                <button type="button" className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)', position: 'relative', zIndex: 10, cursor: 'pointer' }} onClick={() => handleDeleteClick('penerimaan', s.id)} title="Hapus"><Trash2 size={14} style={{ pointerEvents: 'none' }} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {activeTab === 'penyaluran' && (
                        <table className="table-compact table-print-boxed">
                            <thead>
                                <tr>
                                    <th className="col-no">NO</th>
                                    <th>Tujuan Penyaluran</th>
                                    <th>Tanggal</th>
                                    <th>Nominal</th>
                                    <th className="no-print">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {penyaluranSedekah.map((p, index) => (
                                    <tr key={p.id}>
                                        <td className="col-no" style={{ textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ fontWeight: 500 }}>{p.tujuan}</td>
                                        <td style={{ textAlign: 'center' }}>{formatDate(p.tanggal)}</td>
                                        <td style={{ fontWeight: 600 }}>Rp {p.jumlah.toLocaleString()}</td>
                                        <td className="no-print">
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => handleEdit('penyaluran', p)}><Edit2 size={14} style={{ pointerEvents: 'none' }} /></button>
                                                <button type="button" className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)', position: 'relative', zIndex: 10, cursor: 'pointer' }} onClick={() => handleDeleteClick('penyaluran', p.id)} title="Hapus"><Trash2 size={14} style={{ pointerEvents: 'none' }} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {activeTab === 'amil' && (
                        <table className="table-compact table-print-boxed">
                            <thead>
                                <tr>
                                    <th className="col-no">NO</th>
                                    <th>Nama Amil</th>
                                    <th>Status</th>
                                    <th className="no-print">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="spin" /></td></tr>
                                ) : amilData.length > 0 ? amilData.map((a, index) => (
                                    <tr key={a.id}>
                                        <td className="col-no" style={{ textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{a.nama}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`dot ${a.status === 'Aktif' ? 'dot-success' : 'dot-warning'}`} style={{ marginRight: '0.5rem' }}></span>
                                            {a.status}
                                        </td>
                                        <td className="no-print">
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-ghost" style={{ padding: '0.4rem', border: '1px solid var(--card-border)' }} onClick={() => window.location.href = '/asnaf'}>
                                                    <ArrowUpRight size={14} /> Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada data amil dengan kategori 'Amil' di Manajemen Asnaf.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>




            <ConfirmDeleteModal
                open={deleteModal.open}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, id: null, loading: false })}
                loading={deleteModal.loading}
            />
            {/* Hidden Print Container */}
            <div style={{ position: 'absolute', top: 0, left: -10000, width: '210mm', zIndex: -1000 }}>
                <div ref={printRef}>
                    <SedekahPrint
                        activeTab={activeTab}
                        sedekah={sedekah}
                        penyaluranSedekah={penyaluranSedekah}
                        amilData={amilData}
                        defaultKetua={defaultKetua}
                        defaultBendahara={defaultBendahara}
                    />
                </div>
            </div>
        </div >
    );
};

export default Sedekah;
