import React, { useState, useEffect, useRef } from 'react';
import {
    Calendar, Plus, Edit2, Trash2, Users, Printer, Loader2,
    CheckCircle2, Clock, AlertCircle, FileText
} from 'lucide-react';

// API Services
import { fetchEvents, createEvent, updateEvent, deleteEvent, fetchEventAssignments } from '../services/eventApi';
import { fetchActiveSigner } from '../services/documentApi';

// Components
import EventFormModal from '../components/Modals/EventFormModal';
import AssignPeopleModal from '../components/Modals/AssignPeopleModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import OfficialDocumentTemplate from '../components/Print/OfficialDocumentTemplate';
import { usePagePrint } from '../hooks/usePagePrint';

/**
 * EventManagement - Main Page for Event/Panitia Management
 * 
 * Features:
 * - List all events (table view)
 * - Create/Edit/Delete events
 * - Assign people to events
 * - Print SK Panitia with dynamic signer
 */
const EventManagement = () => {

    // ========== State ==========
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal States
    const [eventModal, setEventModal] = useState({ open: false, data: null });
    const [assignModal, setAssignModal] = useState({ open: false, event: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, loading: false });

    // Form submission state
    const [submitting, setSubmitting] = useState(false);

    // Print States
    const [printData, setPrintData] = useState({ event: null, assignments: [], signer: null });
    const printRef = useRef(null);
    const handlePrint = usePagePrint(printRef, 'SK Panitia');

    // ========== Data Loading ==========
    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchEvents();
            if (res.success) {
                setEvents(res.data);
            } else {
                setError(res.message || 'Gagal memuat data');
            }
        } catch (err) {
            console.error('Failed to load events:', err);
            setError('Terjadi kesalahan saat memuat data');
        } finally {
            setLoading(false);
        }
    };

    // ========== CRUD Handlers ==========

    // Create or Update Event
    const handleSaveEvent = async (formData) => {
        setSubmitting(true);
        try {
            let res;
            if (eventModal.data) {
                // Update mode
                res = await updateEvent(eventModal.data.id, formData);
            } else {
                // Create mode
                res = await createEvent(formData);
            }

            if (res.success) {
                setEventModal({ open: false, data: null });
                await loadEvents(); // Reload table
            } else {
                alert('Gagal menyimpan: ' + res.message);
            }
        } catch (err) {
            console.error('Save error:', err);
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : (err.response?.data?.message || 'Terjadi kesalahan');
            alert('Gagal menyimpan: ' + msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Event
    const handleDelete = async () => {
        if (!deleteModal.id) return;

        setDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            const res = await deleteEvent(deleteModal.id);
            if (res.success) {
                setDeleteModal({ open: false, id: null, loading: false });
                await loadEvents();
            } else {
                alert('Gagal menghapus: ' + res.message);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Terjadi kesalahan');
        } finally {
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    // ========== Print Handler ==========
    const handlePrintSK = async (event) => {
        try {
            // Fetch assignments for this event
            const assignRes = await fetchEventAssignments(event.id);

            // Fetch signer (Ketua Baitulmall) 
            const signerRes = await fetchActiveSigner('BAITULMALL_2023', 'Ketua Umum');

            setPrintData({
                event: event,
                assignments: assignRes.data || [],
                signer: signerRes.success ? signerRes.data : null
            });

            // Delay to allow state update, then print
            setTimeout(() => {
                handlePrint();
            }, 200);
        } catch (err) {
            console.error('Print error:', err);
            alert('Gagal menyiapkan dokumen');
        }
    };

    // ========== Helper Functions ==========
    const getStatusBadge = (event) => {
        const today = new Date();
        const start = new Date(event.tanggal_mulai);
        const end = event.tanggal_selesai ? new Date(event.tanggal_selesai) : null;

        if (!event.is_active) {
            return { label: 'Selesai', color: 'var(--text-muted)', bg: 'rgba(100,100,100,0.2)' };
        }
        if (end && today > end) {
            return { label: 'Berakhir', color: 'var(--warning)', bg: 'rgba(245,158,11,0.2)' };
        }
        if (today >= start) {
            return { label: 'Berjalan', color: 'var(--success)', bg: 'rgba(34,197,94,0.2)' };
        }
        return { label: 'Mendatang', color: 'var(--info)', bg: 'rgba(59,130,246,0.2)' };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // ========== Render ==========
    return (
        <div className="event-management">
            {/* Header */}
            <header className="header" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Calendar className="text-primary" />
                            Manajemen Event & Panitia
                        </h1>
                        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                            Kelola kegiatan, proyek, dan tim panitia secara terpusat
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setEventModal({ open: true, data: null })}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> Tambah Event
                    </button>
                </div>
            </header>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--primary)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Event</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{events.length}</div>
                </div>
                <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--success)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sedang Berjalan</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                        {events.filter(e => getStatusBadge(e).label === 'Berjalan').length}
                    </div>
                </div>
                <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--info)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mendatang</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--info)' }}>
                        {events.filter(e => getStatusBadge(e).label === 'Mendatang').length}
                    </div>
                </div>
                <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--text-muted)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selesai</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {events.filter(e => getStatusBadge(e).label === 'Selesai' || getStatusBadge(e).label === 'Berakhir').length}
                    </div>
                </div>
            </div>

            {/* Events Table */}
            <div className="glass-card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat data...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
                        <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
                        <p>{error}</p>
                        <button className="btn btn-ghost" onClick={loadEvents} style={{ marginTop: '1rem' }}>
                            Coba Lagi
                        </button>
                    </div>
                ) : events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>Belum ada event/kegiatan yang terdaftar</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setEventModal({ open: true, data: null })}
                            style={{ marginTop: '1rem' }}
                        >
                            Buat Event Pertama
                        </button>
                    </div>
                ) : (
                    <table className="table-compact" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Nama Event</th>
                                <th>Kode</th>
                                <th>Tipe</th>
                                <th>Periode</th>
                                <th>Status</th>
                                <th style={{ width: '180px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => {
                                const status = getStatusBadge(event);
                                return (
                                    <tr key={event.id}>
                                        <td style={{ fontWeight: 600 }}>{event.nama_struktur}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {event.kode_struktur}
                                        </td>
                                        <td>{event.tipe}</td>
                                        <td style={{ fontSize: '0.85rem' }}>
                                            {formatDate(event.tanggal_mulai)} - {formatDate(event.tanggal_selesai)}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                background: status.bg,
                                                color: status.color,
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ padding: '0.4rem' }}
                                                    onClick={() => setAssignModal({ open: true, event })}
                                                    title="Kelola Panitia"
                                                >
                                                    <Users size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ padding: '0.4rem', color: 'var(--primary)' }}
                                                    onClick={() => handlePrintSK(event)}
                                                    title="Cetak SK"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ padding: '0.4rem' }}
                                                    onClick={() => setEventModal({ open: true, data: event })}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ padding: '0.4rem', color: 'var(--danger)' }}
                                                    onClick={() => setDeleteModal({ open: true, id: event.id, loading: false })}
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ========== Modals ========== */}

            {/* Event Form Modal (Create/Edit) */}
            <EventFormModal
                open={eventModal.open}
                onClose={() => setEventModal({ open: false, data: null })}
                onSubmit={handleSaveEvent}
                initialData={eventModal.data}
                loading={submitting}
            />

            {/* Assign People Modal */}
            <AssignPeopleModal
                open={assignModal.open}
                onClose={() => setAssignModal({ open: false, event: null })}
                event={assignModal.event}
                onUpdate={loadEvents}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                open={deleteModal.open}
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ open: false, id: null, loading: false })}
                loading={deleteModal.loading}
            />

            {/* ========== Hidden Print Container ========== */}
            <div style={{ position: 'absolute', top: 0, left: -10000, width: '210mm', zIndex: -1000 }}>
                <div ref={printRef}>
                    {printData.event && (
                        <OfficialDocumentTemplate
                            title="SURAT KEPUTUSAN PANITIA"
                            documentNo={`SK/${printData.event.kode_struktur}`}
                            signer={printData.signer}
                        >
                            <div style={{ padding: '1rem 0' }}>
                                <p style={{ marginBottom: '1rem' }}>
                                    Berdasarkan musyawarah pengurus Baitulmall Fajar Maqbul, dengan ini ditetapkan
                                    susunan panitia untuk kegiatan:
                                </p>

                                <table style={{ width: '100%', marginBottom: '1.5rem', fontSize: '1rem' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '150px', padding: '0.25rem 0' }}>Nama Kegiatan</td>
                                            <td style={{ width: '20px' }}>:</td>
                                            <td style={{ fontWeight: 700 }}>{printData.event.nama_struktur}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '0.25rem 0' }}>Kode</td>
                                            <td>:</td>
                                            <td>{printData.event.kode_struktur}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '0.25rem 0' }}>Periode</td>
                                            <td>:</td>
                                            <td>{formatDate(printData.event.tanggal_mulai)} - {formatDate(printData.event.tanggal_selesai)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Susunan Panitia:</p>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f5f5f5' }}>
                                            <th style={{ border: '1px solid #000', padding: '0.5rem', width: '40px' }}>No</th>
                                            <th style={{ border: '1px solid #000', padding: '0.5rem' }}>Nama</th>
                                            <th style={{ border: '1px solid #000', padding: '0.5rem', width: '150px' }}>Jabatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {printData.assignments.map((a, idx) => (
                                            <tr key={a.id}>
                                                <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>{idx + 1}</td>
                                                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{a.person?.nama_lengkap || '-'}</td>
                                                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{a.jabatan}</td>
                                            </tr>
                                        ))}
                                        {printData.assignments.length === 0 && (
                                            <tr>
                                                <td colSpan="3" style={{ border: '1px solid #000', padding: '1rem', textAlign: 'center', fontStyle: 'italic' }}>
                                                    Belum ada panitia yang ditugaskan
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <p style={{ marginTop: '1.5rem' }}>
                                    Demikian surat keputusan ini dibuat untuk dapat dilaksanakan dengan penuh tanggung jawab.
                                </p>
                            </div>
                        </OfficialDocumentTemplate>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventManagement;
