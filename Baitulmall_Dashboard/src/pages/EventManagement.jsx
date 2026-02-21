
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAssignments } from '../services/sdmApi';

const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    let isoString = dateString;
    // Handle MySQL "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
    if (dateString.includes(' ')) {
        isoString = dateString.replace(' ', 'T');
    }
    // Handle "YYYY-MM-DD" -> "YYYY-MM-DDTHH:mm" (default start of day)
    if (isoString.length === 10) {
        isoString += 'T00:00';
    }
    // datetime-local expects "YYYY-MM-DDTHH:mm"
    return isoString.slice(0, 16);
};
import { createEvent, updateEvent, fetchEventById } from '../services/eventApi';
import { generateRundown, generateBudget, generateChecklist, generateDescription } from '../services/aiService';
import {
    ChevronLeft, Save, Check, Plus, Trash2, Clock, MapPin,
    User, Calendar, Banknote, Activity, FileText, Users,
    AlertCircle, ArrowRight, Printer, Sparkles, Loader2, Pencil
} from 'lucide-react';

import { usePagePrint } from '../hooks/usePagePrint';
import useDebounceHook from '../hooks/useDebounce'; // Rename to bust cache
import OfficialDocumentTemplate from '../components/Print/OfficialDocumentTemplate';
import SKPanitiaTemplate from '../components/documents/SKPanitiaTemplate';
import InvitationTemplate from '../components/documents/InvitationTemplate';
import { fetchActiveSigner } from '../services/documentApi';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

// --- Reusable Sub-components ---

// --- Reusable Sub-components ---

const RundownItem = ({ item, onChange, onDelete, index }) => (
    <div className="grid grid-cols-12 gap-4 items-start py-3 border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--primary-transparent)] transition-colors p-2 rounded-md group">
        <div className="col-span-2">
            <Input
                type="date"
                value={item.date || ""}
                onChange={(e) => onChange(index, 'date', e.target.value)}
                className="font-mono text-xs h-8 bg-[var(--input-bg)] text-[var(--text-main)] border-[var(--border-color)]"
            />
        </div>
        <div className="col-span-2 flex gap-2">
            <Input
                value={item.startTime}
                onChange={(e) => onChange(index, 'startTime', e.target.value)}
                placeholder="Mulai"
                className="font-mono text-xs h-8 bg-[var(--input-bg)] text-[var(--text-main)] border-[var(--border-color)]"
            />
            <span className="self-center text-[var(--text-muted)]">-</span>
            <Input
                value={item.endTime}
                onChange={(e) => onChange(index, 'endTime', e.target.value)}
                placeholder="Selesai"
                className="font-mono text-xs h-8 bg-[var(--input-bg)] text-[var(--text-main)] border-[var(--border-color)]"
            />
        </div>
        <div className="col-span-4">
            <Input
                id={`activity-${index}`}
                value={item.activity}
                onChange={(e) => onChange(index, 'activity', e.target.value)}
                placeholder="Nama Kegiatan"
                className="font-medium h-8 bg-[var(--input-bg)] text-[var(--text-main)] border-[var(--border-color)]"
            />
        </div>
        <div className="col-span-2">
            <Input
                value={item.pic}
                onChange={(e) => onChange(index, 'pic', e.target.value)}
                placeholder="PIC"
                className="text-xs h-8 bg-[var(--input-bg)] text-[var(--text-main)] border-[var(--border-color)]"
            />
        </div>
        <div className="col-span-1">
            <Input
                value={item.notes}
                onChange={(e) => onChange(index, 'notes', e.target.value)}
                placeholder="Catatan"
                className="text-xs text-[var(--text-muted)] h-8 bg-[var(--input-bg)] border-[var(--border-color)]"
            />
        </div>
        <div className="col-span-1 flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => document.getElementById(`activity-${index}`).focus()} className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                <Pencil size={14} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(index)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 size={14} />
            </Button>
        </div>
    </div>
);

const BudgetRow = ({ item, onChange, onDelete, index }) => {
    return (
        <tr className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--primary-transparent)] group transition-colors">
            <td className="py-2 px-2">
                <Input
                    value={item.description}
                    onChange={(e) => onChange(index, 'description', e.target.value)}
                    placeholder="Deskripsi Item"
                    className="h-8 text-xs border-transparent bg-transparent hover:bg-[var(--input-bg)] hover:border-[var(--border-color)] focus:bg-[var(--input-bg)] text-[var(--text-main)]"
                />
            </td>

            <td className="py-2 px-2">
                <Input
                    type="number"
                    value={item.estimated}
                    onChange={(e) => onChange(index, 'estimated', e.target.value)}
                    placeholder="0"
                    className="h-8 text-xs text-right font-mono border-transparent bg-transparent hover:bg-[var(--input-bg)] hover:border-[var(--border-color)] focus:bg-[var(--input-bg)] text-[var(--text-main)]"
                />
            </td>
            <td className="py-2 px-2">
                <Input
                    type="number"
                    value={item.actual}
                    onChange={(e) => onChange(index, 'actual', e.target.value)}
                    placeholder="0"
                    className="h-8 text-xs text-right font-mono border-transparent bg-transparent hover:bg-[var(--input-bg)] hover:border-[var(--border-color)] focus:bg-[var(--input-bg)] text-[var(--text-main)]"
                />
            </td>
            <td className="py-2 px-2 text-center">
                <Button variant="ghost" size="icon" onClick={() => onDelete(index)} className="h-6 w-6 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100">
                    <Trash2 size={12} />
                </Button>
            </td>
        </tr>
    );
}

// --- Reusable Sub-components ---

const IncomeRow = ({ item, onChange, onDelete, index }) => (
    <tr className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--primary-transparent)] group transition-colors">
        <td className="py-2 px-2">
            <select
                className="h-8 text-xs w-full rounded-md border-transparent bg-transparent hover:bg-[var(--input-bg)] hover:border-[var(--border-color)] focus:bg-[var(--input-bg)] focus:border-[var(--border-color)] outline-none px-2 font-medium text-[var(--text-main)]"
                value={item.source}
                onChange={(e) => onChange(index, 'source', e.target.value)}
            >
                <option value="Kas Masjid">Kas Masjid</option>
                <option value="Dekahan">Dekahan</option>
                <option value="Sponsorship">Sponsorship</option>
                <option value="Donatur Khusus">Donatur Khusus</option>
                <option value="Lainnya">Lainnya</option>
            </select>
        </td>
        <td className="py-2 px-2">
            <Input
                value={item.description}
                onChange={(e) => onChange(index, 'description', e.target.value)}
                placeholder="Keterangan (Opsional)"
                className="h-8 text-xs border-transparent bg-transparent hover:bg-[var(--input-bg)] hover:border-[var(--border-color)] focus:bg-[var(--input-bg)] text-[var(--text-main)]"
            />
        </td>
        <td className="py-2 px-2">
            <Input
                type="number"
                value={item.amount}
                onChange={(e) => onChange(index, 'amount', e.target.value)}
                placeholder="0"
                className="h-8 text-xs text-right font-mono border-transparent bg-transparent hover:bg-[var(--input-bg)] hover:border-[var(--border-color)] focus:bg-[var(--input-bg)] text-[var(--primary)] font-semibold"
            />
        </td>
        <td className="py-2 px-2 text-center">
            <Button variant="ghost" size="icon" onClick={() => onDelete(index)} className="h-6 w-6 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100">
                <Trash2 size={12} />
            </Button>
        </td>
    </tr>
);

// --- Main Page Component ---

const EventManagement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("detail");
    const [isSaved, setIsSaved] = useState(false);
    const [status, setStatus] = useState("Draft");
    const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error
    const [isDataLoaded, setIsDataLoaded] = useState(false); // New flag to prevent race condition

    // SAFETY: Prevent reference errors if old code is cached
    const isSaving = saveStatus === 'saving';

    // Form State
    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
        rundown: [],
        budget: [],
        income: [],
        checklist: [],
        staff: []
    });

    // Debounce eventData for autosave (2 seconds)
    const debouncedEventData = useDebounceHook(eventData, 2000);

    // Track the last successfully saved data to prevent redundant saves and "save-on-load" bugs
    const [lastSavedJson, setLastSavedJson] = useState(null);
    const ignoreAutosaveUntil = React.useRef(0); // Add stabilization ref

    // Initial Load / Auto-Create
    useEffect(() => {
        if (id) {
            loadEventData(id);
        } else {
            // AUTO-CREATE DRAFT if no ID
            createDraftAndRedirect();
        }
    }, [id]);

    // Autosave Effect
    useEffect(() => {
        // Skip initial render or if id is missing (still creating)
        if (!id) return;


        // CRITICAL: Block autosave if data hasn't been loaded yet or if we are in the middle of loading
        if (!isDataLoaded) return;

        // Block if currently loading/saving (though debounce helps)
        if (saveStatus === 'loading') return;

        // DIRTY CHECK: Compare current debounced data with last saved data
        // This prevents "Save on Load" and overwriting with empty state
        const currentJson = JSON.stringify(debouncedEventData);
        if (currentJson === lastSavedJson) {
            return; // No changes detected
        }

        // Perform Autosave
        if (debouncedEventData) {
            handleAutosave();
        }
    }, [debouncedEventData, isDataLoaded, lastSavedJson]); // Dependencies

    const createDraftAndRedirect = async () => {
        setSaveStatus("saving");
        try {
            // Create blank draft
            const result = await createEvent({
                nama_struktur: "Draft Acara Baru",
                status: "Draft",
                is_active: true
            });

            if (result && result.success) {
                const newId = result.data.id;
                // Initialize state for the new draft
                setLastSavedJson(JSON.stringify({
                    title: "Draft Acara Baru",
                    description: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    rundown: [],
                    budget: [],
                    income: [],
                    checklist: [],
                    staff: []
                })); // Assume default state matched backend
                setIsDataLoaded(true);

                // Replace URL without push to history
                navigate(`/event-management/${newId}`, { replace: true });
                setSaveStatus("saved");
            } else {
                setSaveStatus("error");
                alert("Gagal membuat draft otomatis. Silakan refresh.");
            }
        } catch (error) {
            console.error("Auto-create failed", error);
            setSaveStatus("error");
        }
    };

    const loadEventData = async (eventId) => {
        setSaveStatus("loading");
        try {
            const result = await fetchEventById(eventId);
            if (result && result.success) {
                // FIX: Backend returns { event: {...}, agendas: [...] }
                const apiData = result.data;
                const data = apiData.event || apiData;
                const safelyParse = (data, fallback = []) => {
                    if (!data) return fallback;
                    if (Array.isArray(data) || typeof data === 'object') return data; // Already casted by backend
                    try { return JSON.parse(data); } catch (e) { return fallback; }
                };

                const newData = {
                    title: data.nama_struktur || "",
                    description: data.deskripsi || "",
                    location: data.lokasi || "",
                    startDate: formatDateForInput(data.tanggal_mulai),
                    endDate: formatDateForInput(data.tanggal_selesai),
                    rundown: safelyParse(data.rundown),
                    budget: safelyParse(data.anggaran),
                    income: safelyParse(data.pemasukan),
                    checklist: safelyParse(data.checklist),
                    staff: safelyParse(data.panitia)
                };

                setEventData(newData);
                // UPDATE BASELINE for Dirty Check
                setLastSavedJson(JSON.stringify(newData));

                setStatus(data.status || 'Draft');
                setSaveStatus("saved");
                setIsSaved(true); // FIX: Unlock tabs when editing existing event
                setIsDataLoaded(true); // Mark data as loaded

                // Set stabilization period (debounce delay is 2000ms, so we wait 2500ms)
                ignoreAutosaveUntil.current = Date.now() + 2500;
                console.log("Event loaded successfully. Stabilization period started.");
            }
        } catch (error) {
            console.error("Failed to load event:", error);
            setSaveStatus("error");
        }
    };

    const handleAutosave = async () => {
        setSaveStatus("saving");
        try {
            const payload = {
                nama_struktur: eventData.title || "Draft Acara Baru",
                deskripsi: eventData.description,
                lokasi: eventData.location,
                tanggal_mulai: eventData.startDate || null,
                tanggal_selesai: eventData.endDate || null,
                status: status, // Keep current status
                rundown: JSON.stringify(eventData.rundown),
                anggaran: JSON.stringify(eventData.budget),
                pemasukan: JSON.stringify(eventData.income),
                checklist: JSON.stringify(eventData.checklist),
                panitia: JSON.stringify(eventData.staff)
            };

            console.log("Saving Autosave Payload:", payload); // DEBUG: Check what we are sending

            const result = await updateEvent(id, payload);
            if (result && result.success) {
                setSaveStatus("saved");
                // Update baseline to current successful save
                setLastSavedJson(JSON.stringify(eventData));
            } else {
                setSaveStatus("error");
            }
        } catch (error) {
            console.error("Autosave failed", error);
            setSaveStatus("error");
        }
    };

    // Manual Save (e.g. for Publish button)
    const handleSave = async (publish = false) => {
        // ... effectively same as autosave but can change status
        setSaveStatus("saving");
        try {
            const payload = {
                nama_struktur: eventData.title || "Draft Acara Baru",
                deskripsi: eventData.description,
                lokasi: eventData.location,
                tanggal_mulai: eventData.startDate || null,
                tanggal_selesai: eventData.endDate || null,
                status: publish ? 'Published' : status,
                rundown: JSON.stringify(eventData.rundown),
                anggaran: JSON.stringify(eventData.budget),
                pemasukan: JSON.stringify(eventData.income),
                checklist: JSON.stringify(eventData.checklist),
                panitia: JSON.stringify(eventData.staff)
            };

            const result = await updateEvent(id, payload);
            if (result && result.success) {
                setStatus(publish ? 'Published' : status);
                setSaveStatus("saved");
                if (publish) alert("Event berhasil dipublikasikan!");
            } else {
                setSaveStatus("error");
            }
        } catch (error) {
            console.error("Save failed", error);
            setSaveStatus("error");
        }
    };

    // Print State
    const printRef = React.useRef(null);
    const handlePrint = usePagePrint(printRef, `Dokumen Event - ${eventData?.title || 'Draft'}`);
    const [printMode, setPrintMode] = useState('proposal'); // 'proposal', 'sk', 'invitation'
    const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);

    const handlePrintDocument = (mode) => {
        setPrintMode(mode);
        setIsPrintMenuOpen(false);
        // Small delay to ensure React renders the correct template before printing
        setTimeout(() => {
            handlePrint();
        }, 100);
    };
    const [signer, setSigner] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const [availableStaff, setAvailableStaff] = useState([]);

    // New Staff Input State
    const [newStaffId, setNewStaffId] = useState("");
    const [newStaffRole, setNewStaffRole] = useState("");

    useEffect(() => {
        const loadResources = async () => {
            // Load signer
            try {
                // Fetch real signer (Ketua)
                const res = await fetchActiveSigner('BAITULMALL_2023', 'Ketua Umum');
                if (res.success && res.data) {
                    setSigner(res.data);
                } else {
                    console.warn("No active signer found");
                }
            } catch (e) {
                console.error("Failed to fetch signer", e);
            }

            // Load Staff Candidates
            try {
                // Use Structure ID for "BAITULMALL_2023"
                const res = await fetchAssignments();
                if (res.success) {
                    // Unique people
                    const uniquePeople = [];
                    const map = new Map();
                    for (const item of res.data) {
                        if (!map.has(item.person_id)) {
                            map.set(item.person_id, true);
                            uniquePeople.push({
                                id: item.person_id,
                                name: item.person?.nama_lengkap || 'Unknown',
                                role: item.jabatan
                            });
                        }
                    }
                    setAvailableStaff(uniquePeople);
                }
            } catch (e) {
                console.error("Failed to load staff candidates", e);
            }
        };
        loadResources();
    }, []);

    // Derived State
    const progress = React.useMemo(() => {
        let completed = 0;
        let total = 4; // Detail, Rundown, Anggaran, Tim

        if (eventData.title && eventData.description) completed++;
        if (eventData.rundown.length > 0) completed++;
        if (eventData.budget.length > 0) completed++;
        if (eventData.staff.length > 0) completed++;

        return (completed / total) * 100;
    }, [eventData]);

    const addRundownItem = () => {
        setEventData(prev => ({
            ...prev,
            rundown: [...prev.rundown, {
                date: prev.startDate ? prev.startDate.slice(0, 10) : "", // Default to start date if available
                startTime: "",
                endTime: "",
                activity: "",
                pic: "",
                notes: ""
            }]
        }));
    };

    const updateRundown = (index, field, value) => {
        const newRundown = [...eventData.rundown];
        newRundown[index][field] = value;
        setEventData(prev => ({ ...prev, rundown: newRundown }));
    };

    const deleteRundown = (index) => {
        const newRundown = [...eventData.rundown];
        newRundown.splice(index, 1);
        setEventData(prev => ({ ...prev, rundown: newRundown }));
    };

    const addBudgetRow = () => {
        setEventData(prev => ({
            ...prev,
            budget: [...prev.budget, { description: "", source: "Kas Masjid", estimated: 0, actual: 0 }]
        }));
    };

    const updateBudget = (index, field, value) => {
        const newBudget = [...eventData.budget];
        newBudget[index][field] = value;
        setEventData(prev => ({ ...prev, budget: newBudget }));
    };

    const deleteBudget = (index) => {
        const newBudget = [...eventData.budget];
        newBudget.splice(index, 1);
        setEventData(prev => ({ ...prev, budget: newBudget }));
    };

    // Income Handlers
    const addIncomeItem = () => {
        setEventData(prev => ({
            ...prev,
            income: [...prev.income, { id: Date.now(), source: 'Kas Masjid', description: '', amount: '' }]
        }));
    };

    const updateIncome = (index, field, value) => {
        const newIncome = [...eventData.income];
        newIncome[index][field] = value;
        setEventData(prev => ({ ...prev, income: newIncome }));
    };

    const deleteIncome = (index) => {
        const newIncome = [...eventData.income];
        newIncome.splice(index, 1);
        setEventData(prev => ({ ...prev, income: newIncome }));
    };

    const handleAddStaff = () => {
        if (!newStaffId || !newStaffRole) {
            alert("Harap pilih petugas dan isi peran terlebih dahulu.");
            return;
        }

        const person = availableStaff.find(p => String(p.id) === String(newStaffId));
        if (!person) return;

        setEventData(prev => ({
            ...prev,
            staff: [...prev.staff, {
                id: Date.now(),
                personId: person.id,
                name: person.name,
                role: newStaffRole
            }]
        }));

        // Reset fields
        setNewStaffId("");
        setNewStaffRole("");
    };

    const handleAiGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateRundown(eventData);
            if (result && Array.isArray(result)) {
                setEventData(prev => ({
                    ...prev,
                    rundown: result
                }));
            }
        } catch (error) {
            console.error("AI Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAiGenerateBudget = async () => {
        setIsGenerating(true);
        try {
            const result = await generateBudget(eventData);
            if (result && Array.isArray(result)) {
                setEventData(prev => ({
                    ...prev,
                    budget: result
                }));
            }
        } catch (error) {
            console.error("AI Budget Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAiGenerateChecklist = async () => {
        setIsGenerating(true);
        try {
            const result = await generateChecklist(eventData);
            // Handle new Object format { checklist, risks } or old Array format
            const checklistItems = result.checklist || (Array.isArray(result) ? result : []);

            if (checklistItems.length > 0) {
                setEventData(prev => ({
                    ...prev,
                    checklist: checklistItems
                }));
                // TODO: Store/Display risks if needed (result.risks)
            }
        } catch (error) {
            console.error("AI Checklist Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleChecklistItem = (index) => {
        const newChecklist = [...eventData.checklist];
        newChecklist[index].completed = !newChecklist[index].completed;
        setEventData(prev => ({ ...prev, checklist: newChecklist }));
    };

    const handleAiGenerateDescription = async () => {
        setIsGenerating(true);
        try {
            const result = await generateDescription(eventData);
            if (result && result.description) {
                setEventData(prev => ({
                    ...prev,
                    description: result.description
                }));
            }
        } catch (error) {
            console.error("AI Description Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Budget Logic: Effective Cost = (Actual > 0) ? Actual : Estimate
    // "Bill as Incurred" model
    const totalEffectiveBudget = eventData.budget.reduce((acc, curr) => {
        const est = Number(curr.estimated || 0);
        const act = Number(curr.actual || 0);
        const effective = act > 0 ? act : est;
        return acc + effective;
    }, 0);

    const totalEstimatedInitial = eventData.budget.reduce((acc, curr) => acc + Number(curr.estimated || 0), 0);
    const totalActual = eventData.budget.reduce((acc, curr) => acc + Number(curr.actual || 0), 0);

    const fundingSourceSummary = eventData.budget.reduce((acc, curr) => {
        const source = curr.source || 'Lainnya';
        const est = Number(curr.estimated || 0);
        const act = Number(curr.actual || 0);
        const effective = act > 0 ? act : est;

        if (!acc[source]) acc[source] = 0;
        acc[source] += effective;
        return acc;
    }, {});

    const totalIncome = eventData.income.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    // Prevent interaction until data is fully loaded to avoid race conditions
    if (id && !isDataLoaded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="bg-[var(--card-bg)] p-6 rounded-full shadow-lg border border-[var(--border-color)]">
                    <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                </div>
                <p className="text-[var(--text-muted)] font-medium animate-pulse">Menyiapkan data acara...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/event-management')} className="mb-2 pl-0 hover:bg-transparent text-[var(--text-muted)] hover:text-[var(--primary)]">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Kembali ke Daftar
                    </Button>
                    <h2 className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight">Manajemen Acara</h2>
                    <p className="text-[var(--text-muted)] mt-1 font-medium">{eventData.title || "Buat rencana kegiatan baru"}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Status Draft</span>
                        <div className="flex items-center gap-2">
                            {saveStatus === 'saving' && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200 animate-pulse">
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...
                                </Badge>
                            )}
                            {saveStatus === 'saved' && (
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 transition-all duration-500">
                                    <Check className="w-3 h-3 mr-1" /> Saved
                                </Badge>
                            )}
                            {saveStatus === 'error' && (
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                    <AlertCircle className="w-3 h-3 mr-1" /> Error
                                </Badge>
                            )}
                        </div>
                    </div>
                    <Button variant="outline" className="gap-2 h-10 font-semibold border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--secondary)]" onClick={() => handleSave(false)} disabled={saveStatus === 'saving'}>
                        {saveStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} className="text-[var(--text-muted)]" />}
                        Simpan Draft
                    </Button>
                    <Button
                        disabled={progress < 50 || saveStatus === 'saving'}
                        className={cn("gap-2 h-10 font-bold px-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white", progress < 100 ? "opacity-70" : "animate-pulse")}
                        onClick={() => handleSave(true)}
                    >
                        {status === 'Published' ? 'Update Publikasi' : 'Publikasikan'}
                        <ArrowRight size={16} />
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start h-12 bg-[var(--card-bg)] border border-[var(--border-color)] p-1 mb-6 rounded-lg shadow-sm">
                    <TabsTrigger value="detail" className="flex-1 data-[state=active]:bg-[var(--primary-transparent)] data-[state=active]:text-[var(--primary)] text-[var(--text-muted)]">Detail Acara</TabsTrigger>
                    <TabsTrigger value="rundown" disabled={!isSaved} className="flex-1 data-[state=active]:bg-[var(--primary-transparent)] data-[state=active]:text-[var(--primary)] text-[var(--text-muted)]">Rundown</TabsTrigger>
                    <TabsTrigger value="anggaran" disabled={!isSaved} className="flex-1 data-[state=active]:bg-[var(--primary-transparent)] data-[state=active]:text-[var(--primary)] text-[var(--text-muted)]">Anggaran</TabsTrigger>
                    <TabsTrigger value="tim" disabled={!isSaved} className="flex-1 data-[state=active]:bg-[var(--primary-transparent)] data-[state=active]:text-[var(--primary)] text-[var(--text-muted)]">Tim Petugas</TabsTrigger>
                    <TabsTrigger value="log" disabled={!isSaved} className="flex-1 data-[state=active]:bg-[var(--primary-transparent)] data-[state=active]:text-[var(--primary)] text-[var(--text-muted)]">Log Aktivitas</TabsTrigger>
                </TabsList>

                <main className="w-full space-y-6">

                    {/* Main Content Area */}
                    {/* Removed wrapper div to allow full width for other tabs */}

                    {/* TAB: DETAIL ACARA */}
                    <TabsContent value="detail" className="space-y-6 animate-in fade-in-50">

                        {/* ROW 1: INFO UTAMA & STATUS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            {/* Left: Info Dasar */}
                            <div className="lg:col-span-2">
                                <Card className="glass-card border-[var(--border-color)] shadow-sm h-full">
                                    <CardHeader>
                                        <CardTitle className="text-[var(--text-main)]">Informasi Dasar</CardTitle>
                                        <CardDescription className="text-[var(--text-muted)]">Isi detail utama kegiatan masjid/baitulmal di sini.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-[var(--text-main)] font-semibold">Nama Kegiatan</Label>
                                            <Input
                                                id="title"
                                                placeholder="Contoh: Santunan Anak Yatim Muharram 1447H"
                                                className="text-base font-medium h-11 bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-main)]"
                                                value={eventData.title}
                                                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[var(--text-main)] font-semibold">Waktu Mulai</Label>
                                                <Input
                                                    type="datetime-local"
                                                    className="bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-main)] h-10"
                                                    value={eventData.startDate}
                                                    onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[var(--text-main)] font-semibold">Waktu Selesai</Label>
                                                <Input
                                                    type="datetime-local"
                                                    className="bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-main)] h-10"
                                                    value={eventData.endDate}
                                                    onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[var(--text-main)] font-semibold">Lokasi</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                                                <Input
                                                    className="pl-9 h-10 bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-main)]"
                                                    placeholder="Lokasi kegiatan, misal: Aula Masjid Utama"
                                                    value={eventData.location}
                                                    onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right: Status Event */}
                            <div className="lg:col-span-1">
                                <Card className="glass-card border-l-4 border-l-blue-600 border-[var(--border-color)] h-full">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base uppercase tracking-wider text-[var(--text-muted)]">Status Event</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-lg text-[var(--text-main)]">{status}</span>
                                            <Badge variant={status === 'Published' ? 'success' : 'secondary'}>{status}</Badge>
                                        </div>
                                        <Separator className="bg-[var(--border-color)]" />
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <Clock className="h-4 w-4 text-[var(--text-muted)] mt-1" />
                                                <div>
                                                    <p className="text-xs text-[var(--text-muted)] uppercase font-semibold">Waktu</p>
                                                    <p className="text-sm font-medium text-[var(--text-main)]">
                                                        {eventData.startDate ? new Date(eventData.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-muted)]">
                                                        {eventData.startDate ? new Date(eventData.startDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-4 w-4 text-[var(--text-muted)] mt-1" />
                                                <div>
                                                    <p className="text-xs text-[var(--text-muted)] uppercase font-semibold">Tempat</p>
                                                    <p className="text-sm font-medium max-w-[150px] truncate text-[var(--text-main)]" title={eventData.location || "Belum ditentukan"}>
                                                        {eventData.location || "Belum ditentukan"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {!isSaved && (
                                            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 flex gap-2">
                                                <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                                                <p className="text-xs text-yellow-800 leading-relaxed">
                                                    Simpan draft terlebih dahulu untuk mengisi Rundown dan Anggaran.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="bg-[var(--card-footer-bg)] p-4 border-t border-[var(--border-color)] mt-auto">
                                        <div className="w-full text-center text-xs text-[var(--text-muted)]">
                                            Terakhir diubah: Baru saja
                                        </div>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>

                        {/* ROW 2: DESKRIPSI & QUICK ACTIONS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            {/* Left: Deskripsi */}
                            <div className="lg:col-span-2">
                                <Card className="glass-card border-[var(--border-color)] shadow-sm h-full">
                                    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                                        <div>
                                            <CardTitle className="text-[var(--text-main)]">Deskripsi & Background</CardTitle>
                                            <CardDescription className="text-[var(--text-muted)]">Jelaskan tujuan dan konteks acara.</CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleAiGenerateDescription}
                                            disabled={isGenerating}
                                            className="text-xs text-[var(--info)] hover:text-[var(--text-main)] hover:bg-[var(--primary-transparent)]"
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            ) : (
                                                <Sparkles className="mr-2 h-3 w-3" />
                                            )}
                                            Bantu Buat Deskripsi (AI)
                                        </Button>

                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            className="min-h-[200px] font-sans leading-relaxed text-base bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-main)]"
                                            placeholder="Jelaskan detail acara..."
                                            value={eventData.description}
                                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right: Quick Actions */}
                            <div className="lg:col-span-1">
                                <Card className="glass-card border-[var(--border-color)] h-full">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-[var(--text-main)]">Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-2 relative">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-8 px-2 text-sm font-normal text-[var(--text-main)] hover:bg-[var(--secondary)]"
                                            onClick={() => handlePrintDocument('proposal')}
                                        >
                                            <FileText className="mr-2 h-4 w-4 text-blue-500" /> Cetak Proposal
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-8 px-2 text-sm font-normal text-[var(--text-main)] hover:bg-[var(--secondary)]"
                                            onClick={() => handlePrintDocument('sk')}
                                        >
                                            <Users className="mr-2 h-4 w-4 text-purple-500" /> Cetak SK Panitia
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-8 px-2 text-sm font-normal text-[var(--text-main)] hover:bg-[var(--secondary)]"
                                            onClick={() => handlePrintDocument('invitation')}
                                        >
                                            <Activity className="mr-2 h-4 w-4 text-green-500" /> Cetak Undangan
                                        </Button>

                                        <Button variant="ghost" className="justify-start h-8 px-2 text-sm font-normal text-[var(--text-main)] hover:bg-[var(--secondary)]">
                                            <Users className="mr-2 h-4 w-4" /> Share Link Panitia
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB: RUNDOWN */}
                    <TabsContent value="rundown" className="space-y-6 animate-in fade-in-50">
                        <Card className="glass-card border-[var(--border-color)] shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-[var(--text-main)]">Susunan Acara</CardTitle>
                                    <CardDescription className="text-[var(--text-muted)]">Atur jadwal kegiatan dari awal hingga akhir.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAiGenerate}
                                        disabled={isGenerating}
                                        className="border-[var(--border-color)] text-[var(--primary)] hover:bg-[var(--primary-transparent)] hover:text-[var(--primary-hover)]"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-3 w-3" />
                                                Auto Generate
                                            </>
                                        )}
                                    </Button>
                                    <Button size="sm" onClick={addRundownItem}>
                                        <Plus className="mr-2 h-4 w-4" /> Item
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider pb-2 border-b border-[var(--border-color)]">
                                        <div className="col-span-2">Waktu</div>
                                        <div className="col-span-4">Kegiatan</div>
                                        <div className="col-span-3">PIC</div>
                                        <div className="col-span-2">Catatan</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    {eventData.rundown.length === 0 ? (
                                        <div className="text-center py-12 text-[var(--text-muted)] border-2 border-dashed border-[var(--border-color)] rounded-lg">
                                            <Clock className="mx-auto h-8 w-8 mb-3 opacity-50 text-[var(--text-muted)]" />
                                            <p>Belum ada rundown acara</p>
                                            <Button variant="link" onClick={addRundownItem} className="text-[var(--primary)]">Mulai buat rundown</Button>
                                        </div>
                                    ) : (
                                        eventData.rundown.map((item, idx) => (
                                            <RundownItem
                                                key={idx}
                                                index={idx}
                                                item={item}
                                                onChange={updateRundown}
                                                onDelete={deleteRundown}
                                            />
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB: ANGGARAN */}
                    <TabsContent value="anggaran" className="space-y-6 animate-in fade-in-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-blue-600 text-white border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="text-sm font-medium text-blue-100 mb-1">Total Pemasukan</div>
                                    <div className="text-2xl font-bold">Rp {totalIncome.toLocaleString('id-ID')}</div>
                                    <div className="text-xs text-blue-200 mt-1">Total dari semua sumber dana</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-700 text-white border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="text-sm font-medium text-slate-300 mb-1">Total Estimasi Keluar</div>
                                    <div className="text-2xl font-bold">Rp {totalEffectiveBudget.toLocaleString('id-ID')}</div>
                                    <div className="text-xs text-slate-400 mt-1">Berdasarkan aktual & estimasi</div>
                                </CardContent>
                            </Card>
                            <Card className="glass-card border-[var(--border-color)]">
                                <CardContent className="p-6">
                                    <div className="text-sm font-medium text-[var(--text-muted)] mb-1">Realisasi (Terbayar)</div>
                                    <div className="text-2xl font-bold text-[var(--text-main)]">Rp {totalActual.toLocaleString('id-ID')}</div>
                                </CardContent>
                            </Card>
                            <Card className="glass-card border-[var(--border-color)]">
                                <CardContent className="p-6">
                                    <div className="text-sm font-medium text-[var(--text-muted)] mb-1">Estimasi Awal</div>
                                    <div className="text-2xl font-bold text-[var(--text-muted)]">
                                        Rp {totalEstimatedInitial.toLocaleString('id-ID')}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>



                        {/* Income Table */}
                        <Card className="glass-card border-[var(--border-color)] shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-[var(--primary)]">Rincian Sumber Pemasukan</CardTitle>
                                    <CardDescription className="text-[var(--text-muted)]">Catat sumber dana yang masuk.</CardDescription>
                                </div>
                                <Button onClick={addIncomeItem} size="sm" variant="outline" className="h-9 border-[var(--border-color)] text-[var(--primary)] hover:bg-[var(--primary-transparent)] hover:text-[var(--primary-hover)]">
                                    <Plus className="mr-2 h-4 w-4" /> Item Pemasukan
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border border-[var(--border-color)]">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-[var(--primary-transparent)] text-[var(--primary)] font-medium">
                                            <tr>
                                                <th className="py-2 px-2 w-[25%]">Sumber</th>
                                                <th className="py-2 px-2 w-[40%]">Keterangan</th>
                                                <th className="py-2 px-2 w-[20%] text-right">Nominal</th>
                                                <th className="py-2 px-2 w-[5%]"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eventData.income.length > 0 ? (
                                                eventData.income.map((item, index) => (
                                                    <IncomeRow
                                                        key={item.id}
                                                        index={index}
                                                        item={item}
                                                        onChange={updateIncome}
                                                        onDelete={deleteIncome}
                                                    />
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-[var(--text-muted)] italic bg-[var(--primary-transparent)] bg-opacity-30">
                                                        Belum ada data pemasukan. Klik tombol di atas untuk menambah.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>


                        <Card className="glass-card border-[var(--border-color)] shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-[var(--text-main)]">Rincian Biaya Pengeluaran</CardTitle>
                                    <CardDescription className="text-[var(--text-muted)]">Catat estimasi dan pengeluaran aktual.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAiGenerateBudget}
                                        disabled={isGenerating}
                                        className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="mr-2 h-3 w-3" />
                                        )}
                                        Auto Budget
                                    </Button>
                                    <Button size="sm" onClick={addBudgetRow} className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]">
                                        <Plus className="mr-2 h-4 w-4" /> Item Biaya
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto rounded-md border border-[var(--border-color)]">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-[var(--secondary)] text-[var(--text-muted)] font-medium">
                                            <tr>
                                                <th className="w-[40%] text-left py-2 px-2 font-medium">DESKRIPSI</th>
                                                <th className="w-[20%] text-right py-2 px-2 font-medium">ESTIMASI</th>
                                                <th className="w-[20%] text-right py-2 px-2 font-medium">AKTUAL</th>
                                                <th className="w-[5%]"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eventData.budget.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-8 text-[var(--text-muted)]">
                                                        Belum ada data anggaran
                                                    </td>
                                                </tr>
                                            ) : (
                                                eventData.budget.map((item, idx) => (
                                                    <BudgetRow
                                                        key={idx}
                                                        index={idx}
                                                        item={item}
                                                        onChange={updateBudget}
                                                        onDelete={deleteBudget}
                                                    />
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB: CHECKLIST */}
                    <TabsContent value="checklist" className="space-y-6 animate-in fade-in-50">
                        <Card className="glass-card border-[var(--border-color)] shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-[var(--text-main)]">Checklist Persiapan</CardTitle>
                                    <CardDescription className="text-[var(--text-muted)]">Daftar tugas operasional & antisipasi risiko.</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAiGenerateChecklist}
                                    disabled={isGenerating}
                                    className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-2 h-3 w-3" />
                                    )}
                                    Auto Checklist
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {eventData.checklist.length === 0 ? (
                                    <div className="text-center py-12 text-[var(--text-muted)] border-2 border-dashed border-[var(--border-color)] rounded-lg">
                                        <Check className="mx-auto h-8 w-8 mb-3 opacity-50" />
                                        <p>Belum ada checklist persiapan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {eventData.checklist.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--primary-transparent)] transition-colors">
                                                <div className="pt-0.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.completed}
                                                        onChange={() => toggleChecklistItem(idx)}
                                                        className="w-5 h-5 rounded border-[var(--border-color)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className={cn("font-medium text-[var(--text-main)]", item.completed && "text-[var(--text-muted)] line-through")}>
                                                        {item.item}
                                                    </div>
                                                    <div className="text-xs text-[var(--text-muted)] mt-1 flex gap-2">
                                                        <Badge variant="outline" className="text-[var(--text-muted)] font-normal border-[var(--border-color)]">{item.category}</Badge>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Badge className={cn(
                                                        item.priority === 'high' ? "bg-red-100 text-red-700 hover:bg-red-100" :
                                                            item.priority === 'medium' ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                                                                "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                                    )}>
                                                        {item.priority === 'high' ? 'Penting' : item.priority === 'medium' ? 'Menengah' : 'Normal'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB: TIM PETUGAS */}
                    <TabsContent value="tim" className="space-y-6 animate-in fade-in-50">
                        <Card className="glass-card border-[var(--border-color)] shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-[var(--text-main)]">Panitia & Petugas</CardTitle>
                                    <CardDescription className="text-[var(--text-muted)]">Siapa saja yang terlibat dalam acara ini.</CardDescription>
                                </div>
                                <Button size="sm" className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]">
                                    <Users className="mr-2 h-4 w-4" /> Undang Anggota
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 space-y-2 w-full">
                                        <Label className="text-[var(--text-main)]">Pilih Anggota dari Database</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--text-main)]"
                                            id="staffSelect"
                                            value={newStaffId}
                                            onChange={(e) => setNewStaffId(e.target.value)}
                                        >
                                            <option value="">-- Pilih Pengurus --</option>
                                            {availableStaff.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1 space-y-2 w-full">
                                        <Label className="text-[var(--text-main)]">Peran di Event Ini</Label>
                                        <Input
                                            id="roleInput"
                                            placeholder="Contoh: Koordinator Konsumsi"
                                            className="bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-main)]"
                                            value={newStaffRole}
                                            onChange={(e) => setNewStaffRole(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleAddStaff}
                                        className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Tambah
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {eventData.staff.length === 0 ? (
                                        <div className="text-center py-12 text-[var(--text-muted)] border-2 border-dashed border-[var(--border-color)] rounded-lg">
                                            <Users className="mx-auto h-12 w-12 mb-4 text-[var(--text-muted)] opacity-50" />
                                            <h3 className="text-lg font-medium text-[var(--text-main)]">Belum ada panitia</h3>
                                            <p className="mb-4">Pilih anggota dari dropdown di atas untuk menambahkan tim.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {eventData.staff.map(member => (
                                                <div key={member.id} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg bg-[var(--input-bg)] hover:bg-[var(--primary-transparent)] transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-[var(--primary-transparent)] flex items-center justify-center text-[var(--primary)] font-bold shrink-0">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm text-[var(--text-main)]">{member.name}</div>
                                                            <div className="text-xs text-[var(--text-muted)]">{member.role}</div>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        const newStaff = eventData.staff.filter(s => s.id !== member.id);
                                                        setEventData(prev => ({ ...prev, staff: newStaff }));
                                                    }}>
                                                        <Trash2 size={16} className="text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB: LOG */}
                    <TabsContent value="log" className="animate-in fade-in-50">
                        <Card className="glass-card border-[var(--border-color)] shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-[var(--text-main)]">Log Aktivitas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="flex gap-4 p-3 rounded-lg bg-[var(--primary-transparent)] hover:bg-[var(--primary)] hover:bg-opacity-20 transition-colors">
                                            <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-[var(--text-main)]">Budi Santoso memperbarui Rundown</p>
                                                <p className="text-xs text-[var(--text-muted)]">2 menit yang lalu • 28 Jan 2026</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>


                </main>
            </Tabs>

            {/* ========== Hidden Print Container ========== */}
            <div style={{ position: 'absolute', top: 0, left: -10000, width: '210mm', zIndex: -1000 }}>
                <div ref={printRef}>
                    {printMode === 'proposal' && (
                        <OfficialDocumentTemplate
                            title="PROPOSAL KEGIATAN"
                            documentNo={`PROP/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`}
                            date={new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            signer={signer}
                        >
                            <div className="space-y-6 text-sm font-serif text-black">

                                {/* 1. Header Info */}
                                <div>
                                    <table className="w-full border-collapse mb-4">
                                        <tbody>
                                            <tr>
                                                <td className="w-40 py-1 font-semibold">Nama Kegiatan</td>
                                                <td className="w-4">:</td>
                                                <td>{eventData.title || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 font-semibold">Waktu Pelaksanaan</td>
                                                <td>:</td>
                                                <td>
                                                    {eventData.startDate ? new Date(eventData.startDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                                    {' s/d '}
                                                    {eventData.endDate ? new Date(eventData.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 font-semibold">Tempat</td>
                                                <td>:</td>
                                                <td>{eventData.location || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* 2. Latar Belakang / Deskripsi */}
                                <div>
                                    <h3 className="font-bold border-b border-black mb-2 uppercase text-sm">A. Deskripsi & Tujuan</h3>
                                    <div className="whitespace-pre-wrap leading-relaxed text-justify">
                                        {eventData.description || 'Belum ada deskripsi.'}
                                    </div>
                                </div>

                                {/* 3. Rundown */}
                                <div>
                                    <h3 className="font-bold border-b border-black mb-2 uppercase text-sm">B. Susunan Acara</h3>
                                    <table className="w-full border-collapse border border-black text-xs">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border border-black p-2 text-center w-32">Waktu</th>
                                                <th className="border border-black p-2 text-center">Kegiatan</th>
                                                <th className="border border-black p-2 text-center w-32">PIC</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eventData.rundown.length > 0 ? (
                                                eventData.rundown.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="border border-black p-2 text-center font-mono">
                                                            {item.startTime} - {item.endTime}
                                                        </td>
                                                        <td className="border border-black p-2">{item.activity}</td>
                                                        <td className="border border-black p-2 text-center">{item.pic}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={3} className="border border-black p-4 text-center italic">Belum ada data rundown</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 4. Anggaran */}
                                <div>
                                    <h3 className="font-bold border-b border-black mb-2 uppercase text-sm">C. Rencana Anggaran Biaya</h3>
                                    <table className="w-full border-collapse border border-black text-xs">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border border-black p-2 text-center w-10">No</th>
                                                <th className="border border-black p-2 text-left">Uraian</th>
                                                <th className="border border-black p-2 text-right w-32">Jumlah (Rp)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eventData.budget.length > 0 ? (
                                                <>
                                                    {eventData.budget.map((item, i) => (
                                                        <tr key={i}>
                                                            <td className="border border-black p-2 text-center">{i + 1}</td>
                                                            <td className="border border-black p-2">
                                                                <div className="font-semibold">{item.description}</div>
                                                            </td>
                                                            <td className="border border-black p-2 text-right font-mono">
                                                                {Number(item.estimated || 0).toLocaleString('id-ID')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="font-bold bg-gray-50">
                                                        <td colSpan={2} className="border border-black p-2 text-right">TOTAL</td>
                                                        <td className="border border-black p-2 text-right font-mono">
                                                            {Number(eventData.budget.reduce((a, b) => a + Number(b.estimated || 0), 0)).toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                </>
                                            ) : (
                                                <tr><td colSpan={3} className="border border-black p-4 text-center italic">Belum ada data anggaran</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 5. Rincian Sumber Pemasukan (New) */}
                                <div>
                                </div>

                                {/* 5. Rincian Sumber Pemasukan (New) */}
                                <div>
                                    <h3 className="font-bold border-b border-black mb-2 uppercase text-sm">D. Rincian Sumber Pemasukan</h3>
                                    <table className="w-full border-collapse border border-black text-xs mb-4">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border border-black p-2 text-center w-10">No</th>
                                                <th className="border border-black p-2 text-left">Sumber</th>
                                                <th className="border border-black p-2 text-left">Keterangan</th>
                                                <th className="border border-black p-2 text-right w-32">Nominal (Rp)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eventData.income.length > 0 ? (
                                                <>
                                                    {eventData.income.map((item, i) => (
                                                        <tr key={i}>
                                                            <td className="border border-black p-2 text-center">{i + 1}</td>
                                                            <td className="border border-black p-2 font-semibold text-xs">{item.source}</td>
                                                            <td className="border border-black p-2">{item.description || '-'}</td>
                                                            <td className="border border-black p-2 text-right font-mono">
                                                                {Number(item.amount || 0).toLocaleString('id-ID')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="font-bold bg-gray-50">
                                                        <td colSpan={3} className="border border-black p-2 text-right">TOTAL PEMASUKAN</td>
                                                        <td className="border border-black p-2 text-right font-mono">
                                                            {Number(eventData.income.reduce((a, b) => a + Number(b.amount || 0), 0)).toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                </>
                                            ) : (
                                                <tr><td colSpan={4} className="border border-black p-4 text-center italic">Belum ada data pemasukan</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 6. Checklist Persiapan (New) */}
                                <div>
                                    <h3 className="font-bold border-b border-black mb-2 uppercase text-sm">E. Checklist Persiapan</h3>
                                    <table className="w-full border border-black border-collapse text-xs mb-4">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border border-black p-2 text-center w-10">No</th>
                                                <th className="border border-black p-2 text-left">Item / Tugas</th>
                                                <th className="border border-black p-2 text-center w-32">Kategori</th>
                                                <th className="border border-black p-2 text-center w-24">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eventData.checklist.length > 0 ? (
                                                eventData.checklist.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="border border-black p-2 text-center">{i + 1}</td>
                                                        <td className="border border-black p-2">{item.item}</td>
                                                        <td className="border border-black p-2 text-center">{item.category}</td>
                                                        <td className="border border-black p-2 text-center">
                                                            {item.completed ? 'Selesai' : 'Belum'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={4} className="border border-black p-4 text-center italic">Belum ada data checklist</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 7. Susunan Panitia (New) */}
                                <div>
                                    <h3 className="font-bold border-b border-black mb-2 uppercase text-sm">F. Susunan Panitia</h3>
                                    <table className="w-full border border-black border-collapse text-xs mb-4">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border border-black p-2 text-center w-10">No</th>
                                                <th className="border border-black p-2 text-left">Nama</th>
                                                <th className="border border-black p-2 text-left">Peran / Jabatan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eventData.staff.length > 0 ? (
                                                eventData.staff.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="border border-black p-2 text-center">{i + 1}</td>
                                                        <td className="border border-black p-2 font-semibold">{item.name}</td>
                                                        <td className="border border-black p-2">{item.role}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={3} className="border border-black p-4 text-center italic">Belum ada susunan panitia</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </OfficialDocumentTemplate>
                    )}

                    {printMode === 'sk' && (
                        <SKPanitiaTemplate
                            eventData={eventData}
                            signer={signer}
                            date={new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        />
                    )}

                    {printMode === 'invitation' && (
                        <InvitationTemplate
                            eventData={eventData}
                            signer={signer}
                            date={new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventManagement;
