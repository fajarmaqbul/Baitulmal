import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Plus,
    TrendingUp,
    Users,
    ChevronRight,
    History,
    AlertCircle,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Info,
    Wallet
} from 'lucide-react';
import {
    fetchZakatProduktif,
    fetchZakatProduktifSummary,
    createZakatProduktif,
    updateZakatProduktif,
    createMonitoringProject
} from '../services/zakatProduktifService';
import { fetchBeneficiaries } from '../services/santunanApi';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const ZakatProduktif = () => {
    const [projects, setProjects] = useState([]);
    const [summary, setSummary] = useState(null);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showMonitoringModal, setShowMonitoringModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [formData, setFormData] = useState({
        asnaf_id: '',
        nama_usaha: '',
        modal_awal: '',
        tanggal_mulai: new Date().toISOString().split('T')[0],
        keterangan: '',
        status: 'aktif'
    });
    const [monitorData, setMonitorData] = useState({
        tanggal_laporan: new Date().toISOString().split('T')[0],
        omzet: '',
        laba: '',
        catatan: ''
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [projRes, summRes, benRes] = await Promise.all([
                fetchZakatProduktif(),
                fetchZakatProduktifSummary(),
                fetchBeneficiaries({ per_page: 500 })
            ]);
            setProjects(projRes.data || []);
            setSummary(summRes);
            setBeneficiaries(benRes.data || []);
        } catch (err) {
            console.error('Failed to load Zakat Produktif data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createZakatProduktif(formData);
            setShowModal(false);
            loadData();
        } catch (err) {
            alert('Gagal menyimpan proyek');
        }
    };

    const handleMonitorSubmit = async (e) => {
        e.preventDefault();
        try {
            await createMonitoringProject(selectedProject.id, monitorData);
            setShowMonitoringModal(false);
            loadData();
        } catch (err) {
            alert('Gagal menambah laporan monitoring');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'mandiri': return <span className="badge badge-success px-3 py-2 rounded-pill">MANDIRI</span>;
            case 'gagal': return <span className="badge badge-danger px-3 py-2 rounded-pill">GAGAL</span>;
            default: return <span className="badge badge-primary px-3 py-2 rounded-pill">AKTIF</span>;
        }
    };

    if (loading && projects.length === 0) return <div className="p-5 text-center"><Info size={40} className="text-muted spin mb-3" /> <p>Memuat Data Zakat Produktif...</p></div>;

    return (
        <div className="container-fluid py-4" style={{ background: 'var(--background)', minHeight: '100vh', color: 'var(--text-main)' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-black mb-1 d-flex align-items-center gap-2">
                        <Briefcase size={28} className="text-primary" />
                        Zakat Mal Produktif
                    </h2>
                    <p className="text-muted small mb-0">Manajemen permodalan dan kemandirian ekonomi Mustahik</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" onClick={() => setShowModal(true)}>
                    <Plus size={20} strokeWidth={3} />
                    PROYEK BARU
                </button>
            </div>

            {/* Stats Summary */}
            {summary && (
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm p-3 h-100" style={{ background: 'var(--card-bg)', borderRadius: '16px' }}>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="text-muted small fw-bold mb-1">TOTAL ZAKAT MAL</p>
                                    <h3 className="fw-black mb-0">Rp {summary.total_z_mal?.toLocaleString() ?? summary.total_zakat_mal?.toLocaleString()}</h3>
                                    <p className="small text-primary mb-0 mt-1">Sumber Dana Utama</p>
                                </div>
                                <div className="p-3 rounded-circle" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                                    <Wallet size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm p-3 h-100" style={{ background: 'var(--card-bg)', borderRadius: '16px' }}>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="text-muted small fw-bold mb-1">MODAL TERSALURKAN</p>
                                    <h3 className="fw-black mb-0">Rp {summary.total_modal_disalurkan.toLocaleString()}</h3>
                                    <p className="small text-muted mb-0 mt-1">{summary.proyek_aktif} Proyek Aktif</p>
                                </div>
                                <div className="p-3 rounded-circle text-warning" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                                    <Briefcase size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm p-3 h-100" style={{ background: 'var(--card-bg)', borderRadius: '16px' }}>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="text-muted small fw-bold mb-1">SALDO TERSEDIA</p>
                                    <h3 className="fw-black mb-0 text-success">Rp {summary.saldo_tersedia?.toLocaleString()}</h3>
                                    <p className="small text-success mb-0 mt-1">Siap Disalurkan</p>
                                </div>
                                <div className="p-3 rounded-circle text-success" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm p-3 h-100" style={{ background: 'var(--card-bg)', borderRadius: '16px' }}>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="text-muted small fw-bold mb-1">MUSTAHIK MANDIRI</p>
                                    <h3 className="fw-black mb-0">{summary.mustahik_mandiri} Jiwa</h3>
                                    <p className="small text-muted mb-0 mt-1">Target Keberhasilan</p>
                                </div>
                                <div className="p-3 rounded-circle text-info" style={{ background: 'rgba(var(--info-rgb), 0.1)', color: 'var(--info)' }}>
                                    <Users size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Project List */}
            <div className="card border-0 shadow-sm overflow-hidden" style={{ background: 'var(--card-bg)', borderRadius: '16px' }}>
                <div className="card-header bg-transparent border-0 p-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text border-0 bg-light" style={{ borderRadius: '10px 0 0 10px' }}><Search size={18} /></span>
                                <input type="text" className="form-control border-0 bg-light py-2" placeholder="Cari nama atau usaha..." style={{ borderRadius: '0 10px 10px 0' }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="text-muted small letter-spacing-1" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th className="px-4 py-3">PENERIMA MANFAAT</th>
                                <th className="py-3">NAMA USAHA</th>
                                <th className="py-3">MODAL AWAL</th>
                                <th className="py-3 text-success">LABA KUMULATIF</th>
                                <th className="py-3">STATUS</th>
                                <th className="py-3 px-4 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="p-2 rounded bg-primary-soft text-primary fw-bold" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {p.asnaf?.nama?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-bold">{p.asnaf?.nama}</div>
                                                <div className="small text-muted">RT {p.asnaf?.rt?.kode}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-bold">{p.nama_usaha}</div>
                                        <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>{p.keterangan || '-'}</div>
                                    </td>
                                    <td className="fw-bold">Rp {p.modal_awal.toLocaleString()}</td>
                                    <td>
                                        <div className="fw-bold text-success">Rp {(p.monitoring_sum_laba || 0).toLocaleString()}</div>
                                        <div className="small text-muted" style={{ fontSize: '0.7rem' }}>
                                            ROI: {p.modal_awal > 0 ? ((p.monitoring_sum_laba / p.modal_awal) * 100).toFixed(1) : 0}%
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(p.status)}</td>
                                    <td className="px-4 text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1" onClick={() => { setSelectedProject(p); setShowMonitoringModal(true); }}>
                                                <History size={14} /> MONITOR
                                            </button>
                                            <button className="btn btn-light-soft btn-sm px-2">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center p-5 text-muted">Belum ada proyek produktif terdaftar.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah Proyek */}
            {showModal && (
                <div className="pd-overlay fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.5)' }}>
                    <div className="card shadow-lg border-0 animate-scale-in" style={{ width: '550px', borderRadius: '24px', background: 'var(--card-bg)' }}>
                        <div className="p-4">
                            <h4 className="fw-black mb-4">Input Proyek Produktif Baru</h4>
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="small fw-bold mb-1 opacity-70">Penerima Manfaat (Asnaf)</label>
                                        <select className="form-control rounded-pill bg-light border-0 py-2 px-3" required value={formData.asnaf_id} onChange={e => setFormData({ ...formData, asnaf_id: e.target.value })}>
                                            <option value="">-- Pilih Penerima --</option>
                                            {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.nama_lengkap} ({b.jenis.toUpperCase()})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="small fw-bold mb-1 opacity-70">Nama Usaha</label>
                                        <input type="text" className="form-control rounded-pill bg-light border-0 py-2 px-3" placeholder="Contoh: Kedai Kelontong Berkah" required value={formData.nama_usaha} onChange={e => setFormData({ ...formData, nama_usaha: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold mb-1 opacity-70">Modal Awal (Rp)</label>
                                        <input type="number" className="form-control rounded-pill bg-light border-0 py-2 px-3" placeholder="0" required value={formData.modal_awal} onChange={e => setFormData({ ...formData, modal_awal: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold mb-1 opacity-70">Tanggal Mulai</label>
                                        <input type="date" className="form-control rounded-pill bg-light border-0 py-2 px-3" required value={formData.tanggal_mulai} onChange={e => setFormData({ ...formData, tanggal_mulai: e.target.value })} />
                                    </div>
                                    <div className="col-12">
                                        <label className="small fw-bold mb-1 opacity-70">Keterangan / Rencana Proyek</label>
                                        <textarea className="form-control bg-light border-0 py-2 px-3" rows="3" style={{ borderRadius: '15px' }} value={formData.keterangan} onChange={e => setFormData({ ...formData, keterangan: e.target.value })}></textarea>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button type="button" className="btn btn-light rounded-pill flex-1 py-2 fw-bold" onClick={() => setShowModal(false)}>BATAL</button>
                                    <button type="submit" className="btn btn-primary rounded-pill flex-1 py-2 fw-black shadow-primary">SIMPAN PROYEK</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Monitoring */}
            {showMonitoringModal && selectedProject && (
                <div className="pd-overlay fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.5)' }}>
                    <div className="card shadow-lg border-0 animate-scale-in" style={{ width: '500px', borderRadius: '24px', background: 'var(--card-bg)' }}>
                        <div className="p-4">
                            <h4 className="fw-black mb-1">Laporan Monitoring</h4>
                            <p className="small text-muted mb-4">{selectedProject.nama_usaha} - {selectedProject.asnaf?.nama}</p>

                            <form onSubmit={handleMonitorSubmit}>
                                <div className="row g-3 text-start">
                                    <div className="col-12">
                                        <label className="small fw-bold mb-1 opacity-70">Tanggal Laporan</label>
                                        <input type="date" className="form-control rounded-pill bg-light border-0" required value={monitorData.tanggal_laporan} onChange={e => setMonitorData({ ...monitorData, tanggal_laporan: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold mb-1 opacity-70">Omzet (Rp)</label>
                                        <input type="number" className="form-control rounded-pill bg-light border-0" placeholder="0" required value={monitorData.omzet} onChange={e => setMonitorData({ ...monitorData, omzet: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold mb-1 opacity-70">Laba Bersih (Rp)</label>
                                        <input type="number" className="form-control rounded-pill bg-light border-0" placeholder="0" required value={monitorData.laba} onChange={e => setMonitorData({ ...monitorData, laba: e.target.value })} />
                                    </div>
                                    <div className="col-12">
                                        <label className="small fw-bold mb-1 opacity-70">Catatan Monitoring</label>
                                        <textarea className="form-control bg-light border-0" rows="3" style={{ borderRadius: '15px' }} placeholder="Masukkan perkembangan usaha..." value={monitorData.catatan} onChange={e => setMonitorData({ ...monitorData, catatan: e.target.value })}></textarea>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button type="button" className="btn btn-light rounded-pill flex-1 py-2" onClick={() => setShowMonitoringModal(false)}>BATAL</button>
                                    <button type="submit" className="btn btn-warning rounded-pill flex-1 py-2 fw-black text-white">SIMPAN LAPORAN</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .btn-light-soft { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--border-color); }
                .bg-primary-soft { background: rgba(var(--primary-rgb), 0.1); }
                .letter-spacing-1 { letter-spacing: 1px; }
                .shadow-primary { box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3); }
                .fw-black { font-weight: 900; }
                .pd-overlay { backdrop-filter: blur(8px); }
            `}</style>
        </div>
    );
};

export default ZakatProduktif;
