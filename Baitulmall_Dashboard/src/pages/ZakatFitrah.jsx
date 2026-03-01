import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { fetchZakatFitrahList, fetchMuzakiStats, createZakatFitrah, updateZakatFitrah, deleteZakatFitrahApi } from '../services/zakatFitrahApi';
import { fetchActiveSigner } from '../services/documentApi'; // Removed but keeping line for safe deletion if needed or just empty
import { fetchDistribusi, saveDistribusi, deleteDistribusi, deleteDistribusiBulk } from '../services/distribusiApi';

import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import PrintLayout from '../components/PrintLayout';
import OfficialDocumentTemplate from '../components/Print/OfficialDocumentTemplate';
import ZakatFitrahPrint from '../components/ZakatFitrah/ZakatFitrahPrint';
import MuzakiReceipt from '../components/ZakatFitrah/MuzakiReceipt';
import MuzakiFormModal from '../components/ZakatFitrah/MuzakiFormModal';
import ZakatConfirmModal from '../components/ZakatFitrah/ZakatConfirmModal';
import { usePagePrint } from '../hooks/usePagePrint';
import { useSignatureRule } from '../hooks/useSignatureRule';
import {
    Plus,
    Edit2,
    Trash2,
    Printer,
    FileText,
    Download,
    RefreshCw,
    CheckCircle,
    Users,
    TrendingUp,
    Shield,
    Search,
    AlertCircle,
    Save,
    Filter,
    Circle,
    Loader2,
    Info
} from 'lucide-react';
import { exportToExcel } from '../utils/dataUtils';
import { fetchAsnafList, fetchRTs } from '../services/asnafApi';
import { fetchSettings, updateSetting, createSetting } from '../services/settingApi';
import useRealtimeStats from '../hooks/useRealtimeStats';

// Modular Components
import MuzakiTab from '../components/ZakatFitrah/MuzakiTab';
import CalculationTab from '../components/ZakatFitrah/CalculationTab';
import DistributionTab from '../components/ZakatFitrah/DistributionTab';
import HistoryTab from '../components/ZakatFitrah/HistoryTab';
import { useRole } from '../contexts/RoleContext';


const ZakatFitrah = () => {
    const { hasPermission } = useRole();

    // Permissions
    const canDeleteMuzaki = hasPermission('delete_muzaki');
    const canEditConfig = hasPermission('edit_zakat_config');
    const canConfirmDist = hasPermission('confirm_distribution');

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
    const [distDeleteModal, setDistDeleteModal] = useState({ open: false, id: null, loading: false });
    const [selectedHistoryIds, setSelectedHistoryIds] = useState([]);
    const [bulkDistDeleteModal, setBulkDistDeleteModal] = useState({ open: false, loading: false });
    const [confirmLockModal, setConfirmLockModal] = useState({ open: false, loading: false });
    const [confirmUnlockModal, setConfirmUnlockModal] = useState({ open: false, loading: false });

    // Audit Log State
    const [auditLogs, setAuditLogs] = useState([]);

    const [activeTab, setActiveTab] = useState('muzaki');
    const [selectedRt, setSelectedRt] = useState('01');
    const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear().toString());
    const [distribusiScope, setDistribusiScope] = useState('warga');
    const [distribusiKategori, setDistribusiKategori] = useState('Fakir');
    const [distribusiStatus, setDistribusiStatus] = useState({});
    const [zakatDistribution, setZakatDistribution] = useState([]); // list → []
    const [distribusiHistoryList, setDistribusiHistoryList] = useState([]);
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

    // Real-time Statistics Hook
    const { stats: rtStats, loading: rtLoading } = useRealtimeStats(selectedTahun, {
        pollingInterval: 5000,
        enablePolling: true
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
    const [isAnnualReportMode, setIsAnnualReportMode] = useState(false);


    // --- Advanced Features Logic ---
    const [useSmartAllocation, setUseSmartAllocation] = useState(false);

    // Fuzzy search for duplicate names
    const checkDuplicateName = (name) => {
        if (!name || name.length < 3) return null;
        const normalizedInput = name.toLowerCase().replace(/\s+/g, '');

        // Check in current year's muzaki list
        return muzakiList.find(m => {
            const normalizedExisting = m.nama.toLowerCase().replace(/\s+/g, '');
            // Exact match
            if (normalizedInput === normalizedExisting) return { ...m, matchType: 'exact' };

            // Basic fuzzy match (e.g. Ahmad vs Achmad - length diff 1 and high overlap)
            if (Math.abs(normalizedInput.length - normalizedExisting.length) <= 1) {
                let overlap = 0;
                for (let char of normalizedInput) {
                    if (normalizedExisting.includes(char)) overlap++;
                }
                const score = overlap / Math.max(normalizedInput.length, normalizedExisting.length);
                if (score > 0.85) return { ...m, matchType: 'fuzzy' };
            }
            return false;
        });
    };

    const duplicateFound = useMemo(() => checkDuplicateName(formData.nama), [formData.nama, muzakiList, editId]);

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


    // Calculate default portion if not found
    const getDefaultPortion = useCallback((cat) => {
        if (cat === 'Fakir') return 2;
        if (cat === 'Miskin') return 3;
        if (cat === 'Amil' || cat === 'Fisabilillah') return 1;
        return 0;
    }, []);

    // Source of Truth for effective portions (merged with defaults)
    const getEffectivePortions = useCallback(() => {
        return ASNAF_CATEGORIES.reduce((acc, cat) => {
            acc[cat] = (asnafPortions && asnafPortions[cat] !== undefined)
                ? asnafPortions[cat]
                : getDefaultPortion(cat);
            return acc;
        }, {});
    }, [asnafPortions, getDefaultPortion]);

    const handlePortionChange = useCallback((category, value) => {
        if (isLocked) return;
        setAsnafPortions(prev => {
            const current = prev || getEffectivePortions();
            return {
                ...current,
                [category]: parseFloat(value) || 0
            };
        });
    }, [isLocked, getEffectivePortions, setAsnafPortions]);

    const handleSaveDistributionConfig = () => {
        // Calculate total percentage for early validation using source of truth
        const portionsData = getEffectivePortions();
        const totalPercentage = Object.values(portionsData).reduce((acc, p) => acc + (p * 0.125), 0);

        if (Math.abs(totalPercentage - 1) > 0.0001) {
            alert(`Gagal menyimpan! Total alokasi harus tepat 100% (Saat ini: ${(totalPercentage * 100).toFixed(1)}%).\n\nPastikan total "Bagian" adalah 8.0 (8 x 12.5% = 100%).`);
            return;
        }

        setConfirmLockModal({ open: true, loading: false });
    };

    const confirmSaveLock = async () => {
        try {
            setConfirmLockModal(prev => ({ ...prev, loading: true }));

            // 1. Save/Update asnaf_portions using source of truth
            const portionsData = getEffectivePortions();
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
            setConfirmLockModal({ open: false, loading: false });

        } catch (err) {
            console.error("Failed to save distribution config:", err);
            alert(`Gagal menyimpan konfigurasi: ${err.message || 'Unknown error'}`);
        } finally {
            setConfirmLockModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleUnlockDistribution = () => {
        setConfirmUnlockModal({ open: true, loading: false });
    };

    const confirmUnlock = async () => {
        try {
            setConfirmUnlockModal(prev => ({ ...prev, loading: true }));
            const existingLock = settingsList.find(s => s.key_name === 'lock_distribusi');
            if (existingLock) {
                await updateSetting(existingLock.id, { ...existingLock, value: 'false' });
                setIsLocked(false);
                alert("Kunci berhasil dibuka.");

                const res = await fetchSettings();
                if (res.success) setSettingsList(res.data);
            } else {
                setIsLocked(false);
            }
            setConfirmUnlockModal({ open: false, loading: false });
        } catch (err) {
            console.error("Failed to unlock:", err);
            alert(`Gagal membuka kunci: ${err.message || 'Unknown error'}`);
        } finally {
            setConfirmUnlockModal(prev => ({ ...prev, loading: false }));
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
            const [muzakiRes, statsRes, asnafRes, rtsRes, distHistoryRes] = await Promise.all([
                fetchZakatFitrahList({
                    tahun: selectedTahun,
                    per_page: 20,
                    page: page,
                    search: debouncedSearch
                }),
                fetchMuzakiStats(selectedTahun),
                fetchAsnafList({ tahun: selectedTahun, per_page: 1000 }), // Fetch Asnaf for the active year
                fetchRTs(),
                fetchDistribusi({ tahun: selectedTahun, per_page: 1000 })
            ]);

            const mData = muzakiRes?.data || (Array.isArray(muzakiRes) ? muzakiRes : []);
            setMuzakiList(mData);

            const pData = muzakiRes?.current_page ? muzakiRes : {};
            setPagination({
                current_page: pData.current_page || 1,
                last_page: pData.last_page || 1,
                total: pData.total || (Array.isArray(muzakiRes) ? muzakiRes.length : 0),
                from: pData.from || 1,
                to: pData.to || (Array.isArray(muzakiRes) ? muzakiRes.length : 0)
            });
            setStats(statsRes);
            const rawAsnaf = asnafRes?.data || (Array.isArray(asnafRes) ? asnafRes : []);
            setAsnafList(rawAsnaf.map(a => ({
                ...a,
                jumlahJiwa: Number(a.jumlah_jiwa || 0),
                rt: a.rt || { kode: '??' } // Ensure rt object exists
            })));
            const uniqueRts = Array.isArray(rtsRes) ? rtsRes : (rtsRes.data || []);
            setRtList(uniqueRts);

            const distData = distHistoryRes?.data || (Array.isArray(distHistoryRes) ? distHistoryRes : []);
            if (Array.isArray(distData)) {
                setDistribusiHistoryList(distData);
                setZakatDistribution(distData.map(d => Number(d.asnaf_id)));
            }

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

            setStrukturInti({ ketua: 'Masjid Baitulmal Fajar Maqbul' });

            // Generate frontend audit logs from history
            const logs = [
                ...distData.map(d => ({
                    action: 'Penyaluran Zakat',
                    subject: d.asnaf?.nama || 'Unknown',
                    amount: `${d.jumlah_kg} KG`,
                    admin: d.creator?.name || 'Sistem',
                    time: d.created_at,
                    type: 'success'
                })),
                ...(isLocked ? [{
                    action: 'Kunci Distribusi',
                    subject: 'Konfigurasi Porsi',
                    admin: 'Admin',
                    time: new Date().toISOString(), // Mock for now if not in DB
                    type: 'warning'
                }] : [])
            ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
            setAuditLogs(logs);

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
    // Merged with Real-time stats for instant updates
    const asnafStats = useMemo(() => {
        const base = ASNAF_CATEGORIES.reduce((acc, category) => {
            const filtered = asnafList.filter(a => a.kategori === category);
            const totalJiwa = filtered.reduce((sum, item) => sum + (Number(item.jumlah_jiwa) || 0), 0);
            return { ...acc, [category]: totalJiwa };
        }, {});

        // Prefer rtStats if available for priority categories
        if (rtStats) {
            if (rtStats.fakir) base.Fakir = rtStats.fakir.jiwa;
            if (rtStats.miskin) base.Miskin = rtStats.miskin.jiwa;
            if (rtStats.amil) base.Amil = rtStats.amil.jiwa;
        }

        return base;
    }, [asnafList, rtStats]);

    const totalAsnafJiwa = useMemo(() => Object.values(asnafStats).reduce((a, b) => a + b, 0), [asnafStats]);
    // Calculated from fetched distribution history
    const totalDistributed = useMemo(() => Array.isArray(distribusiHistoryList)
        ? distribusiHistoryList.reduce((acc, curr) => acc + Number(curr.jumlah_kg || 0), 0)
        : 0, [distribusiHistoryList]);

    // 3. Distribution Calculation
    // Logic: 1 Portion = 12.5% (0.125) of Total Beras
    const BASE_SHARE = 0.125;

    // (moved getDefaultPortion up)

    // First, let's calculate total portions and percentages for proper splitting
    const totalSelectedPortions = useMemo(() => ASNAF_CATEGORIES.reduce((acc, cat) => acc + ((asnafPortions && asnafPortions[cat]) ?? getDefaultPortion(cat)), 0), [asnafPortions, getDefaultPortion]);

    const distribution = useMemo(() => ASNAF_CATEGORIES.map(category => {
        const portion = (asnafPortions && asnafPortions[category]) ?? getDefaultPortion(category);
        const totalJiwa = asnafStats[category] || 0;

        let percentage = 0;
        let jatahAsnaf = 0;

        if (useSmartAllocation) {
            // Smart Weight Logic:
            // Fakir gets 2.0x, Miskin 1.5x, others 1.0x
            const weights = { Fakir: 2.0, Miskin: 1.5 };
            const weight = weights[category] || 1.0;

            // Total weighted points = sum(weight * portion)
            const totalWeightedPoints = ASNAF_CATEGORIES.reduce((acc, cat) => {
                const p = (asnafPortions && asnafPortions[cat]) ?? getDefaultPortion(cat);
                const w = weights[cat] || 1.0;
                return acc + (p * w);
            }, 0);

            percentage = (portion * weight) / totalWeightedPoints;
            jatahAsnaf = totalBeras * percentage;
        } else {
            // Standard Fixed Portion Logic
            percentage = portion * BASE_SHARE;
            jatahAsnaf = totalBeras * percentage;
        }

        const berasPerJiwa = totalJiwa > 0 ? jatahAsnaf / totalJiwa : 0;

        return {
            category,
            portion,
            percentage,
            totalJiwa,
            jatahAsnaf,
            berasPerJiwa
        };
    }), [asnafPortions, asnafStats, totalBeras, getDefaultPortion, useSmartAllocation]);

    // Helper to get beras per jiwa for a specific person based on category
    const getBerasPerJiwa = useCallback((kategori) => {
        // Handle 'Sabil' mapping if necessary, or just match direct category
        const targetCat = transportCategoryName(kategori);
        const dist = distribution.find(d => d.category === targetCat);
        return dist ? dist.berasPerJiwa : 0;
    }, [distribution]);

    const transportCategoryName = useCallback((kategori) => {
        if (kategori === 'Sabil') return 'Fisabilillah';
        return kategori;
    }, []);

    // Filter Asnaf by selected RT for Distribusi tab
    // Filter Logic for Distribution View
    // Filter Asnaf by selected RT for Distribusi tab
    // Filter Logic for Distribution View
    const filteredAsnafDistribusi = useMemo(() => asnafList.filter(a => {
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
    }), [asnafList, distribusiKategori, distribusiScope, selectedRt]);

    // Totals for current view
    const totalJiwaView = useMemo(() => filteredAsnafDistribusi.reduce((acc, curr) => acc + (curr.jumlahJiwa ?? 0), 0), [filteredAsnafDistribusi]);
    const totalBerasView = useMemo(() => totalJiwaView * getBerasPerJiwa(distribusiKategori), [totalJiwaView, getBerasPerJiwa, distribusiKategori]);


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

    const handleDeleteDistribusi = async () => {
        const id = distDeleteModal.id;
        if (!id) return;

        setDistDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            await deleteDistribusi(id);
            setDistDeleteModal({ open: false, id: null, loading: false });
            // Refresh counts and lists
            loadData();
            alert("Record distribusi berhasil dihapus.");
        } catch (err) {
            alert('Gagal menghapus record distribusi');
            setDistDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleBulkDeleteDistribusi = async () => {
        if (selectedHistoryIds.length === 0) return;

        setBulkDistDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            await deleteDistribusiBulk(selectedHistoryIds);
            setBulkDistDeleteModal({ open: false, loading: false });
            setSelectedHistoryIds([]);
            loadData();
            alert(`${selectedHistoryIds.length} record distribusi berhasil dihapus.`);
        } catch (err) {
            alert('Terjadi kesalahan saat menghapus beberapa record');
            setBulkDistDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    const toggleHistorySelection = (id) => {
        setSelectedHistoryIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAllHistorySelection = () => {
        if (selectedHistoryIds.length === distribusiHistoryList.length && distribusiHistoryList.length > 0) {
            setSelectedHistoryIds([]);
        } else {
            setSelectedHistoryIds(distribusiHistoryList.map(item => item.id));
        }
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
        } else if (activeTab === 'distribusi') {
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
        } else if (activeTab === 'distributed') {
            dataToExport = distribusiHistoryList.map((item, idx) => ({
                'No': idx + 1,
                'Kepala Keluarga': item.asnaf?.nama || '-',
                'Kategori': item.kategori_asnaf,
                'RT': item.asnaf?.rt?.kode || '-',
                'Jumlah Beras (KG)': Number(item.jumlah_kg).toFixed(2),
                'Tanggal Distribusi': new Date(item.tanggal).toLocaleDateString('id-ID'),
                'Status': 'Telah Tersalurkan'
            }));
            fileName = `Laporan_Distribusi_Realisasi_${selectedTahun}`;
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

    const handleAnnualReportPrint = () => {
        setIsAnnualReportMode(true);
        // Small delay to ensure React renders the annual report content into the print ref
        setTimeout(() => {
            handlePrint();
            setIsAnnualReportMode(false);
        }, 150);
    };

    // Print components extracted to separate files

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
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{(totalAsnafJiwa || 0)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Jiwa</span></div>
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
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{(totalDistributed || 0).toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>KG</span></div>
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
                            <button
                                className="btn btn-ghost"
                                onClick={handleAnnualReportPrint}
                                disabled={loading}
                                style={{ border: '1px solid var(--border-color)', height: '42px', gap: '0.5rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}
                                title="Cetak Laporan Tahunan Terkonsolidasi"
                            >
                                <FileText size={16} /> <span className="d-none d-lg-inline">Laporan Tahunan</span>
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


            <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.02)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr 1.5fr auto auto', gap: '1.25rem', alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Nama Muzaki</label>
                        <input type="text" className="input" style={{ height: '40px', width: '100%', borderColor: (duplicateFound && duplicateFound.id !== editId) ? (duplicateFound.matchType === 'exact' ? 'var(--danger)' : '#f59e0b') : 'var(--border-color)' }} value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} placeholder="Nama Lengkap" required />
                        {duplicateFound && duplicateFound.id !== editId && (
                            <div style={{ color: duplicateFound.matchType === 'exact' ? 'var(--danger)' : '#f59e0b', fontSize: '0.65rem', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={10} />
                                {duplicateFound.matchType === 'exact' ? `Duplikat di RT ${duplicateFound.rt?.kode}` : `Mirip dengan ${duplicateFound.nama} (RT ${duplicateFound.rt?.kode})`}
                            </div>
                        )}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Jiwa</label>
                        <input type="number" className="input" style={{ height: '40px', width: '100%', textAlign: 'center', fontWeight: 700, borderColor: Number(formData.jumlahJiwa) > 8 ? '#f59e0b' : 'var(--border-color)' }} value={formData.jumlahJiwa} onChange={e => setFormData({ ...formData, jumlahJiwa: e.target.value })} required min="1" />
                        {Number(formData.jumlahJiwa) > 8 && (
                            <div style={{ color: '#f59e0b', fontSize: '0.65rem', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={10} /> Ukuran Keluarga Tidak Wajar ({'>'}8)
                            </div>
                        )}
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
                    <button type="button" className="btn btn-outline-danger" onClick={() => setFormData({ ...formData, nama: '', jumlahJiwa: '', rt: '01' })}>
                        RESET
                    </button>
                </form>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.01)', paddingRight: '1.25rem' }}>
                    <div style={{ display: 'flex' }}>
                        {['muzaki', 'calculation', 'distribusi', 'distributed', 'log'].map(tab => (
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
                                {tab === 'muzaki' ? 'DATA MUZAKI' : tab === 'calculation' ? 'KALKULASI' : tab === 'distribusi' ? 'DISTRIBUSI RT' : tab === 'distributed' ? 'HISTORY' : 'AUDIT LOG'}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'muzaki' && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari Nama Muzaki..."
                                className="input pr-4 py-2 text-sm w-64"
                                style={{ height: '38px', paddingLeft: '45px', background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}
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
                                    style={{ background: 'none', border: 'none', padding: '4px' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                    {activeTab === 'muzaki' && (
                        <MuzakiTab
                            muzakiList={muzakiList}
                            pagination={pagination}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            page={page}
                            setPage={setPage}
                            loading={loading}
                            handleOpenReceipt={handleOpenReceipt}
                            handleEdit={handleEdit}
                            handleDeleteClick={handleDeleteClick}
                            canDeleteMuzaki={canDeleteMuzaki}
                            formData={formData}
                            setFormData={setFormData}
                            handleSubmit={handleSubmit}
                            editId={editId}
                            rtList={rtList}
                        />
                    )}

                    {activeTab === 'calculation' && (
                        <CalculationTab
                            totalBeras={totalBeras}
                            isLocked={isLocked}
                            distribution={distribution}
                            totalAsnafJiwa={totalAsnafJiwa}
                            handlePortionChange={handlePortionChange}
                            handleUnlockDistribution={handleUnlockDistribution}
                            handleSaveDistributionConfig={handleSaveDistributionConfig}
                            canEditConfig={canEditConfig}
                            useSmartAllocation={useSmartAllocation}
                            setUseSmartAllocation={setUseSmartAllocation}
                        />
                    )}

                    {activeTab === 'distribusi' && (
                        <DistributionTab
                            distribusiScope={distribusiScope}
                            setDistribusiScope={setDistribusiScope}
                            distribusiKategori={distribusiKategori}
                            setDistribusiKategori={setDistribusiKategori}
                            selectedRt={selectedRt}
                            setSelectedRt={setSelectedRt}
                            rtList={rtList}
                            filteredAsnafDistribusi={filteredAsnafDistribusi}
                            totalJiwaView={totalJiwaView}
                            totalBerasView={totalBerasView}
                            distribusiStatus={distribusiStatus}
                            confirmDistribution={confirmDistribution}
                            handleCheckAll={handleCheckAll}
                            getBerasPerJiwa={getBerasPerJiwa}
                            zakatDistribution={zakatDistribution}
                            toggleDistribusi={toggleDistribusi}
                            canConfirmDist={canConfirmDist}
                        />
                    )}

                    {activeTab === 'distributed' && (
                        <HistoryTab
                            distribusiHistoryList={distribusiHistoryList}
                            selectedHistoryIds={selectedHistoryIds}
                            toggleHistorySelection={toggleHistorySelection}
                            toggleAllHistorySelection={toggleAllHistorySelection}
                            setBulkDistDeleteModal={setBulkDistDeleteModal}
                            setDistDeleteModal={setDistDeleteModal}
                            canDeleteMuzaki={canDeleteMuzaki}
                        />
                    )}

                    {activeTab === 'log' && (
                        <div style={{ padding: '2rem' }}>
                            <div className="d-flex align-items-center gap-3 mb-4" style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                                <Shield className="text-primary" />
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Chain of Custody</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rekam jejak digital seluruh aktivitas kritial penyaluran zakat tahun {selectedTahun}.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {Array.isArray(auditLogs) && auditLogs.length > 0 ? auditLogs.map((log, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                background: log.type === 'success' ? 'var(--success)' : log.type === 'warning' ? 'var(--warning)' : 'var(--primary)'
                                            }}></div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{log.action}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Subjek: {log.subject} {log.amount ? `(${log.amount})` : ''}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{log.admin}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.time ? new Date(log.time).toLocaleString('id-ID') : '-'}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-5 text-muted">Belum ada aktivitas yang tercatat.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Muzaki Modal Extracted */}
            <MuzakiFormModal
                isOpen={showModal}
                onClose={closeModal}
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                editId={editId}
                rtList={rtList}
                zakatRateKg={ZAKAT_RATE_KG}
                isLocked={isLocked}
            />
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
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Penjelasan resmi mengenai kebijakan pembagian zakat fitrah.</p>
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
                                    onClick={async () => {
                                        setConfirmDistModal(prev => ({ ...prev, loading: true }));
                                        const selectedIds = Object.keys(distribusiStatus).filter(id => distribusiStatus[id]);

                                        // Prepare payload
                                        const payload = selectedIds.map(id => {
                                            const item = filteredAsnafDistribusi.find(a => a.id == id);
                                            if (!item) {
                                                console.error(`Asnaf ID ${id} not found in filtered list during confirmation`);
                                                return null;
                                            }
                                            return {
                                                asnaf_id: item.id,
                                                kategori_asnaf: item.kategori,
                                                jumlah_kg: item.jumlahJiwa * getBerasPerJiwa(item.kategori),
                                                tahun: selectedTahun,
                                                tanggal: new Date().toISOString().split('T')[0],
                                                status: 'distributed'
                                            };
                                        }).filter(Boolean);

                                        try {
                                            await saveDistribusi({ distributions: payload });
                                            setDistribusiStatus({});
                                            setConfirmDistModal({ open: false, loading: false });
                                            alert("Penyaluran berhasil dikonfirmasi!");
                                            loadData();
                                        } catch (err) {
                                            alert("Terjadi kesalahan saat menyimpan distribusi");
                                            setConfirmDistModal(prev => ({ ...prev, loading: false }));
                                        }
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
            <ConfirmDeleteModal
                open={distDeleteModal.open}
                onConfirm={handleDeleteDistribusi}
                onCancel={() => setDistDeleteModal({ open: false, id: null, loading: false })}
                loading={distDeleteModal.loading}
                title="Hapus Data Distribusi"
                message="Apakah Anda yakin ingin menghapus data distribusi ini? Status mustahik ini akan kembali menjadi 'Belum Disalurkan'."
            />
            <ConfirmDeleteModal
                open={bulkDistDeleteModal.open}
                onConfirm={handleBulkDeleteDistribusi}
                onCancel={() => setBulkDistDeleteModal({ open: false, loading: false })}
                loading={bulkDistDeleteModal.loading}
                title="Hapus Masal Record Distribusi"
                message={`Anda akan menghapus ${selectedHistoryIds.length} record distribusi secara masal. Status mustahik terkait akan kembali menjadi 'Belum Disalurkan'. Lanjutkan?`}
            />
            <ZakatConfirmModal
                open={confirmLockModal.open}
                type="lock"
                title="Simpan & Kunci Distribusi?"
                description="Simpan porsi asnaf saat ini dan kunci tabel perhitungan untuk melanjutkan ke tahap penyaluran."
                onConfirm={confirmSaveLock}
                onCancel={() => setConfirmLockModal({ open: false, loading: false })}
                loading={confirmLockModal.loading}
            />
            <ZakatConfirmModal
                open={confirmUnlockModal.open}
                type="unlock"
                title="Buka Kunci Distribusi?"
                description="Membuka kunci memungkinkan Anda untuk mengubah kembali porsi asnaf. Gunakan jika ada perubahan skema alokasi."
                onConfirm={confirmUnlock}
                onCancel={() => setConfirmUnlockModal({ open: false, loading: false })}
                loading={confirmUnlockModal.loading}
            />
            {/* Hidden Print Container */}
            <div className="print-only">
                <div ref={printRef}>
                    <ZakatFitrahPrint
                        activeTab={isAnnualReportMode ? 'annual_report' : activeTab}
                        distribusiKategori={distribusiKategori}
                        distribusiScope={distribusiScope}
                        selectedRt={selectedRt}
                        selectedTahun={selectedTahun}
                        leftSigner={leftSigner}
                        rightSigner={rightSigner}
                        muzakiList={muzakiList}
                        totalMuzakiJiwa={totalMuzakiJiwa}
                        totalBeras={totalBeras}
                        distribution={distribution}
                        totalAsnafJiwa={totalAsnafJiwa}
                        filteredAsnafDistribusi={filteredAsnafDistribusi}
                        getBerasPerJiwa={getBerasPerJiwa}
                        totalJiwaView={totalJiwaView}
                        totalBerasView={totalBerasView}
                        distribusiHistoryList={distribusiHistoryList}
                    />
                </div>
                <div ref={receiptRef}>
                    {selectedReceiptData && (
                        <MuzakiReceipt
                            selectedTahun={selectedTahun}
                            selectedReceiptData={selectedReceiptData}
                            strukturInti={strukturInti}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZakatFitrah;
