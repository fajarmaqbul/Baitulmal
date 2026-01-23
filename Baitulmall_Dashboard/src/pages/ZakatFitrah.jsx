import React, { useState, useEffect, useRef } from 'react';
import { fetchZakatFitrahList, fetchMuzakiStats, createZakatFitrah, updateZakatFitrah, deleteZakatFitrahApi } from '../services/zakatFitrahApi';
import { fetchActiveSigner } from '../services/documentApi';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import PrintLayout from '../components/PrintLayout';
import OfficialDocumentTemplate from '../components/Print/OfficialDocumentTemplate';
import { usePagePrint } from '../hooks/usePagePrint';
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
    Lock,
    Unlock,
    Heart,
    ExternalLink
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

    const defaultKetua = getSetting('default_signer_ketua', '................');
    const defaultSekretaris = getSetting('default_signer_sekretaris', '................');


    // Print State
    const printRef = useRef(null);
    const receiptRef = useRef(null);
    const handlePrint = usePagePrint(printRef, 'Laporan Zakat Fitrah');
    const handlePrintReceipt = usePagePrint(receiptRef, 'Kuitansi Zakat Fitrah');

    const [selectedReceiptData, setSelectedReceiptData] = useState(null);

    // --- Zakat Fitrah Logic ---
    const ZAKAT_RATE_KG = 2.5;

    // Define all 8 Asnaf
    const ASNAF_CATEGORIES = ['Fakir', 'Miskin', 'Amil', 'Mualaf', 'Riqab', 'Gharim', 'Fisabilillah', 'Ibnu Sabil'];

    // State for Distribution Portions (Bagian)
    // Default: 1 portion = 12.5%
    const [asnafPortions, setAsnafPortions] = useState(null); // object → null

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

            // 1. Save/Update asnaf_portions
            const portionsData = asnafPortions || ASNAF_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: 1 }), {});
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
            }
        } catch (err) {
            console.error("Failed to unlock:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- API Data Fetching ---
    const loadData = async () => {
        try {
            setLoading(true);
            const [muzakiRes, statsRes, asnafRes, rtsRes, signerRes, settingsRes] = await Promise.all([
                fetchZakatFitrahList({ tahun: selectedTahun, per_page: 1000 }), // Fetch all for now
                fetchMuzakiStats(selectedTahun),
                fetchAsnafList({ per_page: 1000 }), // Fetch ALL Asnaf regardless of year
                fetchRTs(),
                fetchActiveSigner('BAITULMALL_2023', 'Ketua Umum'),
                fetchSettings()
            ]);

            setMuzakiList(muzakiRes.data || []);
            setStats(statsRes);
            setAsnafList((asnafRes.data || []).map(a => ({
                ...a,
                jumlahJiwa: Number(a.jumlah_jiwa || 0),
                rt: a.rt || { kode: '??' } // Ensure rt object exists
            })));
            setRtList(Array.isArray(rtsRes) ? rtsRes : (rtsRes.data || []));

            // Process Settings
            if (settingsRes.success) {
                setSettingsList(settingsRes.data);
                const lockSetting = settingsRes.data.find(s => s.key_name === 'lock_distribusi');
                setIsLocked(lockSetting?.value === 'true' || lockSetting?.value === '1');

                const portionsSetting = settingsRes.data.find(s => s.key_name === 'asnaf_portions');
                if (portionsSetting && portionsSetting.value) {
                    try {
                        setAsnafPortions(JSON.parse(portionsSetting.value));
                    } catch (e) {
                        console.error("Failed to parse asnaf_portions JSON", e);
                    }
                }
            }

            // Set Active Signer from SDM API
            if (signerRes.success) {
                setStrukturInti({ ketua: signerRes.data.nama_lengkap, data: signerRes.data });
            } else {
                setStrukturInti({ ketua: 'Masjid Baitulmall Kandri' });
            }

        } catch (err) {
            console.error("Failed to load Zakat Fitrah data:", err);
            // alert("Gagal memuat data terbaru. Periksa koneksi server.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, [selectedTahun]);

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
                // Use setTimeout to allow UI to respond and prevent freeze
                setTimeout(() => {
                    setZakatDistribution(newDistribution);
                    setDistribusiStatus({}); // Clear selection
                    alert("Data berhasil dikonfirmasi!");
                }, 100);
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
            const jiwa = Number(formData.jumlahJiwa);

            const payload = {
                nama: formData.nama,
                rt_id: rtObj?.id || 1,
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
            jumlahJiwa: item.jumlah_jiwa, // API: snake_case
            status: item.status_bayar, // API: snake_case
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
        setTimeout(() => {
            handlePrintReceipt();
        }, 100);
    };

    const ZakatFitrahPrint = () => (
        <PrintLayout
            title={activeTab === 'distribusi'
                ? `Daftar Distribusi ${distribusiKategori} ${distribusiScope === 'warga' ? `RT ${selectedRt}` : '(Global)'}`
                : activeTab === 'muzaki'
                    ? 'Daftar Muzaki (Zakat Fitrah)'
                    : 'Perhitungan Distribusi Zakat'}
            subtitle={`Baitulmall Masjid Fajar Maqbul - Tahun ${selectedTahun}`}
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
                            <div className="signature-title">{strukturInti?.data?.jabatan || 'Ketua Baitulmall'}</div>
                            <div className="signature-name">{strukturInti?.ketua || defaultKetua}</div>
                            {strukturInti?.data?.no_sk && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>No. SK: {strukturInti.data.no_sk}</div>}
                        </div>
                        <div className="signature-item">
                            <div className="signature-title">Bendahara</div>
                            <div className="signature-name">{getSetting('default_signer_bendahara', '................')}</div>
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
                            <div className="signature-title">Ketua Baitulmall</div>
                            <div className="signature-name">{strukturInti?.ketua || defaultKetua}</div>
                        </div>
                        <div className="signature-item">
                            <div className="signature-title">Sekretaris</div>
                            <div className="signature-name">{strukturInti?.data?.sekretaris || defaultSekretaris}</div>
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
                                <th>Kepala Keluarga</th>
                                <th style={{ width: '100px' }}>Jumlah Jiwa</th>
                                <th style={{ width: '120px' }}>Zakat (KG)</th>
                                <th style={{ width: '150px' }}>Keterangan</th>
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
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="signature-grid">
                        <div className="signature-item">
                            <div className="signature-title">Ketua Baitulmall</div>
                            <div className="signature-name">{strukturInti?.ketua || defaultKetua}</div>
                        </div>
                        <div className="signature-item">
                            <div className="signature-title">Ketua RT {selectedRt}</div>
                            <div className="signature-name">{rtList.find(r => r.kode === selectedRt)?.ketua || '................'}</div>
                        </div>
                    </div>
                </>
            )}
        </PrintLayout>
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
        <div className="no-print">
            {/* Global Stats & Layout Reorganization */}
            {/* Global Stats & Layout Reorganization */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Beras Terkumpul</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{totalBeras.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>KG</span></div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--info)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Mustahik</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--info)' }}>{totalAsnafJiwa} <span style={{ fontSize: '0.8rem' }}>Jiwa</span></div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--warning)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Siap Distribusi</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>{totalBeras.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>KG</span></div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--success)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Telah Didistribusi</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{totalDistributed.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>KG</span></div>
                        </div>
                    </div>

                    {/* Action Buttons (Top Right) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignContent: 'start' }}>
                        <select
                            className="btn"
                            style={{ border: '1px solid var(--card-border)', background: '#fff', cursor: 'pointer' }}
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
                        <button className="btn" onClick={loadData} disabled={loading} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff', border: '1px solid var(--card-border)' }}>
                            <RefreshCw size={16} className={loading ? 'spin' : ''} />
                            <span>Refresh</span>
                        </button>
                        <button className="btn" onClick={handlePrint} disabled={loading} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff', border: '1px solid var(--card-border)' }}>
                            <Printer size={16} /> Print
                        </button>
                        <button className="btn" style={{ border: '1px solid var(--card-border)', background: '#fff' }} onClick={() => setShowPolicy(true)}>
                            Info
                        </button>

                        {settingsList.find(s => s.key_name === 'enable_online_muzaki')?.value === 'true' && (
                            <a
                                href="/daftar-zakat"
                                target="_blank"
                                className="btn"
                                style={{
                                    gridColumn: 'span 2',
                                    background: 'var(--success)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    border: 'none',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem'
                                }}
                            >
                                <ExternalLink size={16} /> Buka Link Pendaftaran Publik
                            </a>
                        )}
                    </div>
                </div>

                {/* Inline Form - ALways Visible (Removed activeTab check) */}
                <div className="card" style={{ padding: '1.5rem', background: '#e9ecef', marginBottom: '1.5rem', border: 'none' }}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                    }} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Nama Muzaki</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nama Lengkap"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                required
                                style={{ background: '#fff' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Jiwa</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="0"
                                value={formData.jumlahJiwa}
                                onChange={(e) => setFormData({ ...formData, jumlahJiwa: e.target.value })}
                                required
                                style={{ background: '#fff' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Beras (Kg)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={(Number(formData.jumlahJiwa || 0) * 2.5).toFixed(1)}
                                disabled
                                style={{ backgroundColor: '#fff' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Keterangan / RT</label>
                            <select
                                className="form-control"
                                value={formData.rt}
                                onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                                style={{ background: '#fff' }}
                            >
                                {rtList.map(rt => (
                                    <option key={rt.kode} value={rt.kode}>RT {rt.kode}</option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Simpan</button>
                        <button type="button" className="btn btn-ghost" style={{ width: '100%', background: '#fff', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={() => setFormData({ nama: '', rt: '01', jumlahJiwa: '', status: 'Lunas', tahun: selectedTahun })}>Batal</button>
                    </form>
                </div>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex' }}>
                        {['muzaki', 'calculation', 'distribusi', 'distributed'].map(tab => (
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
                                    fontWeight: 600
                                }}
                            >
                                {tab === 'muzaki' ? 'Data Muzaki' : tab === 'calculation' ? 'Perhitungan Distribusi' : tab === 'distribusi' ? 'Distribusi per RT' : 'Telah Didistribusi'}
                            </button>
                        ))}
                    </div>
                    {activeTab === 'muzaki' && (
                        <div>{/* Empty placeholder for clean diff */}</div>
                    )}
                </div>



                <div className="table-container">
                    {activeTab === 'muzaki' && (
                        <table className="table-compact">
                            <thead>
                                <tr>
                                    <th className="col-no">NO</th>
                                    <th>Nama Muzaki</th>
                                    <th>RT</th>
                                    <th>Jumlah Jiwa</th>
                                    <th>Jumlah Beras (KG)</th>
                                    <th>Status</th>
                                    <th>Timestamp</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center p-4"><Loader2 className="spin" /></td></tr>
                                ) : muzakiList.map((m, index) => (
                                    <tr key={m.id}>
                                        <td className="col-no">{index + 1}</td>
                                        <td style={{ fontWeight: 500 }}>{m.nama}</td>
                                        <td>RT {m.rt?.kode || '-'}</td>
                                        <td style={{ textAlign: 'center' }}>{m.jumlah_jiwa}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{Number(m.jumlah_beras_kg).toLocaleString()} KG</td>
                                        <td><span className="text-success">{m.status_bayar}</span></td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB') : '-'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--primary)' }} onClick={() => handleOpenReceipt(m)} title="Cetak Kuitansi"><Printer size={16} /></button>
                                                <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => handleEdit(m)}><Edit2 size={16} /></button>
                                                <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => handleDeleteClick(m.id)} title="Hapus"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                        <th>Jatah Beras (KG)</th>
                                        <th>Beras / Jiwa (KG)</th>
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
                                                        width: '80px',
                                                        padding: '0.25rem 0.5rem',
                                                        backgroundColor: isLocked ? '#f8f9fa' : '#fff',
                                                        cursor: isLocked ? 'not-allowed' : 'text'
                                                    }}
                                                />
                                            </td>
                                            <td>{(d.percentage * 100).toFixed(1)}%</td>
                                            <td>{d.totalJiwa}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{d.jatahAsnaf.toLocaleString()}</td>
                                            <td style={{ fontWeight: 700 }}>{d.berasPerJiwa.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: 'var(--hover-bg)', fontWeight: 'bold' }}>
                                        <td colSpan="2">TOTAL</td>
                                        <td>
                                            {(distribution.reduce((acc, curr) => acc + curr.percentage, 0) * 100).toFixed(1)}%
                                        </td>
                                        <td>{totalAsnafJiwa}</td>
                                        <td>{distribution.reduce((acc, curr) => acc + curr.jatahAsnaf, 0).toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'distribusi' && (
                        <div style={{ marginBottom: '1.5rem' }}>
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
                                        <th className="col-no">NO</th>
                                        <th>Kepala Keluarga</th>
                                        <th>Kategori</th>
                                        {distribusiScope === 'khusus' && <th>Asal RT</th>}
                                        <th>Jumlah Jiwa</th>
                                        <th>Jatah/Jiwa (KG)</th>
                                        <th>Total Terima (KG)</th>
                                        <th>Status Distribusi
                                            <button
                                                onClick={handleCheckAll}
                                                style={{
                                                    marginLeft: '8px',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                    color: filteredAsnafDistribusi.length > 0 && filteredAsnafDistribusi.every(item => distribusiStatus[item.id]) ? 'var(--success)' : 'var(--text-muted)'
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
                                        // Handle potential undefined zakatDistribution
                                        const currentDist = Array.isArray(zakatDistribution) ? zakatDistribution : [];
                                        const isDistributed = currentDist.includes(item.id);

                                        // Ensure id is treated consistently as string/number for lookup
                                        const isSelected = !!distribusiStatus[item.id];

                                        return (
                                            <tr key={item.id} style={{
                                                background: isSelected ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                                                opacity: isDistributed ? 0.6 : 1
                                            }}>
                                                <td className="col-no">{index + 1}</td>
                                                <td style={{ fontWeight: 500 }}>{item.nama}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        fontSize: '0.8rem',
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                    }}>
                                                        {item.kategori === 'Fisabilillah' ? 'Sabil' : item.kategori}
                                                    </span>
                                                </td>
                                                {distribusiScope === 'khusus' && <td>RT {item.rt?.kode || '-'}</td>}
                                                <td style={{ textAlign: 'center' }}>{item.jumlahJiwa}</td>
                                                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{perJiwa.toFixed(2)}</td>
                                                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                                                    {totalTerima.toFixed(2)} KG
                                                </td>
                                                <td>
                                                    {isDistributed ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                            <CheckCircle size={16} /> Tersalurkan
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="btn btn-ghost"
                                                            style={{
                                                                padding: '0.4rem 0.75rem',
                                                                color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                width: '100%',
                                                                justifyContent: 'flex-start'
                                                            }}
                                                            onClick={() => toggleDistribusi(item.id)}
                                                        >
                                                            {isSelected ? <CheckCircle size={16} /> : <Circle size={16} />}
                                                            {isSelected ? 'Siap Konfirm' : 'Belum'}
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
                                        value={formData.jumlahJiwa ? `${(Number(formData.jumlahJiwa) * 2.5).toFixed(1)} KG` : '0 KG'}
                                        disabled
                                        style={{ background: 'var(--card-bg)', color: 'var(--primary)', fontWeight: 700 }}
                                    />
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Rumus: Jumlah Jiwa × 2.5 KG</small>
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

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={closeModal}>Batal</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan Data</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
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
            <ConfirmDeleteModal
                open={deleteModal.open}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, id: null, loading: false })}
                loading={deleteModal.loading}
            />
            {/* Hidden Print Container */}
            <div style={{ position: 'absolute', top: 0, left: -10000, width: '210mm', zIndex: -1000 }}>
                <div ref={printRef}>
                    <ZakatFitrahPrint />
                </div>
                <div ref={receiptRef}>
                    {selectedReceiptData && <MuzakiReceipt />}
                </div>
            </div>
        </div >
    );
};

export default ZakatFitrah;
