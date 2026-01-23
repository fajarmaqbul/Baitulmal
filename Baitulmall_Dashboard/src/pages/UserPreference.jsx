import React from 'react';
// Deprecated context removed
console.warn('Deprecated context detected');
import { Palette } from 'lucide-react';

const UserPreference = () => {
    const [cardTheme, setCardTheme] = React.useState(() => {
        const saved = localStorage.getItem('cardTheme');
        return saved ? saved : 'clean';
    });
    React.useEffect(() => {
        localStorage.setItem('cardTheme', cardTheme);
    }, [cardTheme]);

    const themes = [
        { id: 'clean', name: 'Clean Minimalist', desc: 'Modern, subtle, transparent' },
        { id: 'classic', name: 'Classic Boxed', desc: 'Formal, solid clean look' },
        { id: 'modern', name: 'Soft Modern', desc: 'Gradient, rounded, vibrant' },
        { id: 'simple', name: 'Simple Text', desc: 'Data-focused, no decorations' }
    ];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>User Preferences</h2>
                <p style={{ color: 'var(--text-muted)' }}>Customize your dashboard experience.</p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Palette size={24} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Card Theme Appearance</h3>
                </div>

                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                    Select how you want statistical cards to appear throughout the application.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => setCardTheme(theme.id)}
                            style={{
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: `2px solid ${cardTheme === theme.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                background: cardTheme === theme.id ? 'rgba(75, 73, 172, 0.1)' : 'rgba(255,255,255,0.02)',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%'
                            }}>
                                <span style={{ fontWeight: 600, color: cardTheme === theme.id ? 'var(--primary)' : 'var(--text-main)' }}>
                                    {theme.name}
                                </span>
                                {cardTheme === theme.id && (
                                    <div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%' }} />
                                )}
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {theme.desc}
                            </span>
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Active Theme: {cardTheme.charAt(0).toUpperCase() + cardTheme.slice(1)}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        This theme is applied globally to all statistical cards in the Dashboard and Management pages.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserPreference;
