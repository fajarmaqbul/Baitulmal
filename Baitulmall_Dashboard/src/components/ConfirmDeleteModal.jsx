import React from 'react';
import { AlertTriangle, Loader2, X as XIcon } from 'lucide-react';

/**
 * Reusable Confirmation Modal for Delete Actions
 * 
 * @param {boolean} open - Whether the modal is visible
 * @param {string} title - Modal title
 * @param {string} description - Descriptive text for the action
 * @param {function} onConfirm - Function to call on confirmation
 * @param {function} onCancel - Function to call on cancellation
 * @param {boolean} loading - Loading state for the confirm button
 */
const ConfirmDeleteModal = ({
    open,
    title = 'Hapus Data',
    description = 'Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan.',
    onConfirm,
    onCancel,
    loading = false
}) => {
    if (!open) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
        }} onClick={onCancel}>
            <div
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '2rem',
                    position: 'relative',
                    animation: 'modalSlideUp 0.3s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                >
                    <XIcon size={20} />
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'var(--danger)'
                    }}>
                        <AlertTriangle size={32} />
                    </div>

                    <h2 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>{title}</h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                        {description}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn btn-ghost"
                            style={{ flex: 1, padding: '0.75rem' }}
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            className="btn"
                            style={{
                                flex: 2,
                                background: 'var(--danger)',
                                color: 'white',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="spin" />
                                    Menghapus...
                                </>
                            ) : 'Ya, Hapus Data'}
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default ConfirmDeleteModal;
