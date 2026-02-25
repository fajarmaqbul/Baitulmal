import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
    Calendar,
    MapPin,
    User,
    Save,
    ArrowLeft,
    Plus,
    X,
    Clock,
    CheckCircle,
    ChevronDown,
    AlertCircle,
    Loader2,
    Eye,
    Globe,
    Lock,
    Building,
    Users,
    Tag,
    FileText
} from 'lucide-react';

// ===== UTILITY FUNCTIONS =====
const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
};

const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Format Tanggal Salah';
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// ===== LOADING COMPONENT =====
const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center p-20">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full absolute top-0 animate-spin"></div>
        </div>
        <p className="mt-6 text-lg font-semibold" style={{ color: 'var(--text-muted)' }}>Memuat Editor Agenda...</p>
    </div>
);

// ===== MAIN EDITOR COMPONENT =====
const AgendaEditor = ({ title, content, onTitleChange, onContentChange }) => {
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        const words = content.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
    }, [content]);

    return (
        <div className="card shadow-sm flex flex-col mb-0" style={{ border: '1px solid var(--border-color)', borderRadius: '24px', overflow: 'hidden', background: 'var(--card-bg)' }}>
            {/* Editor Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.01)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(0,144,231,0.08)', borderRadius: '12px', color: 'var(--primary)' }}>
                            <FileText size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Editor Konten</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8 }}>Tulis detail agenda dengan lengkap</p>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, background: 'var(--background)', padding: '4px 12px', borderRadius: '20px' }}>
                        {wordCount} KATA
                    </div>
                </div>
            </div>

            {/* Title Input */}
            <div style={{ padding: '2rem 2rem 1.5rem' }}>
                <input
                    type="text"
                    placeholder="Judul agenda yang menarik..."
                    style={{
                        width: '100%',
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        letterSpacing: '-0.5px',
                        outline: 'none',
                        lineHeight: 1.2
                    }}
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    maxLength={200}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, fontStyle: 'italic' }}>
                        Contoh: "Shalat Jumat Bersama & Kultum"
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: title.length > 180 ? 'var(--danger)' : 'var(--text-muted)', opacity: 0.6 }}>
                        {title.length} / 200
                    </span>
                </div>
            </div>

            {/* Content Editor */}
            <div style={{ flex: 1, padding: '0 2rem 2rem' }}>
                <textarea
                    style={{
                        width: '100%',
                        minHeight: '450px',
                        resize: 'none',
                        outline: 'none',
                        fontSize: '1rem',
                        color: 'var(--text-main)',
                        lineHeight: 1.6,
                        background: 'transparent',
                        border: 'none',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '1.5rem',
                        fontWeight: 400
                    }}
                    placeholder="Mulai menulis detail agenda di sini..."
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    rows={15}
                />
            </div>
        </div>
    );
};

// ===== PUBLISHING SIDEBAR =====
const PublishingPanel = ({
    status,
    onStatusChange,
    scheduleDate,
    onScheduleDateChange,
    location,
    onLocationChange,
    onSave,
    isSaving,
    isDirty
}) => {
    const statusOptions = [
        { value: 'draft', label: 'Draft', icon: Lock, color: 'var(--warning)', bg: 'rgba(255,171,0,0.08)' },
        { value: 'published', label: 'Published', icon: Globe, color: 'var(--success)', bg: 'rgba(0,210,91,0.08)' }
    ];

    return (
        <div className="card shadow-sm" style={{ border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.01)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(0,144,231,0.08)', borderRadius: '10px', color: 'var(--primary)' }}>
                    <CheckCircle size={18} strokeWidth={2.5} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Publikasi</h3>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 4px 12px rgba(0, 97, 242, 0.2)' }}
                >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>{isDirty ? 'SIMPAN PERUBAHAN' : 'SUDAH TERSIMPAN'}</span>
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status Agenda</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {statusOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => onStatusChange(opt.value)}
                                style={{
                                    padding: '1rem 0.5rem',
                                    borderRadius: '12px',
                                    border: '2px solid',
                                    borderColor: status === opt.value ? opt.color : 'var(--border-color)',
                                    background: status === opt.value ? opt.bg : 'transparent',
                                    color: status === opt.value ? opt.color : 'var(--text-muted)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontWeight: 700,
                                    fontSize: '0.85rem'
                                }}
                            >
                                <opt.icon size={18} strokeWidth={2.5} />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} /> Waktu Kegiatan
                    </label>
                    <input
                        type="datetime-local"
                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', background: 'var(--background)' }}
                        value={scheduleDate}
                        onChange={(e) => onScheduleDateChange(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} /> Lokasi
                    </label>
                    <input
                        type="text"
                        placeholder="Lokasi kegiatan..."
                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', background: 'var(--background)' }}
                        value={location}
                        onChange={(e) => onLocationChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

// ===== ASSIGNMENT PANEL =====
const AssignmentPanel = ({
    assignments,
    people,
    selectedRole,
    onRoleChange,
    selectedPerson,
    onPersonChange,
    onAddAssignment,
    onRemoveAssignment,
    hasPostId
}) => {
    return (
        <div className="card shadow-sm" style={{ border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.01)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(102, 16, 242, 0.08)', color: '#6610f2' }}>
                    <Users size={18} strokeWidth={2.5} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tim Petugas</h3>
            </div>

            <div style={{ padding: '1.5rem' }}>
                {!hasPostId ? (
                    <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,171,0,0.08)', borderRadius: '12px', border: '1px solid rgba(255,171,0,0.1)' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 700 }}>SIMPAN AGENDA UNTUK MENAMBAH PETUGAS</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {assignments.map((assignment) => (
                            <div key={assignment.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--background)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                                <div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px' }}>{assignment.jabatan}</span>
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{assignment.person?.nama_lengkap}</h4>
                                </div>
                                <button onClick={() => onRemoveAssignment(assignment.id)} style={{ padding: '4px', borderRadius: '50%', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer' }} className="hover-danger">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {hasPostId && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600, background: 'var(--background)' }}
                                    value={selectedRole}
                                    onChange={(e) => onRoleChange(e.target.value)}
                                >
                                    <option value="Koordinator">Koordinator</option>
                                    <option value="Penceramah">Penceramah</option>
                                    <option value="Imam">Imam</option>
                                    <option value="MC">MC</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Personel</label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600, background: 'var(--background)' }}
                                    value={selectedPerson}
                                    onChange={(e) => onPersonChange(e.target.value)}
                                >
                                    <option value="">-- Pilih Personel --</option>
                                    {(people || []).map(p => <option key={p.id} value={p.id}>{p.nama_lengkap}</option>)}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={onAddAssignment}
                            disabled={!selectedPerson}
                            className="btn btn-ghost"
                            style={{
                                width: '100%',
                                border: `1px dashed ${!selectedPerson ? 'var(--border-color)' : 'var(--primary)'}`,
                                borderRadius: '10px',
                                fontWeight: 700,
                                color: !selectedPerson ? 'var(--text-muted)' : 'var(--primary)',
                                padding: '0.75rem',
                                cursor: !selectedPerson ? 'not-allowed' : 'pointer',
                                opacity: !selectedPerson ? 0.6 : 1
                            }}
                        >
                            <Plus size={16} className="me-1" /> TAMBAH PETUGAS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ===== MAIN PAGE COMPONENT =====
const AgendaEditorPage = () => {
    const { eventId, postId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ title: '', content: '', scheduleDate: '', location: '', status: 'draft' });
    const [assignments, setAssignments] = useState([]);
    const [people, setPeople] = useState([]);
    const [assignmentForm, setAssignmentForm] = useState({ role: 'Koordinator', person: '' });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const peopleRes = await api.get('/people').catch(err => {
                    console.error('Failed to fetch people:', err);
                    return { data: { data: [] } };
                });
                // Robust check for array
                let peopleList = [];
                if (peopleRes?.data?.data && Array.isArray(peopleRes.data.data)) {
                    peopleList = peopleRes.data.data;
                } else if (Array.isArray(peopleRes?.data)) {
                    peopleList = peopleRes.data;
                }
                setPeople(peopleList);

                if (postId) {
                    const postRes = await api.get(`/agenda-posts/${postId}`).catch(() => null);
                    if (postRes?.data?.success) {
                        const post = postRes.data.data;
                        setFormData({
                            title: post.title || '',
                            content: post.content || '',
                            scheduleDate: formatDateTimeLocal(post.schedule_date),
                            location: post.location || '',
                            status: post.status || 'draft'
                        });
                        setAssignments(post.assignments || []);
                    }
                } else {
                    const now = new Date();
                    now.setHours(now.getHours() + 1);
                    setFormData(prev => ({ ...prev, scheduleDate: formatDateTimeLocal(now.toISOString()) }));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [postId]);

    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    }, []);

    const handleSave = async () => {
        if (!formData.title.trim()) return alert('Judul wajib diisi');
        setSaving(true);
        try {
            const payload = { event_id: eventId, ...formData, schedule_date: formData.scheduleDate };
            const res = postId
                ? await api.put(`/agenda-posts/${postId}`, payload)
                : await api.post('/agenda-posts', payload);

            if (res.data.success) {
                if (!postId) navigate(`/events/${eventId}/agenda/${res.data.data.id}/edit`, { replace: true });
                setIsDirty(false);
                alert('Berhasil disimpan!');
            }
        } catch (error) {
            alert('Gagal menyimpan agenda.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddAssignment = async () => {
        if (!postId || !assignmentForm.person) return;
        try {
            await api.post(`/agenda-posts/${postId}/assign`, {
                person_id: assignmentForm.person,
                jabatan: assignmentForm.role
            });
            const res = await api.get(`/agenda-posts/${postId}`);
            setAssignments(res.data.data.assignments || []);
            setAssignmentForm(prev => ({ ...prev, person: '' }));
        } catch (err) { alert('Gagal menambah petugas'); }
    };

    const handleRemoveAssignment = async (id) => {
        if (!confirm('Hapus?')) return;
        try {
            await api.delete(`/assignments/${id}`);
            setAssignments(prev => prev.filter(a => a.id !== id));
        } catch (err) { alert('Gagal menghapus'); }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="animate-fade-in p-2">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 btn-secondary border border-slate-200 rounded-xl hover-shadow transition-colors">
                    <ArrowLeft size={20} className="text-muted" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{postId ? 'Edit Agenda' : 'Buat Agenda Baru'}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <AgendaEditor
                        title={formData.title}
                        content={formData.content}
                        onTitleChange={(v) => handleFormChange('title', v)}
                        onContentChange={(v) => handleFormChange('content', v)}
                    />
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <PublishingPanel
                        {...formData}
                        onStatusChange={(v) => handleFormChange('status', v)}
                        onScheduleDateChange={(v) => handleFormChange('scheduleDate', v)}
                        onLocationChange={(v) => handleFormChange('location', v)}
                        onSave={handleSave}
                        isSaving={saving}
                        isDirty={isDirty}
                    />
                    <AssignmentPanel
                        assignments={assignments}
                        people={people}
                        selectedRole={assignmentForm.role}
                        onRoleChange={(v) => setAssignmentForm(p => ({ ...p, role: v }))}
                        selectedPerson={assignmentForm.person}
                        onPersonChange={(v) => setAssignmentForm(p => ({ ...p, person: v }))}
                        onAddAssignment={handleAddAssignment}
                        onRemoveAssignment={handleRemoveAssignment}
                        hasPostId={!!postId}
                    />
                </div>
            </div>
        </div>
    );
};

export default AgendaEditorPage;