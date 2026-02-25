import React from 'react';
import { AlertCircle, Lock, Unlock, Loader2, X as XIcon } from 'lucide-react';

/**
 * Reusable Confirmation Modal for Zakat Fitrah actions
 */
const ZakatConfirmModal = ({
    open,
    title,
    description,
    onConfirm,
    onCancel,
    loading = false,
    type = 'lock' // 'lock' or 'unlock'
}) => {
    if (!open) return null;

    const isLock = type === 'lock';
    const Icon = isLock ? Lock : Unlock;
    const accentColor = isLock ? 'var(--primary)' : 'var(--warning)';
    const bgColor = isLock ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)';

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
                    animation: 'modalSlideUp 0.3s ease-out',
                    borderLeft: `4px solid ${accentColor}`
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
                        width: '70px',
                        height: '70px',
                        background: bgColor,
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: accentColor
                    }}>
                        <Icon size={32} strokeWidth={2.5} />
                    </div>

                    <h2 style={{
                        marginBottom: '0.75rem',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        letterSpacing: '-0.025em'
                    }}>{title}</h2>

                    <p style={{
                        color: 'var(--text-muted)',
                        lineHeight: '1.6',
                        marginBottom: '2rem',
                        fontSize: '0.95rem'
                    }}>
                        {description}
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            className="btn btn-ghost"
                            style={{ flex: 1, border: '1px solid var(--border-color)' }}
                            onClick={onCancel}
                            disabled={loading}
                        >
                            BATAL
                        </button>
                        <button
                            className={isLock ? "btn btn-primary" : "btn btn-warning"}
                            style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="spin" />
                                    <span>MEMPROSES...</span>
                                </>
                            ) : (
                                <>
                                    <span>{isLock ? 'SIMPAN & KUNCI' : 'BUKA KUNCI'}</span>
                                </>
                            )}
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

export default ZakatConfirmModal;
