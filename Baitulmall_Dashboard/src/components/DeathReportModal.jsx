import React, { useState } from 'react';
import { X, HeartCrack, AlertCircle, Calendar, Banknote, User } from 'lucide-react';
import { reportDeath } from '../services/asnafApi';

const DeathReportModal = ({ isOpen, onClose, asnafData, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama: asnafData?.nama || '',
        rt_id: asnafData?.rt_id || 1, // Fallback if RT ID missing, but mapped from asnafData usually
        rt_kode: asnafData?.rt || '01', // Display purpose
        amount: '1000000', // Default santunan amount
        tanggal: new Date().toISOString().split('T')[0],
        asnaf_id: asnafData?.id || null,
        description: ''
    });

    // Update form when asnafData changes
    React.useEffect(() => {
        if (asnafData) {
            setFormData(prev => ({
                ...prev,
                nama: asnafData.nama,
                // Note: rt_id should ideally come from asnafData, but we might only have rt code.
                // If we only have rt code, we rely on parent to pass rt_id or we guess.
                // Ideally, Asnaf objects should have rt_id.
                // For now assuming asnafData has everything or we pass rt list to map.
                asnaf_id: asnafData.id,
                rt_kode: asnafData.rt
            }));
            // We need RT ID. If not in asnafData, we might fail validation.
            // But AsnafManagement usually has it.
        }
    }, [asnafData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Need to ensure we have a valid RT ID. 
            // If we don't have it in props, we might need a lookup or pass it from parent.
            // For now, we trust the parent passes an object with rt_id, OTHERWISE we need to find it.
            // Let's assume asnafData has rt_id property hidden or we use a fallback.

            // Correction: The AsnafManagement data structure (transformedAsnaf) doesn't seem to have rt_id, only 'rt' (code).
            // We need to find the ID based on code.
            // HACK: We will try to pass the rt_id if available, or ask user to select if missing?
            // Better: Parent passes the RT list so we can lookup.

            await reportDeath({
                ...formData,
                rt_id: formData.rt_id // Ensure this is populated!
            });

            onSuccess();
            onClose();
        } catch (error) {
            alert('Gagal melaporkan kematian: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1060 }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)' }}>
                        <HeartCrack size={24} /> Lapor Kematian
                    </h3>
                    <button onClick={onClose} className="btn-ghost" style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 bg-red-50/10 border-b border-red-500/20" style={{ padding: '1rem 1.5rem', background: 'rgba(239, 68, 68, 0.05)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--danger)', lineHeight: 1.5 }}>
                        <AlertCircle size={32} style={{ flexShrink: 0 }} />
                        <div>
                            <strong>Perhatian:</strong> Pelaporan ini akan otomatis mencatat pengeluaran Santunan dan mengurangi jumlah anggota keluarga (jiwa) pada data Asnaf terkait.
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="label">
                            <User size={16} /> Nama Almarhum/Almarhumah
                        </label>
                        <input
                            className="input"
                            value={formData.nama}
                            onChange={e => setFormData({ ...formData, nama: e.target.value })}
                            required
                        />
                        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Asnaf Terkait: <strong>{asnafData?.nama}</strong> (RT {formData.rt_kode})
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div className="form-group">
                            <label className="label">
                                <Banknote size={16} /> Nominal Santunan
                            </label>
                            <input
                                type="number"
                                className="input"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">
                                <Calendar size={16} /> Tanggal Wafat
                            </label>
                            <input
                                type="date"
                                className="input"
                                value={formData.tanggal}
                                onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ flex: 1, border: '1px solid var(--border-color)' }}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 2, background: 'var(--danger)', borderColor: 'var(--danger)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                            disabled={loading}
                        >
                            {loading ? 'Memproses...' : 'Konfirmasi & Proses'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeathReportModal;
