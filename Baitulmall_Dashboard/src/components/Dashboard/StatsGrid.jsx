import React from 'react';

const StatsGrid = ({ cardStats }) => {
    return (
        <div className="stats-grid" style={{ gap: '1.5rem' }}>
            {cardStats.map((stat, i) => (
                <div key={i} className="card stat-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{
                            padding: '1rem',
                            borderRadius: '16px',
                            background: stat.color === 'var(--primary)' ? 'rgba(0,144,231,0.1)' :
                                stat.color === 'var(--danger)' ? 'rgba(252,66,74,0.1)' :
                                    stat.color === 'var(--success)' ? 'rgba(0,210,91,0.1)' : 'rgba(255,171,0,0.1)',
                            color: stat.color
                        }}>
                            <stat.icon size={24} strokeWidth={2.5} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', background: 'rgba(0,210,91,0.08)', padding: '4px 10px', borderRadius: '20px' }}>
                            {stat.trend}
                        </span>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', lineHeight: 1 }}>{stat.value}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.75rem 0 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;
