import React, { useState, useEffect } from 'react';
import { X as XIcon, UserPlus, Search, Loader2, Trash2 } from 'lucide-react';
import { fetchPeopleList, assignPersonToEvent, removeAssignment, fetchEventAssignments } from '../../services/eventApi';

/**
 * AssignPeopleModal - Assign People to Event
 * 
 * @param {boolean} open - Modal visibility
 * @param {function} onClose - Close handler
 * @param {object} event - The event/structure to assign people to
 * @param {function} onUpdate - Callback after assignment changes
 */
const AssignPeopleModal = ({ open, onClose, event, onUpdate }) => {

    // State
    const [people, setPeople] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [jabatan, setJabatan] = useState('Anggota');
    const [submitting, setSubmitting] = useState(false);

    // Load data when modal opens
    useEffect(() => {
        if (open && event) {
            loadData();
        }
    }, [open, event]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [peopleRes, assignmentsRes] = await Promise.all([
                fetchPeopleList(searchTerm),
                fetchEventAssignments(event.id)
            ]);
            setPeople(peopleRes.data || []);
            setAssignments(assignmentsRes.data || []);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle search
    const handleSearch = async () => {
        const res = await fetchPeopleList(searchTerm);
        setPeople(res.data || []);
    };

    // Handle assign person
    const handleAssign = async () => {
        if (!selectedPerson) {
            alert('Pilih orang terlebih dahulu');
            return;
        }

        // Check if already assigned
        if (assignments.some(a => a.person_id === selectedPerson.id)) {
            alert('Orang ini sudah ditugaskan ke event ini');
            return;
        }

        setSubmitting(true);
        try {
            const res = await assignPersonToEvent({
                person_id: selectedPerson.id,
                structure_id: event.id,
                jabatan: jabatan,
                tanggal_mulai: event.tanggal_mulai
            });

            if (res.success) {
                // Reload assignments
                const updatedAssignments = await fetchEventAssignments(event.id);
                setAssignments(updatedAssignments.data || []);
                setSelectedPerson(null);
                setJabatan('Anggota');
                onUpdate?.();
            } else {
                alert('Gagal menugaskan: ' + res.message);
            }
        } catch (err) {
            console.error('Failed to assign:', err);
            alert('Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle remove assignment
    const handleRemove = async (assignmentId) => {
        if (!confirm('Hapus penugasan ini?')) return;

        try {
            const res = await removeAssignment(assignmentId);
            if (res.success) {
                setAssignments(prev => prev.filter(a => a.id !== assignmentId));
                onUpdate?.();
            }
        } catch (err) {
            console.error('Failed to remove:', err);
        }
    };

    if (!open) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="card shadow-lg" style={{
                width: '100%',
                maxWidth: '750px',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#fff',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                padding: '2rem'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            margin: 0,
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                padding: '0.5rem',
                                background: 'rgba(15, 43, 70, 0.05)',
                                borderRadius: '8px',
                                color: 'var(--primary)',
                                display: 'flex'
                            }}>
                                <UserPlus size={24} />
                            </div>
                            Kelola Anggota Panitia
                        </h2>
                        <p style={{ margin: '0.5rem 0 0 3.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {event?.nama_struktur} • {event?.kode_struktur}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#adb5bd',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex'
                        }}
                    >
                        <XIcon size={20} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <Loader2 size={40} className="spin" style={{ color: 'var(--primary)' }} />
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat data anggota...</p>
                    </div>
                ) : (
                    <>
                        {/* Add Person Section */}
                        <div style={{
                            background: '#f8f9fa',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            marginBottom: '2rem',
                            border: '1px solid #e9ecef'
                        }}>
                            <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                Tambahkan Anggota Baru
                            </h4>

                            {/* Search & Select Row */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#adb5bd' }} />
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Cari nama orang..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            style={{
                                                paddingLeft: '3rem',
                                                height: '2.75rem'
                                            }}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleSearch}
                                        style={{ height: '2.75rem', padding: '0 1.25rem' }}
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '0.75rem' }}>
                                    <select
                                        className="form-control"
                                        value={selectedPerson?.id || ''}
                                        onChange={(e) => {
                                            const person = people.find(p => p.id === parseInt(e.target.value));
                                            setSelectedPerson(person || null);
                                        }}
                                        style={{
                                            height: '2.75rem'
                                        }}
                                    >
                                        <option value="">-- Pilih Anggota --</option>
                                        {people.map(p => (
                                            <option key={p.id} value={p.id}>{p.nama_lengkap}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="form-control"
                                        value={jabatan}
                                        onChange={(e) => setJabatan(e.target.value)}
                                        style={{
                                            height: '2.75rem'
                                        }}
                                    >
                                        <option value="Ketua">Ketua</option>
                                        <option value="Wakil Ketua">Wakil Ketua</option>
                                        <option value="Sekretaris">Sekretaris</option>
                                        <option value="Bendahara">Bendahara</option>
                                        <option value="Koordinator">Koordinator</option>
                                        <option value="Anggota">Anggota</option>
                                    </select>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleAssign}
                                    disabled={submitting || !selectedPerson}
                                    style={{
                                        width: '100%',
                                        height: '2.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        marginTop: '0.5rem'
                                    }}
                                >
                                    {submitting ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
                                    Konfirmasi Penugasan
                                </button>
                            </div>
                        </div>

                        {/* Current Assignments */}
                        <div style={{ padding: '0 0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#495057' }}>
                                    Daftar Panitia Aktif
                                </h4>
                                <span className="badge bg-light text-dark" style={{ border: '1px solid #dee2e6' }}>
                                    {assignments.length} Orang
                                </span>
                            </div>

                            {assignments.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    background: '#f8f9fa',
                                    borderRadius: '8px',
                                    border: '1px dashed #ced4da'
                                }}>
                                    <UserPlus size={48} style={{ margin: '0 auto 1rem', opacity: 0.1 }} />
                                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Belum ada panitia yang ditugaskan.
                                    </p>
                                </div>
                            ) : (
                                <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    <table className="table-compact" style={{ width: '100%' }}>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                            <tr style={{ background: '#f8f9fa' }}>
                                                <th>Nama Anggota</th>
                                                <th>Jabatan</th>
                                                <th style={{ textAlign: 'center' }}>Status</th>
                                                <th style={{ textAlign: 'right' }}>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignments.map(a => (
                                                <tr key={a.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                                                {a.person?.nama_lengkap?.substring(0, 1)}
                                                            </div>
                                                            <span style={{ fontWeight: 600 }}>{a.person?.nama_lengkap || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: 'var(--text-muted)' }}>{a.jabatan}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span className={`badge ${a.status === 'Aktif' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.75rem' }}>
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button
                                                            className="btn btn-ghost text-danger"
                                                            style={{ padding: '0.25rem' }}
                                                            onClick={() => handleRemove(a.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Close Button */}
                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={onClose}
                                style={{ padding: '0.5rem 1.5rem' }}
                            >
                                Selesai
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AssignPeopleModal;
