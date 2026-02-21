import React, { useState, useEffect, useRef } from 'react';
import {
    ShieldCheck,
    Plus,
    TrendingUp,
    Edit2,
    Trash2,
    Loader2,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Banknote,
    Calendar,
    Filter,
    Layers,
    RefreshCw,
    Printer,
    Download,
    Database
} from 'lucide-react';
import * as XLSX from 'xlsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import BeneficiaryList from '../components/BeneficiaryList';
import PrintLayout from '../components/PrintLayout';
import { usePagePrint } from '../hooks/usePagePrint';
import { useSignatureRule } from '../hooks/useSignatureRule';
import {
    fetchSantunanList,
    createSantunan,
    updateSantunanApi,
    deleteSantunanApi,
    fetchSantunanDonations,
    createSantunanDonation,
    deleteSantunanDonation,
    fetchSantunanSummary,
    fetchSantunanActivities,
    fetchBeneficiaries
} from '../services/santunanApi';
import { fetchRTs } from '../services/asnafApi';
import { formatDate } from '../utils/dataUtils';

// Reusable Stat Card
const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <div className={`card stat-hover`} style={{ borderLeft: `4px solid var(--${colorClass})`, padding: '1.25rem' }}>
        <div className="d-flex align-items-center gap-3 mb-2">
            <div style={{ padding: '0.6rem', borderRadius: '10px', background: `rgba(var(--${colorClass}-rgb), 0.1)`, color: `var(--${colorClass})` }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{value}</div>
        {subtitle && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{subtitle}</div>}
    </div>
);

// Module Stat Card (Dynamic Breakdown)
const ModuleCard = ({ title, penerimaan, penyaluran, saldo, detailPenyaluran }) => (
    <div className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>{title}</h4>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
            {/* IN */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}><ArrowUpRight size={14} style={{ display: 'inline', marginRight: '4px' }} /> Masuk</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Rp {penerimaan.toLocaleString()}</span>
            </div>

            {/* OUT */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}><ArrowDownRight size={14} style={{ display: 'inline', marginRight: '4px' }} /> Keluar</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Rp {penyaluran.toLocaleString()}</span>
            </div>

            {/* DETAIL BREAKDOWN (For Santunan) */}
            {detailPenyaluran && (
                <div style={{ background: 'var(--background)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: 'var(--text-muted)' }}>
                        <span>• Yatim/Piatu</span>
                        <span style={{ fontWeight: 600 }}>{detailPenyaluran.yatim ? Number(detailPenyaluran.yatim).toLocaleString() : 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>• Dhuafa</span>
                        <span style={{ fontWeight: 600 }}>{detailPenyaluran.dhuafa ? Number(detailPenyaluran.dhuafa).toLocaleString() : 0}</span>
                    </div>
                </div>
            )}

            {/* SALDO */}
            <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Saldo</span>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: saldo >= 0 ? 'var(--primary)' : 'var(--danger)' }}>Rp {saldo.toLocaleString()}</span>
            </div>
        </div>
    </div>
);

const Santunan = () => {
    // State
    const [loading, setLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(true);

    // Financial Data (Strict Scope: Santunan Only)
    const [santunanStats, setSantunanStats] = useState({ penerimaan: 0, penyaluran: 0, saldo: 0, detail: {} });

    // Table Data
    const [donations, setDonations] = useState([]);
    const [distributions, setDistributions] = useState([]);
    const [activities, setActivities] = useState([]);
    const [beneficiaries, setBeneficiaries] = useState([]); // Master Data for Dropdown
    const [rtList, setRtList] = useState([]);

    // Filters
    const [mainTab, setMainTab] = useState('penerimaan');
    const [viewMode, setViewMode] = useState('keuangan'); // 'keuangan' | 'database'
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
    const [activityFilter, setActivityFilter] = useState(''); // Empty string = all
    const [rtFilter, setRtFilter] = useState('all');

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('donasi');
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        nama_donatur: '', jumlah: '', tanggal: new Date().toISOString().split('T')[0], keterangan: '', activity_id: '', // Donation
        nama_anak: '', rt_id: '', besaran: '', status_penerimaan: 'belum', nama_orang_tua: '', kategori: 'yatim' // Distribution
    });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, type: null, loading: false });

    // Signature Hook
    const { leftSigner, rightSigner } = useSignatureRule('santunan', 'ALL', rtFilter === 'all' ? 'ALL' : rtFilter);

    // Print Hook
    const printRef = useRef(null);
    const handlePrint = usePagePrint(printRef, `Laporan Santunan ${yearFilter}`);

    // Load Summaries (Santunan ONLY)
    const loadSummaries = async () => {
        try {
            setSummaryLoading(true);
            const santunanSum = await fetchSantunanSummary({ tahun: yearFilter, activity_id: activityFilter || undefined });

            // Process Santunan
            const sData = santunanSum.data || {};
            setSantunanStats({
                penerimaan: Number(sData.penerimaan || 0),
                penyaluran: Number(sData.penyaluran?.total || 0),
                saldo: Number(sData.saldo || 0),
                detail: sData.penyaluran || {} // breakdown yatim/dhuafa
            });

        } catch (err) {
            console.error(err);
        } finally {
            setSummaryLoading(false);
        }
    };

    const loadTableData = async () => {
        try {
            setLoading(true);
            const params = { tahun: yearFilter, per_page: 100 };
            if (rtFilter !== 'all') params.rt_id = rtFilter;
            if (activityFilter) params.activity_id = activityFilter;

            if (mainTab === 'penerimaan') {
                const res = await fetchSantunanDonations(params);
                setDonations(res.data || []);
            } else {
                const res = await fetchSantunanList(params);
                setDistributions(res.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRTs().then(res => setRtList(Array.isArray(res) ? res : res.data));
        fetchSantunanActivities().then(res => setActivities(res));
        fetchBeneficiaries({ per_page: 500 }).then(res => setBeneficiaries(res.data)); // Load all for dropdown
    }, []);

    useEffect(() => {
        loadSummaries();
    }, [yearFilter, activityFilter]);

    useEffect(() => {
        loadTableData();
    }, [yearFilter, rtFilter, activityFilter, mainTab]);

    // Handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalType === 'donasi') {
                await createSantunanDonation({
                    nama_donatur: formData.nama_donatur,
                    jumlah: formData.jumlah,
                    tanggal: formData.tanggal,
                    tahun: yearFilter,
                    keterangan: formData.keterangan,
                    activity_id: formData.activity_id || null
                });
            } else {
                const payload = {
                    nama_anak: formData.nama_anak, // Reuse this field for Penerima Name
                    rt_id: formData.rt_id,
                    beneficiary_id: formData.beneficiary_id, // Linked ID
                    besaran: formData.besaran,
                    status_penerimaan: formData.status_penerimaan,
                    tahun: yearFilter,
                    activity_id: formData.activity_id || null,
                    kategori: formData.kategori,
                    nama_orang_tua: formData.nama_orang_tua
                };
                if (editId) await updateSantunanApi(editId, payload);
                else await createSantunan(payload);
            }
            setShowModal(false);
            loadSummaries();
            loadTableData();
        } catch (err) {
            alert('Gagal menyimpan data');
        }
    };

    const openModal = (type, data = null) => {
        setModalType(type);
        setEditId(data?.id || null);
        if (type === 'donasi') {
            setFormData({
                nama_donatur: data?.nama_donatur || '',
                jumlah: data?.jumlah || '',
                tanggal: data?.tanggal || new Date().toISOString().split('T')[0],
                keterangan: data?.keterangan || '',
                activity_id: data?.activity_id || activityFilter || ''
            });
        } else {
            console.log(data);
            setFormData({
                nama_anak: data?.nama_anak || '',
                rt_id: data?.rt_id || rtList[0]?.id,
                besaran: data?.besaran || '',
                status_penerimaan: data?.status_penerimaan || 'belum',
                activity_id: data?.activity_id || activityFilter || '',
                kategori: data?.kategori || 'yatim',
                nama_orang_tua: data?.nama_orang_tua || ''
            });
        }
        setShowModal(true);
    }

    // Toolbar Handlers
    const handleRefresh = () => {
        loadSummaries();
        loadTableData();
    };

    const handleExport = () => {
        // Prepare data based on active tab
        const dataToExport = mainTab === 'penerimaan' ? donations : distributions;
        const fileName = mainTab === 'penerimaan' ? `Penerimaan_Santunan_${yearFilter}` : `Penyaluran_Santunan_${yearFilter}`;

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    return (
        <div className="santunan-dashboard animate-fade-in no-print">
            {/* 1. Global Summary & Toolbar */}
            <div className="d-flex align-items-center justify-content-between mb-4 no-print">
                <div>
                    <h2 style={{ fontWeight: 800, margin: 0 }}>Manajemen Santunan</h2>
                    <p className="text-muted">Aktivitas Santunan, Donasi, dan Database Penerima</p>
                </div>

                {/* Modern Toolbar */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Signature Status Preview */}
                    <div className="d-none d-md-flex align-items-center gap-2 small px-3 py-2 rounded-pill border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', height: '42px' }}>
                        <ShieldCheck size={14} className={leftSigner ? "text-success" : "text-muted"} />
                        <span style={{ color: 'var(--text-muted)' }}>TTD:</span>
                        {leftSigner || rightSigner ? (
                            <strong style={{ color: 'var(--text-main)' }}>
                                {leftSigner?.nama_pejabat?.split(' ')[0] || '?'} & {rightSigner?.nama_pejabat?.split(' ')[0] || '?'}
                            </strong>
                        ) : (
                            <span className="text-danger fst-italic">Belum diset</span>
                        )}
                    </div>
                    {/* View Mode Toggle */}
                    <div style={{ display: 'flex', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', marginRight: '1rem', background: 'var(--background)' }}>
                        <button
                            onClick={() => setViewMode('keuangan')}
                            style={{
                                padding: '0 1rem', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px',
                                background: viewMode === 'keuangan' ? 'var(--card-bg)' : 'transparent',
                                color: viewMode === 'keuangan' ? 'var(--primary)' : 'var(--text-muted)',
                                boxShadow: viewMode === 'keuangan' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            <Wallet size={16} /> Keuangan
                        </button>
                        <button
                            onClick={() => setViewMode('database')}
                            style={{
                                padding: '0 1rem', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px',
                                background: viewMode === 'database' ? 'var(--card-bg)' : 'transparent',
                                color: viewMode === 'database' ? 'var(--info)' : 'var(--text-muted)',
                                boxShadow: viewMode === 'database' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            <Database size={16} /> Database Master
                        </button>
                    </div>

                    {/* Year Selector (Only for Keuangan) */}
                    {viewMode === 'keuangan' && (
                        <select
                            className="input"
                            style={{ height: '42px', fontWeight: 600, minWidth: '100px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                            value={yearFilter}
                            onChange={e => setYearFilter(e.target.value)}
                        >
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    )}

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        className="btn btn-ghost"
                        style={{ height: '42px', width: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', color: 'var(--text-muted)', background: 'var(--card-bg)' }}
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} className={loading || summaryLoading ? 'spin' : ''} />
                    </button>

                    {/* Print Button */}
                    <button
                        onClick={handlePrint}
                        className="btn btn-ghost"
                        style={{ height: '42px', width: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', color: 'var(--text-muted)', background: 'var(--card-bg)' }}
                        title="Print Dashboard"
                    >
                        <Printer size={18} />
                    </button>

                    {/* Download Button (Only for Keuangan) */}
                    {viewMode === 'keuangan' && (
                        <button
                            onClick={handleExport}
                            className="btn btn-primary"
                            style={{ height: '42px', width: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Export to Excel"
                        >
                            <Download size={18} />
                        </button>
                    )}
                </div>
            </div>

            {
                viewMode === 'keuangan' ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }} className="no-print">
                            <StatCard
                                title="Santunan Masuk (Dana)"
                                value={`Rp ${santunanStats.penerimaan.toLocaleString()}`}
                                icon={Wallet}
                                colorClass="success"
                                subtitle="Total Donasi Santunan"
                            />
                            <StatCard
                                title="Santunan Keluar (Penyaluran)"
                                value={`Rp ${santunanStats.penyaluran.toLocaleString()}`}
                                icon={TrendingUp}
                                colorClass="danger"
                                subtitle="Total Penyaluran Santunan"
                            />
                            <StatCard
                                title="Saldo Santunan"
                                value={`Rp ${santunanStats.saldo.toLocaleString()}`}
                                icon={Banknote}
                                colorClass="primary"
                                subtitle="Sisa Dana Tersedia"
                            />
                        </div>

                        {/* 3. Accountability Table (Santunan Focus) */}
                        <div className="card print-wrapper" style={{ border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
                            <div className="no-print" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                {/* Activity Filter (Crucial) */}
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)' }}>
                                        <Layers size={16} className="text-muted" />
                                        <select
                                            value={activityFilter}
                                            onChange={(e) => setActivityFilter(e.target.value)}
                                            style={{ border: 'none', fontWeight: 700, outline: 'none', fontSize: '0.9rem', color: 'var(--text-main)', minWidth: '150px', background: 'transparent' }}
                                        >
                                            <option value="">Semua Kegiatan</option>
                                            {activities.map(act => <option key={act.id} value={act.id}>{act.nama_kegiatan}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div style={{ display: 'flex', gap: '0.5rem', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background)' }}>
                                    <button
                                        onClick={() => setMainTab('penerimaan')}
                                        style={{
                                            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.85rem',
                                            background: mainTab === 'penerimaan' ? 'var(--primary-light)' : 'transparent',
                                            color: mainTab === 'penerimaan' ? 'var(--primary)' : 'var(--text-muted)',
                                        }}
                                    >
                                        Dana Masuk
                                    </button>
                                    <button
                                        onClick={() => setMainTab('penyaluran')}
                                        style={{
                                            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.85rem',
                                            background: mainTab === 'penyaluran' ? 'var(--danger-light)' : 'transparent',
                                            color: mainTab === 'penyaluran' ? 'var(--danger)' : 'var(--text-muted)',
                                        }}
                                    >
                                        Penyaluran
                                    </button>
                                </div>

                                <button className="btn btn-primary" onClick={() => openModal(mainTab === 'penerimaan' ? 'donasi' : 'distribusi')} style={{ fontWeight: 700 }}>
                                    <Plus size={16} className="me-2" />
                                    Input {mainTab === 'penerimaan' ? 'Donasi' : 'Penyaluran'}
                                </button>
                            </div>

                            {/* Table Content */}
                            <div style={{ padding: 0 }}>
                                {mainTab === 'penerimaan' ? (
                                    <table className="table-compact" style={{ width: '100%' }}>
                                        <thead style={{ fontSize: '0.75rem', textTransform: 'uppercase', background: 'var(--background)' }}>
                                            <tr>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Donatur / Sumber</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Kegiatan</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Tanggal</th>
                                                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Jumlah</th>
                                                <th style={{ padding: '1rem', width: '50px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {donations.map(d => (
                                                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{d.nama_donatur}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                                        {activities.find(a => a.id === d.activity_id)?.nama_kegiatan || '-'}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>{formatDate(d.tanggal)}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                                                        Rp {Number(d.jumlah).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button className="btn-icon" onClick={() => openModal('donasi', d)}><Edit2 size={16} /></button>
                                                            <button className="btn-icon danger" onClick={() => { setDeleteModal({ open: true, id: d.id, type: 'donasi' }) }}><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <table className="table-compact" style={{ width: '100%' }}>
                                        <thead style={{ background: 'var(--background)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                            <tr>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Nama Penerima</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Kategori</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Kegiatan</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>RT</th>
                                                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Besaran</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                                                <th style={{ padding: '1rem', width: '80px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {distributions.map(d => (
                                                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{d.nama_anak}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span className={`badge ${d.kategori === 'yatim' ? 'badge-primary' : 'badge-warning'}`}>
                                                            {d.kategori?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                                        {activities.find(a => a.id === d.activity_id)?.nama_kegiatan || '-'}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>RT {d.rt?.kode || '-'}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                                                        Rp {Number(d.besaran).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            fontWeight: 700,
                                                            color: d.status_penerimaan === 'sudah' ? 'var(--success)' : '#cbd5e1',
                                                            textTransform: 'uppercase',
                                                            fontSize: '0.75rem',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            {d.status_penerimaan === 'sudah' ? 'Sudah Diserahkan' : 'Belum'}
                                                        </span>
                                                    </td>
                                                    <td style={{ display: 'flex', gap: '0.5rem', padding: '1rem' }}>
                                                        <button className="btn-icon" onClick={() => openModal('distribusi', d)}><Edit2 size={16} /></button>
                                                        <button className="btn-icon danger" onClick={() => { setDeleteModal({ open: true, id: d.id, type: 'distribusi' }) }}><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                        </div>
                    </>
                ) : (
                    <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', height: 'calc(100vh - 200px)' }}>
                        {/* Left Column: Yatim */}
                        <BeneficiaryList
                            type="yatim"
                            title="Database Anak Yatim / Piatu"
                            colorClass="primary"
                        />

                        {/* Right Column: Dhuafa */}
                        <BeneficiaryList
                            type="dhuafa"
                            title="Database Dhuafa Prioritas"
                            colorClass="warning"
                        />
                    </div>
                )
            }

            {/* Hidden Print Content */}
            <div className="print-only">
                <div ref={printRef}>
                    <PrintLayout
                        title={mainTab === 'penerimaan' ? 'Laporan Penerimaan Santunan' : 'Laporan Penyaluran Santunan'}
                        subtitle={`Tahun ${yearFilter} ${rtFilter !== 'all' ? `• RT ${rtFilter}` : ''} ${activityFilter !== '' ? `• Kegiatan: ${activities.find(a => a.id == activityFilter)?.nama_kegiatan || '-'}` : ''}`}
                        signer={{ left: leftSigner, right: rightSigner }}
                    >
                        {mainTab === 'penerimaan' ? (
                            <table className="table-print-boxed">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>No</th>
                                        <th>Donatur / Sumber</th>
                                        <th>Kegiatan</th>
                                        <th style={{ width: '120px' }}>Tanggal</th>
                                        <th style={{ width: '150px', textAlign: 'right' }}>Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations.map((d, idx) => (
                                        <tr key={d.id}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td>{d.nama_donatur}</td>
                                            <td>{activities.find(a => a.id === d.activity_id)?.nama_kegiatan || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>{formatDate(d.tanggal)}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Rp {Number(d.jumlah).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ background: '#eee', fontWeight: 'bold' }}>
                                        <td colSpan="4" style={{ textAlign: 'center' }}>TOTAL PENERIMAAN</td>
                                        <td style={{ textAlign: 'right' }}>Rp {donations.reduce((a, b) => a + Number(b.jumlah), 0).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        ) : (
                            <table className="table-print-boxed">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>No</th>
                                        <th>Nama Penerima</th>
                                        <th style={{ width: '100px' }}>Kategori</th>
                                        <th style={{ width: '80px' }}>RT</th>
                                        <th>Kegiatan</th>
                                        <th style={{ width: '150px', textAlign: 'right' }}>Besaran</th>
                                        <th style={{ width: '100px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {distributions.map((d, idx) => (
                                        <tr key={d.id}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td>{d.nama_anak}</td>
                                            <td style={{ textAlign: 'center', textTransform: 'capitalize' }}>{d.kategori}</td>
                                            <td style={{ textAlign: 'center' }}>{d.rt?.kode || '-'}</td>
                                            <td>{activities.find(a => a.id === d.activity_id)?.nama_kegiatan || '-'}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Rp {Number(d.besaran).toLocaleString()}</td>
                                            <td style={{ textAlign: 'center' }}>{d.status_penerimaan === 'sudah' ? 'Diserahkan' : 'Belum'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ background: '#eee', fontWeight: 'bold' }}>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>TOTAL PENYALURAN</td>
                                        <td style={{ textAlign: 'right' }}>Rp {distributions.reduce((a, b) => a + Number(b.besaran), 0).toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}

                        <div className="signature-grid">
                            <div className="signature-item">
                                <div className="signature-title">{leftSigner?.jabatan || 'Ketua Baitulmal'}</div>
                                <div className="signature-name">{leftSigner?.nama_pejabat || '...................'}</div>
                                {leftSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP: {leftSigner.nip}</div>}
                            </div>
                            <div className="signature-item">
                                <div className="signature-title">{rightSigner?.jabatan || 'Bendahara'}</div>
                                <div className="signature-name">{rightSigner?.nama_pejabat || '...................'}</div>
                                {rightSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP: {rightSigner.nip}</div>}
                            </div>
                        </div>
                    </PrintLayout>
                </div>
            </div>

            {/* Input Modal */}
            {
                showModal && (
                    <div className="pd-overlay" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="card animate-scale-in" style={{ width: '500px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto', background: 'var(--card-bg)' }}>
                            <h3 className="mb-4 font-bold text-lg" style={{ color: 'var(--text-main)' }}>{modalType === 'donasi' ? 'Input Donasi Santunan' : 'Input Penyaluran'}</h3>
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>

                                {/* Common Field: Activity */}
                                <div className="form-group">
                                    <label>Kegiatan Santunan</label>
                                    <select className="input w-full" value={formData.activity_id} onChange={e => setFormData({ ...formData, activity_id: e.target.value })}>
                                        <option value="">-- Pilih Kegiatan (Opsional) --</option>
                                        {activities.map(a => <option key={a.id} value={a.id}>{a.nama_kegiatan}</option>)}
                                    </select>
                                </div>

                                {modalType === 'donasi' ? (
                                    <>
                                        <div className="form-group"><label>Nama Donatur</label><input required className="input" value={formData.nama_donatur} onChange={e => setFormData({ ...formData, nama_donatur: e.target.value })} /></div>
                                        <div className="form-group"><label>Jumlah (Rp)</label><input type="number" required className="input" value={formData.jumlah} onChange={e => setFormData({ ...formData, jumlah: e.target.value })} /></div>
                                        <div className="form-group"><label>Tanggal</label><input type="date" required className="input" value={formData.tanggal} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} /></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group"><label>Kategori Penerima</label>
                                            <select
                                                className="input"
                                                value={formData.kategori}
                                                onChange={e => {
                                                    // Reset beneficiary when category changes
                                                    setFormData({ ...formData, kategori: e.target.value, beneficiary_id: '', nama_anak: '', rt_id: '' });
                                                }}
                                            >
                                                <option value="yatim">Anak Yatim / Piatu</option>
                                                <option value="dhuafa">Kaum Dhuafa</option>
                                            </select>
                                        </div>

                                        {/* Beneficiary Selector */}
                                        <div className="form-group">
                                            <label>Nama Penerima (Dari Database)</label>
                                            <select
                                                required
                                                className="input"
                                                value={formData.beneficiary_id || ''}
                                                onChange={e => {
                                                    const selectedId = e.target.value;
                                                    const selectedBen = beneficiaries.find(b => b.id == selectedId);
                                                    if (selectedBen) {
                                                        setFormData({
                                                            ...formData,
                                                            beneficiary_id: selectedId,
                                                            nama_anak: selectedBen.nama_lengkap, // Auto-fill name
                                                            rt_id: selectedBen.rt_id // Auto-fill RT
                                                        });
                                                    } else {
                                                        setFormData({ ...formData, beneficiary_id: '', nama_anak: '', rt_id: '' });
                                                    }
                                                }}
                                            >
                                                <option value="">-- Pilih Penerima --</option>
                                                {beneficiaries
                                                    .filter(b => b.jenis === formData.kategori && b.is_active) // Filter by active & category
                                                    .map(b => (
                                                        <option key={b.id} value={b.id}>
                                                            {b.nama_lengkap} (RT {b.rt?.kode})
                                                        </option>
                                                    ))}
                                            </select>
                                            <small className="text-muted d-block mt-1">Hanya menampilkan data aktif.</small>
                                        </div>

                                        <div className="form-group"><label>Wilayah RT</label>
                                            <select disabled className="input" style={{ background: 'var(--input-bg)', opacity: 0.7 }} value={formData.rt_id} onChange={e => setFormData({ ...formData, rt_id: e.target.value })}>
                                                {rtList.map(r => <option key={r.id} value={r.id}>RT {r.kode}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group"><label>Besaran (Rp)</label><input type="number" required className="input" value={formData.besaran} onChange={e => setFormData({ ...formData, besaran: e.target.value })} /></div>
                                        <div className="form-group"><label>Status Penyerahan</label>
                                            <select className="input" value={formData.status_penerimaan} onChange={e => setFormData({ ...formData, status_penerimaan: e.target.value })}>
                                                <option value="sudah">Sudah Diserahkan</option>
                                                <option value="belum">Belum Diserahkan</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" className="btn btn-outline-danger" style={{ flex: 1 }} onClick={() => setShowModal(false)}>BATAL</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }}>SIMPAN DATA</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            <ConfirmDeleteModal
                open={deleteModal.open}
                onConfirm={async () => {
                    if (deleteModal.type === 'donasi') await deleteSantunanDonation(deleteModal.id);
                    else await deleteSantunanApi(deleteModal.id);
                    setDeleteModal({ open: false, id: null, type: null });
                    loadSummaries(); loadTableData();
                }}
                onCancel={() => setDeleteModal({ open: false, id: null, type: null })}
            />
        </div >
    );
};

export default Santunan;
