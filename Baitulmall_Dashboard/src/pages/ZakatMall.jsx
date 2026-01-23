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
    Trash2
} from 'lucide-react';
import { fetchZakatMallList, createZakatMall, deleteZakatMallApi } from '../services/zakatMallApi';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { fetchRTs } from '../services/asnafApi';
import PrintLayout from '../components/PrintLayout';
import { usePagePrint } from '../hooks/usePagePrint';
import { fetchSettings } from '../services/settingApi';

const ZakatMallPrint = ({ data, defaultKetua, defaultBendahara }) => (
    <PrintLayout title="Laporan Zakat Mall (Harta/Profesi)">
        <table className="table-print-boxed">
            <thead>
                <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>No</th>
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

const ZakatMall = () => {
    // Print State
    const printRef = useRef(null);
    const handlePrint = usePagePrint(printRef, 'Laporan Zakat Mall');
    // API and State
    const [zakatMallData, setZakatMallData] = useState([]);
    const [rtList, setRtList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ kategori: 'Perdagangan', jumlah: '', rt: '01', keterangan: '' });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, loading: false });
    const [activeTab, setActiveTab] = useState('riwayat');
    const [settingsList, setSettingsList] = useState([]);

    const getSetting = (key, fallback) => {
        const s = settingsList.find(item => item.key_name === key);
        return s ? s.value : fallback;
    };

    const defaultKetua = getSetting('default_signer_ketua', '................');
    const defaultBendahara = getSetting('default_signer_bendahara', '................');

    // Fetch Data
    React.useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [zmResponse, rtResponse, settingsRes] = await Promise.all([
                    fetchZakatMallList({ per_page: 500 }),
                    fetchRTs(),
                    fetchSettings()
                ]);

                if (settingsRes.success) {
                    setSettingsList(settingsRes.data);
                }


                // Transform API data to match UI
                const transformed = zmResponse.data.map(item => ({
                    id: item.id,
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
                kategori: formData.kategori,
                jumlah: Number(formData.jumlah),
                tanggal: new Date().toISOString().split('T')[0],
                keterangan: formData.keterangan || ''
            };

            const response = await createZakatMall(payload);
            const newItem = {
                id: response.data.id,
                kategori: response.data.kategori,
                jumlah: Number(response.data.jumlah),
                rt: response.data.rt?.kode,
                tanggal: response.data.tanggal
            };

            setZakatMallData(prev => [newItem, ...prev]);
            setShowModal(false);
            setFormData({ kategori: 'Perdagangan', jumlah: '', rt: '01', keterangan: '' });
            alert('Alhamdulillah, Zakat berhasil dicatat!');
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan data.');
        }
    };

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
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--warning)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Zakat Mall</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>Rp {totalZakatMall.toLocaleString()}</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Zakat Perdagangan</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>Rp {(byCategory['Perdagangan'] || 0).toLocaleString()}</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--success)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Zakat Profesi</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>Rp {(byCategory['Profesi / Gaji'] || 0).toLocaleString()}</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--info)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Transaksi</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--info)' }}>{zakatMallData.length} Tx</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignContent: 'start' }}>
                        <button className="btn" style={{ border: '1px solid var(--card-border)', background: '#fff' }}>2026</button>
                        <button className="btn" onClick={handlePrint} disabled={loading} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff', border: '1px solid var(--card-border)' }}>
                            <Loader2 size={16} style={{ display: loading ? 'block' : 'none' }} className="spin" />
                            <Briefcase size={16} style={{ display: loading ? 'none' : 'block' }} /> Print
                        </button>
                        <button className="btn" style={{ border: '1px solid var(--card-border)', background: '#fff' }}>Excel</button>
                    </div>
                </div>

                {/* Inline Form - Always Visible */}
                <div className="card" style={{ padding: '1.5rem', background: '#e9ecef', marginBottom: '1.5rem', border: 'none' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1.5fr 1fr', gap: '1rem', alignItems: 'end' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Kategori Harta</label>
                            <select
                                className="form-control"
                                value={formData.kategori}
                                onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                                style={{ background: '#fff' }}
                            >
                                <option value="Perdagangan">Perdagangan</option>
                                <option value="Profesi / Gaji">Profesi / Gaji</option>
                                <option value="Hasil Usaha">Hasil Usaha</option>
                                <option value="Tabungan / Simpanan">Tabungan / Simpanan</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Jumlah Zakat (Rp)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.jumlah}
                                onChange={e => setFormData({ ...formData, jumlah: e.target.value })}
                                placeholder="0"
                                required
                                style={{ background: '#fff' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Asal RT</label>
                            <select
                                className="form-control"
                                value={formData.rt}
                                onChange={e => setFormData({ ...formData, rt: e.target.value })}
                                style={{ background: '#fff' }}
                            >
                                {rtList.map(rt => <option key={rt.kode} value={rt.kode}>RT {rt.kode}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Simpan</button>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <button type="button" className="btn btn-ghost" style={{ width: '100%', background: '#fff', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={() => setFormData({ kategori: 'Perdagangan', jumlah: '', rt: '01', keterangan: '' })}>Batal</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <button
                        onClick={() => setActiveTab('riwayat')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'none',
                            border: 'none',
                            color: activeTab === 'riwayat' ? 'var(--primary)' : 'var(--text-muted)',
                            borderBottom: activeTab === 'riwayat' ? '2px solid var(--primary)' : 'none',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Riwayat Penerimaan
                    </button>
                </div>

                <div className="table-container">
                    <table className="table-compact">
                        <thead>
                            <tr>
                                <th>Kategori</th>
                                <th>Nominal</th>
                                <th>RT / Lokasi</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {error ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>{error}</td></tr>
                            ) : loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="spin" /></td></tr>
                            ) : zakatMallData.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Belum ada data penerimaan zakat.</td></tr>
                            ) : zakatMallData.map(z => (
                                <tr key={z.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Briefcase size={16} className="text-warning" />
                                            {z.kategori}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>Rp {z.jumlah.toLocaleString()}</td>
                                    <td>RT {z.rt}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{z.tanggal}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--danger)' }} onClick={() => handleDeleteClick(z.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                    <ZakatMallPrint data={zakatMallData} defaultKetua={defaultKetua} defaultBendahara={defaultBendahara} />
                </div>
            </div>
        </div>
    );
};

export default ZakatMall;
