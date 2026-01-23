import React, { useState, useEffect } from 'react';
import { X as XIcon, Calendar, Save, Loader2 } from 'lucide-react';

/**
 * EventFormModal - Create/Edit Event Modal
 * 
 * @param {boolean} open - Modal visibility
 * @param {function} onClose - Close handler
 * @param {function} onSubmit - Submit handler (receives form data)
 * @param {object} initialData - Data for edit mode (null for create)
 * @param {boolean} loading - Loading state
 */
const EventFormModal = ({ open, onClose, onSubmit, initialData = null, loading = false }) => {

    // Form state
    const [formData, setFormData] = useState({
        nama_struktur: '',
        kode_struktur: '',
        tipe: 'Project',
        tanggal_mulai: '',
        tanggal_selesai: ''
    });

    // Sync form with initialData when editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                nama_struktur: initialData.nama_struktur || '',
                kode_struktur: initialData.kode_struktur || '',
                tipe: initialData.tipe || 'Project',
                tanggal_mulai: initialData.tanggal_mulai?.split('T')[0] || '',
                tanggal_selesai: initialData.tanggal_selesai?.split('T')[0] || ''
            });
        } else {
            // Reset for create mode
            setFormData({
                nama_struktur: '',
                kode_struktur: '',
                tipe: 'Project',
                tanggal_mulai: new Date().toISOString().split('T')[0],
                tanggal_selesai: ''
            });
        }
    }, [initialData, open]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Generate kode from nama
    const generateKode = () => {
        if (!formData.nama_struktur || formData.kode_struktur) return; // Don't overwrite if manual entry

        const year = new Date().getFullYear();
        const suffix = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3-char random suffix
        const namePart = formData.nama_struktur
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/[^A-Z0-9_]/g, '')
            .substring(0, 15);

        setFormData(prev => ({ ...prev, kode_struktur: `${namePart}_${year}_${suffix}` }));
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!open) return null;
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
                maxWidth: '550px',
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
                                <Calendar size={24} />
                            </div>
                            {initialData ? 'Ubah Data Event' : 'Tambah Event Baru'}
                        </h2>
                        <p style={{ margin: '0.5rem 0 0 3.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {initialData ? 'Perbarui informasi detail kegiatan' : 'Daftarkan kegiatan atau kepanitiaan baru'}
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

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Nama Event */}
                    <div className="form-group">
                        <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Nama Event / Kegiatan</label>
                        <input
                            type="text"
                            name="nama_struktur"
                            className="form-control"
                            value={formData.nama_struktur}
                            onChange={handleChange}
                            placeholder="Contoh: Panitia Qurban 2025"
                            required
                            onBlur={generateKode}
                            style={{ width: '100%', height: '2.75rem' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {/* Kode Struktur */}
                        <div className="form-group">
                            <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Kode (Internal)</label>
                            <input
                                type="text"
                                name="kode_struktur"
                                className="form-control"
                                value={formData.kode_struktur}
                                onChange={handleChange}
                                placeholder="Auto-generate"
                                required
                                style={{ width: '100%', height: '2.75rem', fontFamily: 'monospace' }}
                            />
                        </div>

                        {/* Tipe */}
                        <div className="form-group">
                            <label className="label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600, color: '#495057' }}>Kategori</label>
                            <select
                                name="tipe"
                                className="form-control"
                                value={formData.tipe}
                                onChange={handleChange}
                                style={{ width: '100%', height: '2.75rem' }}
                            >
                                <option value="Project">Project / Kegiatan</option>
                                <option value="Panitia">Panitia</option>
                                <option value="Event">Event</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1.25rem',
                        padding: '1.25rem',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                    }}>
                        <div className="form-group">
                            <label className="label" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Mulai</label>
                            <input
                                type="date"
                                name="tanggal_mulai"
                                className="form-control"
                                value={formData.tanggal_mulai}
                                onChange={handleChange}
                                required
                                style={{ background: 'transparent', border: 'none', padding: 0, height: 'auto' }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Selesai</label>
                            <input
                                type="date"
                                name="tanggal_selesai"
                                className="form-control"
                                value={formData.tanggal_selesai}
                                onChange={handleChange}
                                style={{ background: 'transparent', border: 'none', padding: 0, height: 'auto' }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ flex: 1, height: '2.75rem' }}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                flex: 1,
                                height: '2.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                            {initialData ? 'Simpan' : 'Buat Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventFormModal;
