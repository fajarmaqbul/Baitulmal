import React, { useState, useEffect, useRef } from 'react';
import { fetchZakatFitrahList, fetchMuzakiStats, createZakatFitrah, updateZakatFitrah, deleteZakatFitrahApi } from '../services/zakatFitrahApi';
import { fetchActiveSigner } from '../services/documentApi'; // Removed but keeping line for safe deletion if needed or just empty

import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import PrintLayout from '../components/PrintLayout';
import OfficialDocumentTemplate from '../components/Print/OfficialDocumentTemplate';
import { usePagePrint } from '../hooks/usePagePrint';
import { useSignatureRule } from '../hooks/useSignatureRule';
import {
    Plus,
    Filter,
    Users,
    ChevronRight,
    Download,
    Printer,
    CheckCircle,
    Circle,
    Edit2,
    Trash2,
    Loader2,
    Save,
    Info,
    RefreshCw,
    TrendingUp,
    Lock,
    Unlock,
    Heart,
    ExternalLink,
    Shield,
    Search
} from 'lucide-react';
import { exportToExcel } from '../utils/dataUtils';
import { fetchAsnafList, fetchRTs } from '../services/asnafApi';
import { fetchSettings, updateSetting, createSetting } from '../services/settingApi';

const ZakatFitrah = () => {

    // ... (other state)
    const [muzakiList, setMuzakiList] = useState([]);
    const [asnafList, setAsnafList] = useState([]);
    const [rtList, setRtList] = useState([]);
    const [stats, setStats] = useState(null); // object → null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // error state
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, loading: false });
    const [confirmDistModal, setConfirmDistModal] = useState({ open: false, loading: false });
    const [receiptModal, setReceiptModal] = useState({ open: false, data: null });

    const [activeTab, setActiveTab] = useState('muzaki');
    const [selectedRt, setSelectedRt] = useState('01');
    const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear().toString());
    const [distribusiScope, setDistribusiScope] = useState('warga');
    const [distribusiKategori, setDistribusiKategori] = useState('Fakir');
    const [distribusiStatus, setDistribusiStatus] = useState({});
    const [zakatDistribution, setZakatDistribution] = useState([]); // list → []
    const [strukturInti, setStrukturInti] = useState(null); // object → null
    const [isLocked, setIsLocked] = useState(false);
    const [settingsList, setSettingsList] = useState([]);

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);



    // Muzaki CRUD State
    const [showModal, setShowModal] = useState(false);
    const [showPolicy, setShowPolicy] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        nama: '',
        rt: '01',
        jumlahJiwa: '',
        status: 'Lunas',
        tahun: new Date().getFullYear().toString()
    });

    const getSetting = (key, fallback) => {
        const s = settingsList.find(item => item.key_name === key);
        return s ? s.value : fallback;
    };




    // Print State
    const printRef = useRef(null);
    const receiptRef = useRef(null);
    const handlePrint = usePagePrint(printRef, 'Laporan Zakat Fitrah');
    const handlePrintReceipt = usePagePrint(receiptRef, 'Kuitansi Zakat Fitrah');

    const [selectedReceiptData, setSelectedReceiptData] = useState(null);


    // --- Signature Hook ---
    // --- Signature Hook ---
    const { leftSigner, rightSigner } = useSignatureRule(
        'zakat_fitrah',
        activeTab === 'distribusi' ? (distribusiKategori === 'Sabil' ? 'Fisabilillah' : distribusiKategori) : 'ALL',
        activeTab === 'distribusi' && distribusiScope === 'warga' ? selectedRt : 'ALL'
    );

    // --- Zakat Fitrah Logic ---
    const ZAKAT_RATE_KG = Number(getSetting('zakat_fitrah_kgs', '2.5'));
    const ZAKAT_RICE_PRICE = Number(getSetting('zakat_rice_price', '15000'));


    // Define all 8 Asnaf
    const ASNAF_CATEGORIES = ['Fakir', 'Miskin', 'Amil', 'Mualaf', 'Riqab', 'Gharim', 'Fisabilillah', 'Ibnu Sabil'];

    // State for Distribution Portions (Bagian)
    // Default: 1 portion = 12.5%
    const [asnafPortions, setAsnafPortions] = useState(null); // object → null

    // Effect to prevent "stale" settings usage if needed, though render-cycle variable is enough
    useEffect(() => {
        // Debugger for settings
        // console.log("Active Settings:", { ZAKAT_RATE_KG, ZAKAT_RICE_PRICE });
    }, [settingsList]);


    const handlePortionChange = (category, value) => {
        if (isLocked) return;
        setAsnafPortions(prev => ({
            ...(prev || {}),
            [category]: parseFloat(value) || 0
        }));
    };

    const handleSaveDistributionConfig = async () => {
        try {
            setLoading(true);

            // Calculate total percentage
            const portionsData = asnafPortions || ASNAF_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: 1 }), {});
            const totalPercentage = Object.values(portionsData).reduce((acc, p) => acc + (p * 0.125), 0);

            // Validation: Must be exactly 100% (with small margin for float precision)
            if (Math.abs(totalPercentage - 1) > 0.0001) {
                alert(`Gagal menyimpan! Total alokasi harus tepat 100% (Saat ini: ${(totalPercentage * 100).toFixed(1)}%).\n\nPastikan total "Bagian" adalah 8.0 (8 x 12.5% = 100%).`);
                setLoading(false);
                return;
            }

            // 1. Save/Update asnaf_portions
            const portionsValue = JSON.stringify(portionsData);

            const existingPortions = settingsList.find(s => s.key_name === 'asnaf_portions');
            if (existingPortions) {
                await updateSetting(existingPortions.id, { ...existingPortions, value: portionsValue });
            } else {
                await createSetting({
                    key_name: 'asnaf_portions',
                    value: portionsValue,
                    type: 'json',
                    description: 'Konfigurasi bagian porsi asnaf zakat fitrah'
                });
            }

            // 2. Set lock_distribusi to true
            const existingLock = settingsList.find(s => s.key_name === 'lock_distribusi');
            if (existingLock) {
                await updateSetting(existingLock.id, { ...existingLock, value: 'true' });
            } else {
                await createSetting({
                    key_name: 'lock_distribusi',
                    value: 'true',
                    type: 'boolean',
                    description: 'Kunci tabel perhitungan distribusi'
                });
            }

            setIsLocked(true);
            alert("Konfigurasi distribusi berhasil disimpan dan dikunci!");

            // Refresh settings list
            const res = await fetchSettings();
            if (res.success) setSettingsList(res.data);

        } catch (err) {
            console.error("Failed to save distribution config:", err);
            alert("Gagal menyimpan konfigurasi.");
        } finally {
            setLoading(false);
        }
    };

    const handleUnlockDistribution = async () => {
        if (!window.confirm("Buka kunci distribusi? Anda dapat mengubah porsi kembali.")) return;
        try {
            setLoading(true);
            const existingLock = settingsList.find(s => s.key_name === 'lock_distribusi');
            if (existingLock) {
                await updateSetting(existingLock.id, { ...existingLock, value: 'false' });
                setIsLocked(false);
                alert("Kunci berhasil dibuka.");

                const res = await fetchSettings();
                if (res.success) setSettingsList(res.data);
            } else {
                // If setting record is missing but state was locked (e.g. initial state)
                setIsLocked(false);
            }
        } catch (err) {
            console.error("Failed to unlock:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- API Data Fetching ---
    // Separate Settings Load for faster/independent execution
    const loadConfig = async () => {
        try {
            const res = await fetchSettings();
            if (res.success) {
                console.log("Settings Loaded:", res.data); // Debug
                setSettingsList(res.data || []);

                const lockSetting = res.data.find(s => s.key_name === 'lock_distribusi');
                setIsLocked(lockSetting?.value === 'true' || lockSetting?.value === '1');

                const portionsSetting = res.data.find(s => s.key_name === 'asnaf_portions');
                if (portionsSetting && portionsSetting.value) {
                    try {
                        setAsnafPortions(JSON.parse(portionsSetting.value));
                    } catch (e) {
                        console.error("Failed to parse asnaf_portions", e);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to load settings config:", err);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            loadConfig(); // Ensure settings are refreshed whenever data is reloaded
            // Removed fetchSettings from here to avoid blocking by large data fetches
            const [muzakiRes, statsRes, asnafRes, rtsRes, signerRes] = await Promise.all([
                fetchZakatFitrahList({
                    tahun: selectedTahun,
                    per_page: 20,
                    page: page,
                    search: debouncedSearch
                }),
                fetchMuzakiStats(selectedTahun),
                fetchAsnafList({ per_page: 1000 }), // Fetch ALL Asnaf regardless of year
                fetchRTs(),
                fetchActiveSigner()
            ]);

            setMuzakiList(muzakiRes.data || []);
            setPagination({
                current_page: muzakiRes.current_page || 1,
                last_page: muzakiRes.last_page || 1,
                total: muzakiRes.total || 0,
                from: muzakiRes.from || 0,
                to: muzakiRes.to || 0
            });
            setStats(statsRes);
            setAsnafList((asnafRes.data || []).map(a => ({
                ...a,
                jumlahJiwa: Number(a.jumlah_jiwa || 0),
                rt: a.rt || { kode: '??' } // Ensure rt object exists
            })));
            const uniqueRts = Array.isArray(rtsRes) ? rtsRes : (rtsRes.data || []);
            setRtList(uniqueRts);

            // Auto-select first RT if current is invalid
            if (uniqueRts.length > 0) {
                setFormData(prev => {
                    const exists = uniqueRts.find(r => r.kode === prev.rt);
                    return exists ? prev : { ...prev, rt: uniqueRts[0].kode };
                });
                // Also update selectedRt for filter if invalid
                if (distribusiScope === 'warga') {
                    setSelectedRt(prev => uniqueRts.find(r => r.kode === prev) ? prev : uniqueRts[0].kode);
                }
            }

            setStrukturInti({ ketua: 'Masjid Baitulmal Kandri' });

        } catch (err) {
            console.error("Failed to load Zakat Fitrah data:", err);
            // alert("Gagal memuat data terbaru. Periksa koneksi server.");
        } finally {
            setLoading(false);
        }
    };

    // Load Settings once on mount
    useEffect(() => {
        loadConfig();
    }, []);

    // Load Main Data when filter changes
    React.useEffect(() => {
        loadData();
    }, [selectedTahun, page, debouncedSearch]);



    // 1. Total Collection (From API Stats)
    const totalMuzakiJiwa = stats?.total_jiwa ?? 0;
    const totalBeras = stats?.total_beras ?? 0;

    // 2. Asnaf Data Aggregation (All 8 Categories) - calculated from fetched asnafList
    const asnafStats = ASNAF_CATEGORIES.reduce((acc, category) => {
        // Handle API Category naming differences if any
        const filtered = asnafList.filter(a => a.kategori === category);
        const totalJiwa = filtered.reduce((sum, item) => sum + (Number(item.jumlah_jiwa) || 0), 0);
        return { ...acc, [category]: totalJiwa };
    }, {});

    const totalAsnafJiwa = Object.values(asnafStats).reduce((a, b) => a + b, 0);
    // Placeholder for distributed amount - in a real app this would be summed from distribution transaction logs
    const totalDistributed = 0;

    // 3. Distribution Calculation
    // Logic: 1 Portion = 12.5% (0.125) of Total Beras
    const BASE_SHARE = 0.125;

    const distribution = ASNAF_CATEGORIES.map(category => {
        const portion = (asnafPortions && asnafPortions[category]) ?? 1;
        const percentage = portion * BASE_SHARE;
        const jatahAsnaf = totalBeras * percentage;
        const totalJiwa = asnafStats[category];
        const berasPerJiwa = totalJiwa > 0 ? jatahAsnaf / totalJiwa : 0;

        return {
            category,
            portion,
            percentage,
            totalJiwa,
            jatahAsnaf,
            berasPerJiwa
        };
    });

    // Helper to get beras per jiwa for a specific person based on category
    const getBerasPerJiwa = (kategori) => {
        // Handle 'Sabil' mapping if necessary, or just match direct category
        const targetCat = transportCategoryName(kategori);
        const dist = distribution.find(d => d.category === targetCat);
        return dist ? dist.berasPerJiwa : 0;
    };

    const transportCategoryName = (kategori) => {
        if (kategori === 'Sabil') return 'Fisabilillah';
        return kategori;
    }

    // Filter Asnaf by selected RT for Distribusi tab
    // Filter Logic for Distribution View
    // Filter Asnaf by selected RT for Distribusi tab
    // Filter Logic for Distribution View
    const filteredAsnafDistribusi = asnafList.filter(a => {
        // API ensures we only get selectedTahun data usually, but double check
        // Note: API integration might return all if not filtered properly, but let's assume raw list for now

        // Simplify category matching
        const targetKategori = distribusiKategori === 'Sabil' ? 'Fisabilillah' : distribusiKategori;

        if (distribusiScope === 'warga') {
            // Warga usually matches specific categories per RT, but here we just check RT and Category
            // API returns 'rt' object usually, so we check a.rt.kode or a.rt_id
            const rtCode = a.rt?.kode || '00';
            return rtCode === selectedRt && a.kategori === targetKategori;
        } else {
            // Scope 'khusus' or global views
            return a.kategori === targetKategori;
        }
    });

    // Totals for current view
    const totalJiwaView = filteredAsnafDistribusi.reduce((acc, curr) => acc + (curr.jumlahJiwa ?? 0), 0);
    const totalBerasView = filteredAsnafDistribusi.reduce((acc, curr) => acc + ((curr.jumlahJiwa ?? 0) * getBerasPerJiwa(curr.kategori ?? '')), 0);


    const toggleDistribusi = (id) => {
        setDistribusiStatus(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleCheckAll = () => {
        // Safe access to zakatDistribution
        const currentDist = Array.isArray(zakatDistribution) ? zakatDistribution : [];

        // Only select items that are NOT already distributed
        const availableIds = filteredAsnafDistribusi
            .filter(item => !currentDist.includes(item.id))
            .map(item => item.id);

        if (availableIds.length === 0) return;

        const allChecked = availableIds.every(id => distribusiStatus[id]);

        const newStatus = { ...distribusiStatus };
        availableIds.forEach(id => {
            newStatus[id] = !allChecked;
        });
        setDistribusiStatus(newStatus);
    };

    const confirmDistribution = () => {

        try {
            const selectedIds = Object.keys(distribusiStatus).filter(id => distribusiStatus[id]);


            if (selectedIds.length === 0) {
                alert("Pilih data terlebih dahulu untuk dikonfirmasi.");
                return;
            }

            // Auto-confirm distribution without popup

            // Safe access to zakatDistribution with fallback
            const currentDist = Array.isArray(zakatDistribution) ? zakatDistribution : [];
            // Ensure all IDs are Numbers for consistency
            const numericSelectedIds = selectedIds.map(Number);
            const numericCurrentDist = currentDist.map(Number);

            const newDistribution = [...new Set([...numericCurrentDist, ...numericSelectedIds])];


            if (typeof setZakatDistribution === 'function') {
                setConfirmDistModal({ open: true, loading: false });
            } else {
                console.error("setZakatDistribution is not a function in context");
                alert("Terjadi kesalahan sistem: Fungsi penyimpanan tidak ditemukan. Silakan refresh halaman.");
            }
        } catch (error) {
            console.error("Distribution Error:", error);
            alert("Terjadi kesalahan saat memproses data. Silakan coba lagi.");
        }
    };

    // Muzaki CRUD Handlers
    // Muzaki CRUD Handlers
    // Muzaki CRUD Handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const rtObj = rtList.find(r => r.kode === formData.rt);

            if (!rtObj) {
                alert("Data RT tidak valid. Mohon pilih RT yang tersedia.");
                return;
            }

            const jiwa = Number(formData.jumlahJiwa);

            const payload = {
                nama: formData.nama,
                rt_id: rtObj.id,
                jumlah_jiwa: jiwa,
                jumlah_beras_kg: jiwa * ZAKAT_RATE_KG,
                status_bayar: formData.status,
                tahun: formData.tahun || selectedTahun,
                tanggal_bayar: new Date().toISOString().split('T')[0]
            };

            if (editId) {
                await updateZakatFitrah(editId, payload);
                alert("Data berhasil diperbarui!");
            } else {
                await createZakatFitrah(payload);
                alert("Muzaki berhasil ditambahkan!");
            }

            // Refresh Data
            await loadData();

            closeModal();
        } catch (err) {
            alert("Gagal menyimpan data via API.");
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        setFormData({
            nama: item.nama,
            rt: item.rt?.kode || '01',
            jumlahJiwa: item.jumlah_jiwa,
            // Ensure Title Case for validation (Lunas/Belum Lunas) regardless of API response (lunas/belum lunas)
            status: item.status_bayar ? (item.status_bayar.charAt(0).toUpperCase() + item.status_bayar.slice(1).toLowerCase()) : 'Lunas',
            tahun: item.tahun || selectedTahun
        });
        setShowModal(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteModal({ open: true, id, loading: false });
    };

    const confirmDelete = async () => {
        const id = deleteModal.id;
        if (!id) return;

        setDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            await deleteZakatFitrahApi(id);
            setMuzakiList(prev => prev.filter(m => m.id !== id));
            setDeleteModal({ open: false, id: null, loading: false });
            // Refresh stats after deletion
            const newStats = await fetchMuzakiStats(selectedTahun);
            setStats(newStats);
        } catch (err) {
            alert('Gagal menghapus data');
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setFormData({ nama: '', rt: '01', jumlahJiwa: '', status: 'Lunas', tahun: selectedTahun });
    };

    const openAddModal = () => {
        setEditId(null);
        setFormData({ nama: '', rt: '01', jumlahJiwa: '', status: 'Lunas', tahun: selectedTahun });
        setShowModal(true);
    };

    const handleExport = () => {
        let dataToExport = [];
        let fileName = 'Laporan_Zakat_Fitrah';

        if (activeTab === 'muzaki') {
            dataToExport = muzakiList.map(m => ({ // Changed from filteredMuzaki to muzakiList as filteredMuzaki was not defined
                'Nama Muzaki': m.nama,
                'RT': m.rt?.kode || '-',
                'Jumlah Jiwa': m.jumlah_jiwa,
                'Jumlah Beras (KG)': m.jumlah_beras_kg,
                'Status': m.status_bayar
            }));
            fileName = 'Daftar_Muzaki';
        } else if (activeTab === 'calculation') {
            dataToExport = distribution.map(d => ({
                'Asnaf': d.category,
                'Bagian': d.portion,
                'Total Jiwa': d.totalJiwa,
                'Alokasi (%)': `${(d.percentage * 100)}% `,
                'Total Beras (KG)': d.jatahAsnaf.toFixed(2),
                'Jatah Per Jiwa (KG)': d.berasPerJiwa.toFixed(2)
            }));
            fileName = 'Perhitungan_Distribusi_Zakat';
        } else {
            dataToExport = filteredAsnafDistribusi.map((a, idx) => ({
                'No': idx + 1,
                'Kepala Keluarga': a.nama,
                'Kategori': a.kategori,
                'Jumlah Jiwa': a.jumlahJiwa,
                'Jatah Per Jiwa': getBerasPerJiwa(a.kategori).toFixed(2),
                'Total Terima (KG)': (a.jumlahJiwa * getBerasPerJiwa(a.kategori)).toFixed(2),
                'Status': distribusiStatus[a.id] ? 'Sudah' : 'Belum'
            }));
            fileName = `Distribusi_${distribusiKategori}_${distribusiScope === 'warga' ? 'RT' + selectedRt : 'Global'} `;
        }
        exportToExcel(dataToExport, fileName);
    };

    const handleOpenReceipt = (muzaki) => {
        setSelectedReceiptData(muzaki);
        setReceiptModal({ open: true, data: muzaki });
    };

    const confirmPrintReceipt = () => {
        handlePrintReceipt();
        setReceiptModal({ open: false, data: null });
    };

    const ZakatFitrahPrint = () => (
        <PrintLayout
            title={activeTab === 'distribusi'
                ? `Daftar Distribusi ${distribusiKategori} ${distribusiScope === 'warga' ? `RT ${selectedRt}` : '(Global)'}`
                : activeTab === 'muzaki'
                    ? 'Daftar Muzaki (Zakat Fitrah)'
                    : 'Perhitungan Distribusi Zakat'}
            subtitle={`Baitulmal Masjid Fajar Maqbul - Tahun ${selectedTahun}`}
            signer={{ left: leftSigner, right: rightSigner }}
        >
            {activeTab === 'muzaki' && (
                <>
                    <table className="table-print-boxed">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>No</th>
                                <th>Nama Muzaki</th>
                                <th style={{ width: '60px' }}>RT</th>
                                <th style={{ width: '100px' }}>Jumlah Jiwa</th>
                                <th style={{ width: '120px' }}>Zakat (KG)</th>
                                <th style={{ width: '100px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {muzakiList.map((item, index) => (
                                <tr key={item.id}>
                                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                    <td>{item.nama}</td>
                                    <td style={{ textAlign: 'center' }}>{item.rt?.kode || '-'}</td>
                                    <td style={{ textAlign: 'center' }}>{item.jumlah_jiwa}</td>
                                    <td style={{ textAlign: 'center' }}>{Number(item.jumlah_beras_kg).toLocaleString()} KG</td>
                                    <td style={{ textAlign: 'center' }}>{item.status_bayar}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ fontWeight: 800, background: '#eee' }}>
                                <td colSpan="3" style={{ textAlign: 'center' }}>Total</td>
                                <td style={{ textAlign: 'center' }}>{totalMuzakiJiwa} Jiwa</td>
                                <td style={{ textAlign: 'center' }}>{totalBeras.toLocaleString()} KG</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    <div className="signature-grid">
                        <div className="signature-item">
                            <div className="signature-title">{leftSigner?.jabatan || 'Ketua Baitulmall'}</div>
                            <div className="signature-name">{leftSigner?.nama_pejabat || '............................'}</div>
                            {leftSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {leftSigner.nip}</div>}
                        </div>
                        <div className="signature-item">
                            <div className="signature-title">{rightSigner?.jabatan || ''}</div>
                            <div className="signature-name">{rightSigner?.nama_pejabat || '............................'}</div>
                            {rightSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {rightSigner.nip}</div>}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'calculation' && (
                <>
                    <div style={{ marginBottom: '1rem', border: '1px solid #000', padding: '10px' }}>
                        <strong>Total Beras Terkumpul:</strong> {totalBeras.toLocaleString()} KG
                        <br />
                        <em>Ketentuan: 1 Bagian = 12.5% dari total beras.</em>
                    </div>
                    <table className="table-print-boxed">
                        <thead>
                            <tr>
                                <th>Kategori Asnaf</th>
                                <th style={{ width: '100px' }}>Bagian</th>
                                <th style={{ width: '100px' }}>Persentase</th>
                                <th style={{ width: '100px' }}>Total Jiwa</th>
                                <th style={{ width: '150px' }}>Jatah Beras (KG)</th>
                                <th style={{ width: '150px' }}>Beras / Jiwa (KG)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {distribution.map((d, index) => (
                                <tr key={index}>
                                    <td style={{ fontWeight: 600 }}>{d.category}</td>
                                    <td style={{ textAlign: 'center' }}>{d.portion}</td>
                                    <td style={{ textAlign: 'center' }}>{(d.percentage * 100).toFixed(1)}%</td>
                                    <td style={{ textAlign: 'center' }}>{d.totalJiwa}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{d.jatahAsnaf.toLocaleString()}</td>
                                    <td style={{ textAlign: 'center' }}>{d.berasPerJiwa.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#eee', fontWeight: 'bold' }}>
                                <td colSpan="2">TOTAL</td>
                                <td style={{ textAlign: 'center' }}>
                                    {(distribution.reduce((acc, curr) => acc + curr.percentage, 0) * 100).toFixed(1)}%
                                </td>
                                <td style={{ textAlign: 'center' }}>{totalAsnafJiwa}</td>
                                <td style={{ textAlign: 'center' }}>{distribution.reduce((acc, curr) => acc + curr.jatahAsnaf, 0).toLocaleString()}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="signature-grid">
                        <div className="signature-item">
                            <div className="signature-title">{leftSigner?.jabatan || 'Ketua Baitulmall'}</div>
                            <div className="signature-name">{leftSigner?.nama_pejabat || '............................'}</div>
                            {leftSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {leftSigner.nip}</div>}
                        </div>
                        <div className="signature-item">
                            <div className="signature-title">{rightSigner?.jabatan || ''}</div>
                            <div className="signature-name">{rightSigner?.nama_pejabat || '............................'}</div>
                            {rightSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {rightSigner.nip}</div>}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'distribusi' && (
                <>
                    <table className="table-print-boxed">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>No</th>
                                <th style={{ width: '30%' }}>Kepala Keluarga</th>
                                <th style={{ width: '80px' }}>Jumlah Jiwa</th>
                                <th style={{ width: '100px' }}>Zakat (KG)</th>
                                <th>Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAsnafDistribusi.map((item, index) => (
                                <tr key={item.id}>
                                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                    <td>{item.nama}</td>
                                    <td style={{ textAlign: 'center' }}>{item.jumlah_jiwa || item.jumlahJiwa}</td>
                                    <td style={{ textAlign: 'center' }}>{((item.jumlah_jiwa || item.jumlahJiwa) * getBerasPerJiwa(item.kategori)).toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ fontWeight: 800, background: '#eee' }}>
                                <td colSpan="2" style={{ textAlign: 'center' }}>Total</td>
                                <td style={{ textAlign: 'center' }}>{totalJiwaView} Jiwa</td>
                                <td style={{ textAlign: 'center' }}>{totalBerasView.toFixed(2)} KG</td>
                                <td style={{ textAlign: 'center' }}></td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="signature-grid">
                        <div className="signature-item">
                            <div className="signature-title">{leftSigner?.jabatan || 'Ketua Baitulmall'}</div>
                            <div className="signature-name">{leftSigner?.nama_pejabat || '............................'}</div>
                            {leftSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {leftSigner.nip}</div>}
                        </div>
                        <div className="signature-item">
                            <div className="signature-title">{rightSigner?.jabatan || 'Sekretaris / Bendahara'}</div>
                            <div className="signature-name">{rightSigner?.nama_pejabat || '............................'}</div>
                            {rightSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {rightSigner.nip}</div>}
                        </div>
                    </div>
                </>
            )
            }
        </PrintLayout >
    );

    const MuzakiReceipt = () => (
        <OfficialDocumentTemplate
            title="KUITANSI ZAKAT FITRAH"
            documentNo={`ZF/${selectedTahun}/${selectedReceiptData?.id || '000'}`}
            signer={strukturInti?.data}
        >
            <div style={{ padding: '1rem 0' }}>
                <table style={{ width: '100%', fontSize: '1.2rem', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '180px', padding: '0.5rem 0' }}>Telah Terima Dari</td>
                            <td style={{ width: '20px' }}>:</td>
                            <td style={{ fontWeight: 700, borderBottom: '1px dotted #000' }}>{selectedReceiptData?.nama}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '0.5rem 0' }}>Alamat / RT</td>
                            <td>:</td>
                            <td style={{ borderBottom: '1px dotted #000' }}>RT {selectedReceiptData?.rt?.kode}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '0.5rem 0' }}>Untuk Pembayaran</td>
                            <td>:</td>
                            <td style={{ borderBottom: '1px dotted #000' }}>Zakat Fitrah Tahun {selectedTahun}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '0.5rem 0' }}>Jumlah Jiwa</td>
                            <td>:</td>
                            <td style={{ borderBottom: '1px dotted #000' }}>{selectedReceiptData?.jumlah_jiwa} Jiwa</td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ marginTop: '2.5rem', padding: '1.5rem', border: '2px solid #000', display: 'inline-block', minWidth: '250px' }}>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Zakat Terbayar:</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{Number(selectedReceiptData?.jumlah_beras_kg).toLocaleString()} KG BERAS</div>
                </div>

                <div style={{ marginTop: '2rem', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>
                    "Semoga Allah memberikan pahala atas apa yang telah engkau berikan, dan menjadikannya pembersih bagimu, serta memberkati harta yang masih ada padamu." (Doa Amil)
                </div>
            </div>
        </OfficialDocumentTemplate>
    );

    // END Print Component Logic


    return (
        <div className="no-print animate-fade-in">
            {/* Global Stats & Layout Reorganization */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    {/* Stats Row - Now Full Width */}
                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="card stat-hover" style={{ borderLeft: '4px solid var(--primary)', padding: '1.25rem' }}>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(0, 144, 231, 0.08)', color: 'var(--primary)' }}>
                                    <TrendingUp size={18} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Beras Terkumpul</div>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalBeras.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>KG</span></div>
                        </div>
                        <div className="card stat-hover" style={{ borderLeft: '4px solid var(--info)', padding: '1.25rem' }}>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(143, 95, 232, 0.08)', color: 'var(--info)' }}>
                                    <Users size={18} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Mustahik</div>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalAsnafJiwa} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Jiwa</span></div>
                        </div>
                        <div className="card stat-hover" style={{ borderLeft: '4px solid var(--warning)', padding: '1.25rem' }}>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(255, 171, 0, 0.08)', color: 'var(--warning)' }}>
                                    <RefreshCw size={18} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Siap Distribusi</div>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalBeras.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>KG</span></div>
                        </div>
                        <div className="card stat-hover" style={{ borderLeft: '4px solid var(--success)', padding: '1.25rem' }}>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(0, 210, 91, 0.08)', color: 'var(--success)' }}>
                                    <CheckCircle size={18} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Telah Terdistribusi</div>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalDistributed.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>KG</span></div>
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
                            <select
                                className="input"
                                style={{ background: 'rgba(0,0,0,0.03)', height: '42px', fontWeight: 700, width: 'auto', paddingRight: '2rem' }}
                                value={selectedTahun}
                                onChange={(e) => {
                                    const yr = e.target.value;
                                    setSelectedTahun(yr);
                                    setFormData(prev => ({ ...prev, tahun: yr }));
                                }}
                            >
                                {[2024, 2025, 2026, 2027, 2028].map(y => (
                                    <option key={y} value={y.toString()}>{y}</option>
                                ))}
                            </select>

                            <button className="btn btn-ghost" onClick={loadData} disabled={loading} style={{ border: '1px solid var(--border-color)', height: '42px' }}>
                                <RefreshCw size={16} className={loading ? 'spin' : ''} />
                            </button>
                            <button className="btn btn-ghost" onClick={handlePrint} disabled={loading} style={{ border: '1px solid var(--border-color)', height: '42px' }}>
                                <Printer size={16} />
                            </button>
                            <button className="btn btn-primary" style={{ height: '42px' }} onClick={handleExport}>
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'muzaki' && (
                <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.02)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr 1.5fr auto auto', gap: '1.25rem', alignItems: 'end' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Nama Muzaki</label>
                            <input type="text" className="input" style={{ height: '40px', width: '100%' }} value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} placeholder="Nama Lengkap" required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Jiwa</label>
                            <input type="number" className="input" style={{ height: '40px', width: '100%', textAlign: 'center', fontWeight: 700 }} value={formData.jumlahJiwa} onChange={e => setFormData({ ...formData, jumlahJiwa: e.target.value })} required min="1" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Beras (Kg)</label>
                            <div className="input d-flex align-items-center justify-content-center" style={{ height: '40px', width: '100%', fontWeight: 800, color: 'var(--primary)', background: 'rgba(0,0,0,0.03)' }}>
                                {(Number(formData.jumlahJiwa || 0) * 2.5).toFixed(1)}
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Wilayah / RT</label>
                            <select className="input" style={{ height: '40px', width: '100%', fontWeight: 600 }} value={formData.rt} onChange={e => setFormData({ ...formData, rt: e.target.value })}>
                                {rtList.map(rt => <option key={rt.kode} value={rt.kode}>RT {rt.kode}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">
                            <Plus size={18} /> SIMPAN
                        </button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => setFormData({ nama: '', rt: '01', jumlahJiwa: '', status: 'Lunas', tahun: selectedTahun })}>
                            RESET
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.01)' }}>
                    {['muzaki', 'calculation', 'distribusi', 'distributed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '1.25rem 2rem',
                                background: 'none',
                                border: 'none',
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                                cursor: 'pointer',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {tab === 'muzaki' ? 'DATA MUZAKI' : tab === 'calculation' ? 'KALKULASI' : tab === 'distribusi' ? 'DISTRIBUSI RT' : 'HISTORY'}
                        </button>
                    ))}
                </div>

                <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                    {activeTab === 'muzaki' && (
                        <>
                            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[rgba(0,0,0,0.01)]">
                                <div className="text-sm text-muted">
                                    Menampilkan {pagination.from || 0} - {pagination.to || 0} dari {pagination.total || 0} data
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari Nama Muzaki..."
                                        className="input pr-4 py-2 text-sm w-64"
                                        style={{ height: '38px', paddingLeft: '45px' }} // Forced padding to prevent overlap
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" style={{ pointerEvents: 'none' }}>
                                        <Search size={16} />
                                    </div>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2 top-2 text-muted hover:text-danger"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="table-compact w-full">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '60px' }}>NO</th>
                                            <th>Nama Muzaki</th>
                                            <th>RT</th>
                                            <th style={{ textAlign: 'center' }}>Jiwa</th>
                                            <th>Jumlah Beras</th>
                                            <th>Status</th>
                                            <th>Timestamp</th>
                                            <th style={{ width: '150px', textAlign: 'center' }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="8" className="text-center py-8"><Loader2 className="spin" /></td></tr>
                                        ) : muzakiList.map((m, index) => (
                                            <tr key={m.id}>
                                                <td>{index + 1}</td>
                                                <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{m.nama}</td>
                                                <td><span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>RT {m.rt?.kode || '-'}</span></td>
                                                <td style={{ textAlign: 'center', fontWeight: 600 }}>{m.jumlah_jiwa}</td>
                                                <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{Number(m.jumlah_beras_kg).toLocaleString()} KG</td>
                                                <td>
                                                    <div className="status-indicator">
                                                        <div className="dot dot-success"></div>
                                                        <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.75rem' }}>VERIFIED</span>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {m.created_at ? new Date(m.created_at).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--primary)' }} onClick={() => handleOpenReceipt(m)} title="Cetak Kuitansi"><Printer size={14} /></button>
                                                        <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => handleEdit(m)}><Edit2 size={14} /></button>
                                                        <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => handleDeleteClick(m.id)} title="Hapus"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {pagination.last_page > 1 && (
                                <div className="flex justify-between items-center p-4 border-t border-[var(--border-color)] bg-[rgba(0,0,0,0.01)]">
                                    <span className="text-xs text-muted">
                                        Halaman {pagination.current_page} dari {pagination.last_page}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                            disabled={page === 1 || loading}
                                            className="px-3 py-1 text-xs rounded border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Sebelumnya
                                        </button>
                                        <button
                                            onClick={() => setPage(prev => Math.min(prev + 1, pagination.last_page))}
                                            disabled={page === pagination.last_page || loading}
                                            className="px-3 py-1 text-xs rounded border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Selanjutnya
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}



                    {/* Calculation Tab */}
                    {activeTab === 'calculation' && (
                        <div className="table-container">
                            <div style={{
                                marginBottom: '1.5rem',
                                padding: '1rem',
                                background: isLocked ? 'rgba(16, 185, 129, 0.05)' : 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '8px',
                                borderLeft: isLocked ? '4px solid var(--success)' : '4px solid var(--primary)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 1rem', color: isLocked ? 'var(--success)' : 'var(--primary)' }}>
                                        Total Beras Terkumpul: {totalBeras.toLocaleString()} KG
                                        {isLocked && <span style={{ marginLeft: '1rem', fontSize: '0.75rem', background: 'var(--success)', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>TERKUNCI</span>}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Setting distribusi untuk 8 Asnaf. <b>1 Bagian = 12.5%</b> dari total beras.
                                    </p>
                                </div>
                                <div>
                                    {isLocked ? (
                                        <button className="btn btn-ghost" onClick={handleUnlockDistribution} style={{ color: 'var(--text-muted)' }}>
                                            Buka Kunci
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary" onClick={handleSaveDistributionConfig} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <Save size={16} /> Simpan & Kunci
                                        </button>
                                    )}
                                </div>
                            </div>
                            <table className="table-compact">
                                <thead>
                                    <tr>
                                        <th>Kategori Asnaf</th>
                                        <th style={{ width: '150px' }}>Bagian (1 = 12.5%)</th>
                                        <th>Persentase</th>
                                        <th>Total Jiwa</th>
                                        <th style={{ textAlign: 'center' }}>Total (KG)</th>
                                        <th style={{ textAlign: 'center' }}>/Jiwa (KG)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {distribution.map((d, index) => (
                                        <tr key={index}>
                                            <td style={{ fontWeight: 600 }}>{d.category}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={d.portion}
                                                    onChange={(e) => handlePortionChange(d.category, e.target.value)}
                                                    min="0"
                                                    step="0.1"
                                                    disabled={isLocked}
                                                    className="input"
                                                    style={{
                                                        width: '70px',
                                                        padding: '0.2rem 0.5rem',
                                                        backgroundColor: isLocked ? 'rgba(0,0,0,0.1)' : 'var(--card-bg)',
                                                        color: isLocked ? 'var(--text-muted)' : 'var(--text-main)',
                                                        border: '1px solid var(--border-color)',
                                                        cursor: isLocked ? 'not-allowed' : 'text'
                                                    }}
                                                />
                                            </td>
                                            <td>{(d.percentage * 100).toFixed(1)}%</td>
                                            <td>{d.totalJiwa}</td>
                                            <td style={{ fontWeight: 800, color: 'var(--primary)', textAlign: 'center' }}>{d.jatahAsnaf.toLocaleString()}</td>
                                            <td style={{ fontWeight: 800, textAlign: 'center' }}>{d.berasPerJiwa.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr style={{
                                        fontWeight: 'bold',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: Math.abs(distribution.reduce((acc, curr) => acc + curr.percentage, 0) - 1) > 0.0001 ? 'var(--danger)' : 'inherit'
                                    }}>
                                        <td colSpan="2">TOTAL</td>
                                        <td style={{ color: Math.abs(distribution.reduce((acc, curr) => acc + curr.percentage, 0) - 1) > 0.0001 ? 'var(--danger)' : 'var(--success)' }}>
                                            {(distribution.reduce((acc, curr) => acc + curr.percentage, 0) * 100).toFixed(1)}%
                                        </td>
                                        <td>{totalAsnafJiwa}</td>
                                        <td style={{ textAlign: 'center' }}>{distribution.reduce((acc, curr) => acc + curr.jatahAsnaf, 0).toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'distribusi' && (
                        <div style={{ marginBottom: '1.5rem' }} className="animate-fade-in">
                            {/* Scope Selector */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <button
                                    className={`btn ${distribusiScope === 'warga' ? 'btn-primary' : 'btn-ghost'} `}
                                    onClick={() => { setDistribusiScope('warga'); setDistribusiKategori('Fakir'); }}
                                    style={{ flex: 1 }}
                                >
                                    <Users size={16} style={{ marginRight: '0.5rem' }} /> Warga (Per RT)
                                </button>
                                <button
                                    className={`btn ${distribusiScope === 'khusus' ? 'btn-primary' : 'btn-ghost'} `}
                                    onClick={() => { setDistribusiScope('khusus'); setDistribusiKategori('Amil'); }}
                                    style={{ flex: 1 }}
                                >
                                    <CheckCircle size={16} style={{ marginRight: '0.5rem' }} /> Khusus (Amil & Sabil)
                                </button>
                            </div>

                            {/* Filters Bar */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>

                                {/* RT Selector - Only for Warga */}
                                {distribusiScope === 'warga' && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Filter size={16} className="text-muted" />
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>RT:</span>
                                            <select
                                                className="input"
                                                style={{ width: '80px', padding: '0.5rem' }}
                                                value={selectedRt}
                                                onChange={(e) => setSelectedRt(e.target.value)}
                                            >
                                                {rtList.map(rt => (
                                                    <option key={rt.kode} value={rt.kode}>{rt.kode}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ width: '1px', height: '24px', background: 'var(--card-border)' }}></div>
                                    </>
                                )}

                                {/* Category Selector */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {distribusiScope === 'warga' ? (
                                        <>
                                            <button
                                                onClick={() => setDistribusiKategori('Fakir')}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    border: '1px solid var(--primary)',
                                                    background: distribusiKategori === 'Fakir' ? 'var(--primary)' : 'transparent',
                                                    color: distribusiKategori === 'Fakir' ? '#fff' : 'var(--primary)',
                                                    cursor: 'pointer', fontSize: '0.85rem'
                                                }}
                                            >Fakir</button>
                                            <button
                                                onClick={() => setDistribusiKategori('Miskin')}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    border: '1px solid var(--primary)',
                                                    background: distribusiKategori === 'Miskin' ? 'var(--primary)' : 'transparent',
                                                    color: distribusiKategori === 'Miskin' ? '#fff' : 'var(--primary)',
                                                    cursor: 'pointer', fontSize: '0.85rem'
                                                }}
                                            >Miskin</button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setDistribusiKategori('Amil')}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    border: '1px solid var(--primary)',
                                                    background: distribusiKategori === 'Amil' ? 'var(--primary)' : 'transparent',
                                                    color: distribusiKategori === 'Amil' ? '#fff' : 'var(--primary)',
                                                    cursor: 'pointer', fontSize: '0.85rem'
                                                }}
                                            >Amil</button>
                                            <button
                                                onClick={() => setDistribusiKategori('Fisabilillah')} // Internal name
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    border: '1px solid var(--primary)',
                                                    background: distribusiKategori === 'Fisabilillah' ? 'var(--primary)' : 'transparent',
                                                    color: distribusiKategori === 'Fisabilillah' ? '#fff' : 'var(--primary)',
                                                    cursor: 'pointer', fontSize: '0.85rem'
                                                }}
                                            >Sabilillah</button>
                                        </>
                                    )}
                                </div>

                                <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span>
                                        <strong>{filteredAsnafDistribusi.length}</strong> KK | <strong>{totalJiwaView}</strong> Jiwa | <strong style={{ color: 'var(--primary)' }}>{totalBerasView.toFixed(2)} KG</strong>
                                    </span>
                                    {Object.values(distribusiStatus).some(Boolean) && (
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                                            onClick={confirmDistribution}
                                        >
                                            Konfirmasi Masuk Data
                                        </button>
                                    )}
                                </span>
                            </div>

                            {/* Table */}
                            <table className="table-compact" style={{ marginTop: '1rem' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}>NO</th>
                                        <th>Kepala Keluarga</th>
                                        <th>Kategori</th>
                                        {distribusiScope === 'khusus' && <th>Asal RT</th>}
                                        <th style={{ textAlign: 'center' }}>Jiwa</th>
                                        <th style={{ textAlign: 'center' }}>Jatah (KG)</th>
                                        <th style={{ textAlign: 'center' }}>Total (KG)</th>
                                        <th style={{ width: '180px' }}>
                                            Status
                                            <button
                                                onClick={handleCheckAll}
                                                style={{
                                                    marginLeft: '12px',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                    color: filteredAsnafDistribusi.length > 0 && filteredAsnafDistribusi.every(item => distribusiStatus[item.id]) ? 'var(--primary)' : 'var(--text-muted)'
                                                }}
                                                title="Check All"
                                            >
                                                {filteredAsnafDistribusi.length > 0 && filteredAsnafDistribusi.every(item => distribusiStatus[item.id])
                                                    ? <CheckCircle size={16} />
                                                    : <Circle size={16} />
                                                }
                                            </button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAsnafDistribusi.map((item, index) => {
                                        const perJiwa = getBerasPerJiwa(item.kategori);
                                        const totalTerima = item.jumlahJiwa * perJiwa;
                                        const isDistributed = (Array.isArray(zakatDistribution) ? zakatDistribution : []).includes(item.id);
                                        const isSelected = !!distribusiStatus[item.id];

                                        return (
                                            <tr key={item.id} style={{ opacity: isDistributed ? 0.6 : 1 }}>
                                                <td>{index + 1}</td>
                                                <td style={{ fontWeight: 600 }}>{item.nama}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '2px 10px',
                                                        borderRadius: '4px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        fontSize: '0.75rem',
                                                        color: 'var(--text-muted)',
                                                        border: '1px solid var(--border-color)'
                                                    }}>
                                                        {item.kategori === 'Fisabilillah' ? 'Sabil' : item.kategori}
                                                    </span>
                                                </td>
                                                {distribusiScope === 'khusus' && <td>RT {item.rt?.kode || '-'}</td>}
                                                <td style={{ textAlign: 'center' }}>{item.jumlahJiwa}</td>
                                                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{perJiwa.toFixed(2)}</td>
                                                <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--primary)' }}>
                                                    {totalTerima.toFixed(2)}
                                                </td>
                                                <td>
                                                    {isDistributed ? (
                                                        <div className="status-indicator">
                                                            <div className="dot dot-success"></div>
                                                            <span style={{ color: 'var(--success)' }}>Tersalurkan</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="btn btn-ghost"
                                                            style={{
                                                                padding: '0.4rem 0.5rem',
                                                                color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                fontSize: '0.85rem'
                                                            }}
                                                            onClick={() => toggleDistribusi(item.id)}
                                                        >
                                                            {isSelected ? <CheckCircle size={16} /> : <Circle size={16} />}
                                                            <span style={{ fontWeight: isSelected ? 700 : 400 }}>{isSelected ? 'Siap Konfirm' : 'Belum'}</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Distributed Tab */}
                    {activeTab === 'distributed' && (
                        <div className="table-container">
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--success)' }}>Laporan Distribusi Realisasi</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Data beras yang telah diserahterimakan kepada Mustahik.
                                </p>
                            </div>
                            <table className="table-compact">
                                <thead>
                                    <tr>
                                        <th className="col-no">NO</th>
                                        <th>Nama Penerima</th>
                                        <th>Kategori</th>
                                        <th>RT</th>
                                        <th>Jumlah Beras</th>
                                        <th>Tanggal Distribusi</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="7" className="text-center p-4" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            Belum ada data distribusi yang tercatat.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>


            {/* Muzaki Modal */}
            {
                showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div className="glass-card" style={{ width: '100%', maxWidth: '450px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>{editId ? 'Edit Data Muzaki' : 'Tambah Data Muzaki'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="label">Nama Muzaki</label>
                                    <input
                                        className="input"
                                        value={formData.nama}
                                        onChange={e => setFormData({ ...formData, nama: e.target.value })}
                                        placeholder="Nama Lengkap"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Tahun (Otomatis)</label>
                                    <input
                                        className="input"
                                        value={formData.tahun}
                                        readOnly
                                        disabled
                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Jumlah Jiwa</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.jumlahJiwa}
                                        onChange={e => setFormData({ ...formData, jumlahJiwa: e.target.value })}
                                        placeholder="Jumlah anggota keluarga"
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Jumlah Beras (Otomatis)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.jumlahJiwa ? `${(Number(formData.jumlahJiwa) * ZAKAT_RATE_KG).toFixed(1)} KG` : '0 KG'}
                                        disabled
                                        style={{ background: 'var(--card-bg)', color: 'var(--primary)', fontWeight: 700 }}
                                    />
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Rumus: Jumlah Jiwa × {ZAKAT_RATE_KG} KG</small>
                                </div>
                                <div className="form-group">
                                    <label className="label">Asal RT</label>
                                    <select
                                        className="input"
                                        value={formData.rt}
                                        onChange={e => setFormData({ ...formData, rt: e.target.value })}
                                    >
                                        {rtList.map(rt => <option key={rt.kode} value={rt.kode}>RT {rt.kode}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Status Pembayaran</label>
                                    <select
                                        className="input"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Lunas">Lunas</option>
                                        <option value="Belum Lunas">Belum Lunas</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="button" className="btn btn-outline-danger" style={{ flex: 1 }} onClick={closeModal}>
                                        BATAL
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }}>
                                        SIMPAN DATA
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Distributed Tab */}


            {/* Policy Modal */}
            {
                showPolicy && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Info className="text-primary" />
                                    Kebijakan Distribusi Zakat Fitrah
                                </h2>
                                <button onClick={() => setShowPolicy(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.6 }}>
                                <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Kenapa Fakir 37,5% dan Miskin 37,5%?</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Penjelasan resmi mengenai kebijakan pembagian zakat fitrah.</p>
                                </div>

                                <div>
                                    <h4 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>1️⃣ Prinsip Dasar</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                                        Zakat fitrah diprioritaskan untuk fakir dan miskin sebagai kelompok paling membutuhkan, sesuai praktik fiqh dan kebiasaan pengelolaan zakat di masjid.
                                    </p>
                                </div>

                                <div>
                                    <h4 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>2️⃣ Kebijakan Pembagian</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Dari total zakat fitrah yang terkumpul, ditetapkan:</p>
                                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                                        <li><strong>75%</strong> untuk Fakir dan Miskin</li>
                                        <li><strong>25%</strong> untuk asnaf lain (Amil dan Sabil)</li>
                                    </ul>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Kemudian porsi 75% tersebut dibagi sama rata, sehingga:</p>
                                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                                        <li>Fakir = <strong>37,5%</strong></li>
                                        <li>Miskin = <strong>37,5%</strong></li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>3️⃣ Alasan Pembagian Sama Rata</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                                        <li>Agar adil dan transparan</li>
                                        <li>Menghindari kesenjangan distribusi</li>
                                        <li>Mudah dipahami dan dipertanggungjawabkan</li>
                                        <li>Tetap mengutamakan fakir melalui hasil per jiwa</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>4️⃣ Penegasan Hasil Nyata</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                                        Walaupun persentase sama, jumlah jiwa fakir lebih sedikit sehingga fakir menerima lebih banyak beras per jiwa dibanding miskin. Ini menegaskan bahwa <strong>fakir tetap menjadi prioritas utama</strong>.
                                    </p>
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                    <h4 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>5️⃣ Penutup</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Kebijakan ini diambil melalui pertimbangan syariat, keadilan sosial, dan musyawarah pengurus, sehingga zakat fitrah dapat tersalurkan secara adil dan bermanfaat.
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn btn-primary" onClick={() => setShowPolicy(false)}>Tutup Penjelasan</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Distribution Confirmation Modal */}
            {
                confirmDistModal.open && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                    <CheckCircle size={32} className="text-primary" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Konfirmasi Distribusi</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                    Apakah Anda yakin ingin mengonfirmasi penyaluran zakat untuk <b>{Object.keys(distribusiStatus).filter(id => distribusiStatus[id]).length}</b> KK terpilih?
                                </p>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    <span>Total Jiwa:</span>
                                    <span style={{ fontWeight: 600 }}>{totalJiwaView} Jiwa</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--primary)' }}>
                                    <span style={{ fontWeight: 600 }}>Total Beras:</span>
                                    <span style={{ fontWeight: 800 }}>{totalBerasView.toFixed(2)} KG</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn btn-ghost"
                                    style={{ flex: 1 }}
                                    onClick={() => setConfirmDistModal({ open: false, loading: false })}
                                    disabled={confirmDistModal.loading}
                                >
                                    Batal
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                    onClick={() => {
                                        setConfirmDistModal(prev => ({ ...prev, loading: true }));
                                        const selectedIds = Object.keys(distribusiStatus).filter(id => distribusiStatus[id]);
                                        const currentDist = Array.isArray(zakatDistribution) ? zakatDistribution : [];
                                        const newDistribution = [...new Set([...currentDist.map(Number), ...selectedIds.map(Number)])];

                                        setTimeout(() => {
                                            setZakatDistribution(newDistribution);
                                            setDistribusiStatus({});
                                            setConfirmDistModal({ open: false, loading: false });
                                            alert("Penyaluran berhasil dikonfirmasi!");
                                        }, 600);
                                    }}
                                    disabled={confirmDistModal.loading}
                                >
                                    {confirmDistModal.loading ? <Loader2 className="spin" /> : 'Ya, Konfirmasi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Receipt Preview Modal */}
            {
                receiptModal.open && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
                        <div className="glass-card" style={{ width: '100%', maxWidth: '600px', border: '1px solid rgba(255,255,255,0.2)', padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Printer className="text-primary" /> Preview Kuitansi
                                </h3>
                                <button onClick={() => setReceiptModal({ open: false, data: null })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                            </div>

                            <div style={{ background: '#fff', color: '#000', padding: '2rem', borderRadius: '4px', boxShadow: '0 0 20px rgba(0,0,0,0.1)', marginBottom: '2rem', maxHeight: '50vh', overflowY: 'auto' }}>
                                {/* Simplified Preview of the Receipt Component */}
                                <div style={{ borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                                    <h4 style={{ margin: 0 }}>BAITULMAL FAJAR MAQBUL</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem' }}>KUITANSI ZAKAT FITRAH {selectedTahun}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 10px 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <span>Muzaki</span><span>:</span><span style={{ fontWeight: 700 }}>{receiptModal.data?.nama}</span>
                                    <span>Asal RT</span><span>:</span><span>RT {receiptModal.data?.rt?.kode}</span>
                                    <span>Jumlah Jiwa</span><span>:</span><span>{receiptModal.data?.jumlah_jiwa} Jiwa</span>
                                    <span>Zakat</span><span>:</span><span style={{ fontWeight: 800 }}>{Number(receiptModal.data?.jumlah_beras_kg).toLocaleString()} KG BERAS</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setReceiptModal({ open: false, data: null })}>Tutup</button>
                                <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={confirmPrintReceipt}>
                                    <Printer size={18} /> Cetak Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            <ConfirmDeleteModal
                open={deleteModal.open}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, id: null, loading: false })}
                loading={deleteModal.loading}
            />
            {/* Hidden Print Container */}
            <div className="print-only">
                <div ref={printRef}>
                    <ZakatFitrahPrint />
                </div>
                <div ref={receiptRef}>
                    {selectedReceiptData && <MuzakiReceipt />}
                </div>
            </div>
        </div>
    );
};

export default ZakatFitrah;
