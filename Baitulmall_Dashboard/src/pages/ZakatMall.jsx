import React, { useState, useRef } from 'react';
import {
    Coins,
    Plus,
    PieChart,
    Filter,
    ArrowUpRight,
    TrendingDown,
    Briefcase,
    Loader2,
    Trash2,
    Printer,
    Download,
    FileText,
    Shield,
    Pencil
} from 'lucide-react';
import { fetchZakatMallList, createZakatMall, updateZakatMallApi, deleteZakatMallApi } from '../services/zakatMallApi';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { fetchRTs } from '../services/asnafApi';
import PrintLayout from '../components/PrintLayout';
import { usePagePrint } from '../hooks/usePagePrint';
import { fetchSettings } from '../services/settingApi';
import { useSignatureRule } from '../hooks/useSignatureRule';
import OfficialDocumentTemplate from '../components/Print/OfficialDocumentTemplate';
import ZakatCalculator from '../components/zakat/ZakatCalculator';
import { CurrencyInput } from '../components/ui/CurrencyInput';

const ZakatMallPrint = ({ data, signers }) => (
    <PrintLayout title="Laporan Zakat Mall (Harta/Profesi)">
        <table className="table-print-boxed">
            <thead>
                <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                    <th>Nama Muzaki</th>
                    <th>Kategori</th>
                    <th>RT / Lokasi</th>
                    <th>Tanggal</th>
                    <th style={{ width: '150px' }}>Nominal</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={item.id}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ fontWeight: 600 }}>{item.nama_muzaki || 'Hamba Allah'}</td>
                        <td>{item.kategori}</td>
                        <td style={{ textAlign: 'center' }}>{item.rt}</td>
                        <td style={{ textAlign: 'center' }}>{item.tanggal}</td>
                        <td style={{ fontWeight: 600, textAlign: 'right' }}>Rp {item.jumlah.toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="signature-grid">
            <div className="signature-item">
                <div className="signature-title">{signers.left?.jabatan || 'Ketua Baitulmal'}</div>
                <div className="signature-name">{signers.left?.nama_pejabat || '...................'}</div>
                {signers.left?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP: {signers.left.nip}</div>}
            </div>
            <div className="signature-item">
                <div className="signature-title">{signers.right?.jabatan || 'Bendahara'}</div>
                <div className="signature-name">{signers.right?.nama_pejabat || '...................'}</div>
                {signers.right?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP: {signers.right.nip}</div>}
            </div>
        </div>
    </PrintLayout>
);

const ZakatMallReceipt = ({ data, signer }) => (
    <OfficialDocumentTemplate
        title="BUKTI SETORAN ZAKAT"
        documentNo={`ZM/${new Date().getFullYear()}/${data?.id || '000'}`}
        signer={signer}
    >
        <div style={{ padding: '1rem 0' }}>
            <table style={{ width: '100%', fontSize: '1.1rem', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '180px', padding: '0.5rem 0', verticalAlign: 'top' }}>Telah Terima Dari</td>
                        <td style={{ width: '20px', verticalAlign: 'top' }}>:</td>
                        <td style={{ fontWeight: 700, paddingBottom: '0.5rem' }}>{data?.nama_muzaki || 'Hamba Allah (Muzaki)'}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0.5rem 0', verticalAlign: 'top' }}>Wilayah</td>
                        <td style={{ verticalAlign: 'top' }}>:</td>
                        <td style={{ fontWeight: 700, paddingBottom: '0.5rem' }}>RT {data?.rt}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0.5rem 0', verticalAlign: 'top' }}>Kategori Zakat</td>
                        <td style={{ verticalAlign: 'top' }}>:</td>
                        <td style={{ paddingBottom: '0.5rem' }}>{data?.kategori}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0.5rem 0', verticalAlign: 'top' }}>Tanggal</td>
                        <td style={{ verticalAlign: 'top' }}>:</td>
                        <td style={{ paddingBottom: '0.5rem' }}>{new Date(data?.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    </tr>
                </tbody>
            </table>

            <div style={{ padding: '1.5rem', border: '2px dashed #000', background: '#f9f9f9', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ fontSize: '0.9rem', width: '120px' }}>Jumlah Setoran:</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>Rp {Number(data?.jumlah || 0).toLocaleString()}</div>
            </div>

            <p style={{ marginTop: '1.5rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
                *Semoga Allah menerima amal ibadah Anda dan melipatgandakan rezeki Anda.
            </p>
        </div>
    </OfficialDocumentTemplate>
);

const ZakatMall = () => {
    // Print State
    const printRef = useRef(null);
    const handlePrint = usePagePrint(printRef, 'Laporan Zakat Mall');
    const [receiptData, setReceiptData] = useState(null);
    const [printMode, setPrintMode] = useState('list'); // 'list' | 'receipt'

    const handlePrintReceipt = (item) => {
        setReceiptData(item);
        setPrintMode('receipt');

        // Wait for render
        setTimeout(() => {
            handlePrint();
            // Reset
            setTimeout(() => {
                setPrintMode('list');
                setReceiptData(null);
            }, 1000);
        }, 300);
    };

    // API and State
    const [zakatMallData, setZakatMallData] = useState([]);
    const [rtList, setRtList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    // Signers Hook
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, loading: false });
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ nama_muzaki: '', kategori: 'Perdagangan', jumlah: '', rt: '01', keterangan: '' });
    const [activeTab, setActiveTab] = useState('riwayat');
    const [settingsList, setSettingsList] = useState([]);

    const getSetting = (key, fallback) => {
        const s = settingsList.find(item => item.key_name === key);
        return s ? s.value : fallback;
    };

    const { leftSigner, rightSigner } = useSignatureRule('zakat_mall');

    // ... (inside component)
    const handleCancelEdit = () => {
        setEditId(null);
        setFormData({ nama_muzaki: '', kategori: 'Perdagangan', jumlah: '', rt: '01', keterangan: '' });
    };

    // Fetch Data
    React.useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Dynamic import
                const { fetchStructures, fetchAssignments } = await import('../services/sdmApi');

                const [zmResponse, rtResponse, settingsRes, structuresRes] = await Promise.all([
                    fetchZakatMallList({ per_page: 500 }),
                    fetchRTs(),
                    fetchSettings(),
                    fetchStructures()
                ]);

                if (settingsRes.success) {
                    setSettingsList(settingsRes.data);
                }




                // Transform API data to match UI
                const transformed = zmResponse.data.map(item => ({
                    id: item.id,
                    nama_muzaki: item.nama_muzaki,
                    kategori: item.kategori,
                    jumlah: Number(item.jumlah),
                    rt: item.rt?.kode || 'Unknown',
                    tanggal: item.tanggal,
                    note: item.keterangan
                }));

                setZakatMallData(transformed);
                setRtList(Array.isArray(rtResponse) ? rtResponse : (rtResponse.data || []));
            } catch (err) {
                console.error('Failed to load Zakat Mall data:', err);
                // Fallback to empty or show error
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const totalZakatMall = zakatMallData.reduce((acc, curr) => acc + curr.jumlah, 0);

    // Group by Category
    const byCategory = zakatMallData.reduce((acc, curr) => {
        acc[curr.kategori] = (acc[curr.kategori] || 0) + curr.jumlah;
        return acc;
    }, {});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const rtObj = rtList.find(r => r.kode === formData.rt);
            const payload = {
                rt_id: rtObj?.id || 1,
                nama_muzaki: formData.nama_muzaki,
                kategori: formData.kategori,
                jumlah: Number(formData.jumlah),
                tanggal: new Date().toISOString().split('T')[0],
                keterangan: formData.keterangan || ''
            };

            setLoading(true);

            if (editId) {
                // UPDATE
                const response = await updateZakatMallApi(editId, payload);
                // Update local state
                const updatedItem = {
                    id: response.data.id,
                    nama_muzaki: response.data.nama_muzaki,
                    kategori: response.data.kategori,
                    jumlah: Number(response.data.jumlah),
                    rt: response.data.rt?.kode,
                    tanggal: response.data.tanggal,
                    note: response.data.keterangan
                };
                setZakatMallData(prev => prev.map(item => item.id === editId ? updatedItem : item));
                // Optional: alert('Data berhasil diperbarui');
            } else {
                // CREATE
                const response = await createZakatMall(payload);
                const newItem = {
                    id: response.data.id,
                    nama_muzaki: response.data.nama_muzaki,
                    kategori: response.data.kategori,
                    jumlah: Number(response.data.jumlah),
                    rt: response.data.rt?.kode,
                    tanggal: response.data.tanggal,
                    note: response.data.keterangan
                };
                setZakatMallData(prev => [newItem, ...prev]);
            }

            // Reset
            setEditId(null);
            setFormData({ nama_muzaki: '', kategori: 'Perdagangan', jumlah: '', rt: '01', keterangan: '' });
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Gagal menyimpan data';
            alert(`Gagal menyimpan: ${msg}. Pastikan nominal minimal Rp 1.000.`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        setFormData({
            nama_muzaki: item.nama_muzaki,
            kategori: item.kategori,
            jumlah: item.jumlah,
            rt: item.rt,
            keterangan: item.note || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ... (Keep existing handleDeleteClick and confirmDelete)

    // ... (Inside Return)

    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-main)]">
            {editId ? <Pencil size={20} className="text-[var(--warning)]" /> : <Plus size={20} className="text-[var(--primary)]" />}
            {editId ? 'Edit Data Zakat' : 'Input Zakat Baru (Manual)'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* ... Input Fields (Keep same) ... */}
            <div className="form-group space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Nama Muzaki</label>
                <input
                    className="input w-full h-10 font-semibold"
                    value={formData.nama_muzaki}
                    onChange={e => setFormData({ ...formData, nama_muzaki: e.target.value })}
                    placeholder="Hamba Allah"
                />
            </div>
            <div className="form-group space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Kategori Harta</label>
                <select
                    className="input w-full h-10 font-semibold"
                    value={formData.kategori}
                    onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                >
                    <option value="Perdagangan">Perdagangan</option>
                    <option value="Profesi / Gaji">Profesi / Gaji</option>
                    <option value="Hasil Usaha">Hasil Usaha</option>
                    <option value="Tabungan / Simpanan">Tabungan / Simpanan</option>
                </select>
            </div>
            <div className="form-group space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Jumlah Zakat (Rp)</label>
                <CurrencyInput
                    className="input w-full h-10"
                    value={formData.jumlah}
                    onValueChange={(val) => setFormData({ ...formData, jumlah: val })}
                    placeholder="0"
                />
            </div>
            <div className="form-group space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Asal RT</label>
                <select
                    className="input w-full h-10 font-semibold"
                    value={formData.rt}
                    onChange={e => setFormData({ ...formData, rt: e.target.value })}
                >
                    {rtList.map(rt => <option key={rt.kode} value={rt.kode}>RT {rt.kode}</option>)}
                </select>
            </div>

            <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
                <button type="button" className="btn btn-ghost border border-[var(--border-color)]"
                    onClick={() => {
                        setEditId(null);
                        setFormData({ nama_muzaki: '', kategori: 'Perdagangan', jumlah: '', rt: '01', keterangan: '' });
                    }}>
                    {editId ? 'BATAL EDIT' : 'RESET'}
                </button>
                <button type="submit" className={`btn ${editId ? 'btn-warning' : 'btn-primary'} px-6`} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (editId ? 'UPDATE ZAKAT' : 'SIMPAN ZAKAT')}
                </button>
            </div>
        </form>
    </div>

    const handleDeleteClick = (id) => {
        setDeleteModal({ open: true, id, loading: false });
    };

    const confirmDelete = async () => {
        const id = deleteModal.id;
        if (!id) return;

        setDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            await deleteZakatMallApi(id);
            setZakatMallData(prev => prev.filter(item => item.id !== id));
            setDeleteModal({ open: false, id: null, loading: false });
        } catch (err) {
            alert('Gagal menghapus data');
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="zakat-mall-container">
            {/* Hidden Print Layout Removed */}

            {/* Global Stats & Layout Reorganization */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    {/* Stats Row - Now Full Width */}
                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="card stat-hover" style={{ borderLeft: '4px solid var(--warning)', padding: '1.25rem' }}>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div style={{
                                    padding: '0.5rem', borderRadius: '8px', background: 'rgba(255, 171, 0, 0.08)'
                                    , color: 'var(--warning)'
                                }}>
                                    <Coins size={18} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zakat Mall</div>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Rp {totalZakatMall.toLocaleString()}</div>
                        </div>
                        <div className="card stat-hover" style={{ borderLeft: '4px solid var(--primary)', padding: '1.25rem' }}>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div style={{
                                    padding: '0.5rem', borderRadius: '8px', background: 'rgba(0, 144, 231, 0.08)'
                                    , color: 'var(--primary)'
                                }}>
                                    <Briefcase size={18} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Perdagangan</div>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Rp {(byCategory['Perdagangan'] || 0).toLocaleString()}</div>
                        </div>
                        <div className="card stat-hover" style={{ borderLeft: '4px solid var(--success)', padding: '1.25rem' }}>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div style={{
                                    padding: '0.5rem', borderRadius: '8px', background: 'rgba(0, 210, 91, 0.08)'
                                    , color: 'var(--success)'
                                }}>
                                    <TrendingDown size={18} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Profesi</div>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Rp {(byCategory['Profesi / Gaji'] || 0).toLocaleString()}</div>
                        </div>
                        <div className="card stat-hover" style={{ borderLeft: '4px solid var(--info)', padding: '1.25rem' }}>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div style={{
                                    padding: '0.5rem', borderRadius: '8px', background: 'rgba(143, 95, 232, 0.08)'
                                    , color: 'var(--info)'
                                }}>
                                    <PieChart size={18} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transaksi</div>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{zakatMallData.length} Tx</div>
                        </div>
                    </div>

                    {/* Toolbar: TTD & Actions */}
                    <div className="d-flex justify-content-end align-items-center">
                        {/* Signature Status Preview */}


                        {/* Action Buttons */}
                        <div className="d-flex align-items-center gap-2">
                            {/* Signature Status Preview - Moved Here */}
                            <div className="d-none d-md-flex align-items-center gap-2 small px-3 py-2 rounded-pill border me-2" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                                <Shield size={14} className={leftSigner ? "text-success" : "text-muted"} />
                                <span style={{ color: 'var(--text-muted)' }}>TTD:</span>
                                {leftSigner || rightSigner ? (
                                    <strong style={{ color: 'var(--text-main)' }}>
                                        {leftSigner?.nama_pejabat?.split(' ')[0] || '?'} & {rightSigner?.nama_pejabat?.split(' ')[0] || '?'}
                                    </strong>
                                ) : (
                                    <span className="text-danger fst-italic">Belum diset</span>
                                )}
                            </div>
                            <div className="input d-flex align-items-center justify-content-center" style={{
                                height: '42px', fontWeight: 800, background: 'rgba(0,0,0,0.03)', width: '80px', borderRadius: '10px', border: '1px solid var(--border-color)'
                            }}>
                                2026
                            </div>
                            <button className="btn btn-ghost" onClick={handlePrint} disabled={loading} style={{ border: '1px solid var(--border-color)', height: '42px', fontWeight: 700, fontSize: '0.8rem', gap: '0.5rem' }}>
                                <Printer size={16} /> PRINT
                            </button>
                            <button className="btn btn-ghost" onClick={handlePrint} disabled={loading} style={{ border: '1px solid var(--border-color)', height: '42px', fontWeight: 700, fontSize: '0.8rem', gap: '0.5rem' }}>
                                <FileText size={16} /> PDF
                            </button>
                            <button className="btn btn-ghost" style={{ border: '1px solid var(--border-color)', height: '42px', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.5px', gap: '0.5rem' }}>
                                <Download size={16} /> EXCEL
                            </button>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-main)]">
                        <Plus size={20} className="text-[var(--primary)]" /> Input Zakat Baru (Manual)
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="form-group space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Nama Muzaki</label>
                            <input
                                className="input w-full h-10 font-semibold"
                                value={formData.nama_muzaki}
                                onChange={e => setFormData({ ...formData, nama_muzaki: e.target.value })}
                                placeholder="Hamba Allah"
                            />
                        </div>
                        <div className="form-group space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Kategori Harta</label>
                            <select
                                className="input w-full h-10 font-semibold"
                                value={formData.kategori}
                                onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                            >
                                <option value="Perdagangan">Perdagangan</option>
                                <option value="Profesi / Gaji">Profesi / Gaji</option>
                                <option value="Hasil Usaha">Hasil Usaha</option>
                                <option value="Tabungan / Simpanan">Tabungan / Simpanan</option>
                            </select>
                        </div>
                        <div className="form-group space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Jumlah Zakat (Rp)</label>
                            <CurrencyInput
                                className="input w-full h-10"
                                value={formData.jumlah}
                                onValueChange={(val) => setFormData({ ...formData, jumlah: val })}
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Asal RT</label>
                            <select
                                className="input w-full h-10 font-semibold"
                                value={formData.rt}
                                onChange={e => setFormData({ ...formData, rt: e.target.value })}
                            >
                                {rtList.map(rt => <option key={rt.kode} value={rt.kode}>RT {rt.kode}</option>)}
                            </select>
                        </div>

                        <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
                            <button type="button" className="btn btn-ghost border border-[var(--border-color)]" onClick={() => setFormData({ nama_muzaki: '', kategori: 'Perdagangan', jumlah: '', rt: '01', keterangan: '' })}>
                                BATAL
                            </button>
                            <button type="submit" className="btn btn-primary px-6" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'SIMPAN ZAKAT'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                    <button
                        onClick={() => setActiveTab('riwayat')}
                        style={{
                            padding: '1.25rem 2rem',
                            background: 'none',
                            border: 'none',
                            color: activeTab === 'riwayat' ? 'var(--primary)' : 'var(--text-muted)',
                            borderBottom: activeTab === 'riwayat' ? '3px solid var(--primary)' : '3px solid transparent',
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Riwayat Penerimaan Zakat
                    </button>
                    <button
                        onClick={() => setActiveTab('calculator')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem 2rem',
                            background: 'none',
                            border: 'none',
                            color: activeTab === 'calculator' ? 'var(--warning)' : 'var(--text-muted)',
                            borderBottom: activeTab === 'calculator' ? '3px solid var(--warning)' : '3px solid transparent',
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Coins size={16} /> Kalkulator Zakat
                    </button>
                </div>

                {activeTab === 'calculator' ? (
                    <div style={{ padding: '2rem' }}>
                        <ZakatCalculator />
                    </div>
                ) : (
                    <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                        <table className="table-compact">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>NO</th>
                                    <th>Nama Muzaki</th>
                                    <th>Kategori Harta</th>
                                    <th>RT / Lokasi</th>
                                    <th>Tanggal Trx</th>
                                    <th style={{ textAlign: 'right' }}>Nominal</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {error ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>{error}</td></tr>
                                ) : loading ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="spin" /></td></tr>
                                ) : zakatMallData.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Belum ada data penerimaan zakat.</td></tr>
                                ) : zakatMallData.map((z, index) => (
                                    <tr key={z.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{z.nama_muzaki || 'Hamba Allah'}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="dot" style={{ background: 'var(--warning)' }}></div>
                                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{z.kategori}</span>
                                            </div>
                                        </td>
                                        <td><span style={{
                                            background: 'rgba(0,0,0,0.05)'
                                            , padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.75rem'
                                        }}>RT {z.rt}</span></td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{z.tanggal}</td>
                                        <td style={{ fontWeight: 800, textAlign: 'right' }}>Rp {z.jumlah.toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--primary)' }} onClick={() => handlePrintReceipt(z)} title="Cetak Kuitansi">
                                                    <Printer size={14} />
                                                </button>
                                                <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--warning)' }} onClick={() => handleEdit(z)} title="Edit Data">
                                                    <Pencil size={14} />
                                                </button>
                                                <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => handleDeleteClick(z.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmDeleteModal
                open={deleteModal.open}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, id: null, loading: false })}
                description="Hapus riwayat zakat ini? Data yang dihapus tidak dapat dikembalikan."
                loading={deleteModal.loading}
            />
            {/* Hidden Print Container */}
            <div style={{ position: 'absolute', top: 0, left: -10000, width: '210mm', zIndex: -1000 }}>
                <div ref={printRef}>
                    {printMode === 'receipt' && receiptData ? (
                        <ZakatMallReceipt
                            data={receiptData}
                            signer={{
                                nama: rightSigner?.nama_pejabat || '................',
                                jabatan: rightSigner?.jabatan || 'Bendahara'
                            }}
                        />
                    ) : (
                        <ZakatMallPrint data={zakatMallData} signers={{ left: leftSigner, right: rightSigner }} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZakatMall;
