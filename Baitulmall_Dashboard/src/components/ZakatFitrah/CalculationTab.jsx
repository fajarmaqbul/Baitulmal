import React from 'react';
import { Save, AlertCircle } from 'lucide-react';

const CalculationTab = ({
    totalBeras,
    isLocked,
    distribution,
    totalAsnafJiwa,
    handlePortionChange,
    handleUnlockDistribution,
    handleSaveDistributionConfig,
    canEditConfig,
    useSmartAllocation,
    setUseSmartAllocation
}) => {
    const totalPercentage = distribution.reduce((acc, curr) => acc + curr.percentage, 0);
    const isInvalid = Math.abs(totalPercentage - 1) > 0.0001;

    // A configuration is truly "editable" only if the user has permission AND it's not currently locked
    const isEditable = canEditConfig && !isLocked;

    return (
        <div className="table-container">
            <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: isLocked ? 'rgba(16, 185, 129, 0.05)' : 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                borderLeft: isLocked ? '4px solid var(--success)' : '4px solid var(--primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h4 style={{ margin: '0 0 0.5rem 1rem', color: isLocked ? 'var(--success)' : 'var(--primary)' }}>
                        Total Beras Terkumpul: {totalBeras.toLocaleString()} KG
                        {isLocked && <span style={{ marginLeft: '1rem', fontSize: '0.75rem', background: 'var(--success)', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>TERKUNCI</span>}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Setting distribusi untuk 8 Asnaf. <b>1 Bagian = 12.5%</b> dari total beras.
                    </p>
                </div>
                <div>
                    {isLocked ? (
                        canEditConfig && (
                            <button className="btn btn-ghost" onClick={handleUnlockDistribution} style={{ color: 'var(--text-muted)' }}>
                                Buka Kunci
                            </button>
                        )
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div
                                onClick={() => !isLocked && setUseSmartAllocation(!useSmartAllocation)}
                                className={`d-flex align-items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${useSmartAllocation ? 'border-primary bg-primary-soft' : 'border-dashed border-muted op-50'}`}
                                style={{
                                    background: useSmartAllocation ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                                    color: useSmartAllocation ? 'var(--primary)' : 'var(--text-muted)',
                                    pointerEvents: isLocked ? 'none' : 'auto'
                                }}
                            >
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: useSmartAllocation ? 'var(--primary)' : 'transparent',
                                    border: `2px solid ${useSmartAllocation ? 'var(--primary)' : 'var(--text-muted)'}`
                                }}></div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>SMART WEIGHT</span>
                            </div>
                            <button className="btn btn-primary" onClick={handleSaveDistributionConfig} disabled={!canEditConfig} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Save size={16} /> Simpan & Kunci
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Visual Chart / Progress Bar */}
            <div style={{ padding: '0 1rem 1.5rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    <span>Visualisasi Alokasi (%)</span>
                    <span style={{ color: isInvalid ? 'var(--danger)' : 'var(--success)' }}>
                        {(totalPercentage * 100).toFixed(1)}% / 100%
                    </span>
                </div>
                <div style={{
                    height: '24px',
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    display: 'flex',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)'
                }}>
                    {distribution.map((d, i) => (
                        <div
                            key={i}
                            title={`${d.category}: ${(d.percentage * 100).toFixed(1)}%`}
                            style={{
                                width: `${d.percentage * 100}%`,
                                height: '100%',
                                background: `hsl(${(i * 360) / 8}, 70%, 50%)`,
                                transition: 'width 0.3s ease'
                            }}
                        />
                    ))}
                </div>
                {useSmartAllocation ? (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={10} /> Mode Smart aktif: Alokasi dihitung berdasarkan bobot prioritas (Fakir 2x, Miskin 1.5x).
                    </p>
                ) : (
                    isInvalid && (
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={10} /> Total bagian harus tepat 8.0 agar dapat disimpan.
                        </p>
                    )
                )}
            </div>

            <table className="table-compact">
                <thead>
                    <tr>
                        <th>Kategori Asnaf</th>
                        <th style={{ width: '220px' }}>Simulasi Porsi (Slider)</th>
                        <th style={{ width: '80px' }}>Bagian</th>
                        <th>Alokasi</th>
                        <th>Jiwa</th>
                        <th style={{ textAlign: 'center' }}>Total (KG)</th>
                        <th style={{ textAlign: 'center' }}>/Jiwa (KG)</th>
                    </tr>
                </thead>
                <tbody>
                    {distribution.map((d, index) => (
                        <tr key={index} style={{ height: '60px', background: 'transparent' }}>
                            <td style={{ fontWeight: 600 }}>{d.category}</td>
                            <td>
                                <input
                                    type="range"
                                    min="0"
                                    max="8"
                                    step="0.1"
                                    value={d.portion}
                                    onChange={(e) => handlePortionChange(d.category, e.target.value)}
                                    disabled={!isEditable}
                                    style={{
                                        width: '100%',
                                        accentColor: `hsl(${(index * 360) / 8}, 70%, 50%)`,
                                        cursor: isLocked ? 'not-allowed' : 'pointer',
                                        opacity: isLocked ? 0.5 : 1
                                    }}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={d.portion}
                                    onChange={(e) => handlePortionChange(d.category, e.target.value)}
                                    min="0"
                                    max="8"
                                    step="0.1"
                                    disabled={!isEditable}
                                    className="input"
                                    style={{
                                        width: '60px',
                                        padding: '0.2rem 0.4rem',
                                        fontSize: '0.8rem',
                                        backgroundColor: !isEditable ? 'rgba(0,0,0,0.1)' : 'var(--card-bg)',
                                        color: !isEditable ? 'var(--text-muted)' : 'var(--text-main)',
                                        border: '1px solid var(--border-color)',
                                        cursor: !isEditable ? 'not-allowed' : 'text'
                                    }}
                                />
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{(d.percentage * 100).toFixed(1)}%</td>
                            <td>{d.totalJiwa}</td>
                            <td style={{ fontWeight: 800, color: 'var(--primary)', textAlign: 'center' }}>{d.jatahAsnaf.toLocaleString()}</td>
                            <td style={{ fontWeight: 800, textAlign: 'center' }}>
                                <span style={{
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: d.berasPerJiwa > 0 ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: 'var(--primary)'
                                }}>
                                    {d.berasPerJiwa.toFixed(2)}
                                </span>
                            </td>
                        </tr>
                    ))}
                    <tr style={{
                        fontWeight: 'bold',
                        background: 'rgba(0,0,0,0.2)',
                        color: isInvalid ? 'var(--danger)' : 'inherit'
                    }}>
                        <td colSpan="3">TOTAL KONTROL (HARUS 8.0)</td>
                        <td style={{ color: isInvalid ? 'var(--danger)' : 'var(--success)' }}>
                            {(totalPercentage * 100).toFixed(1)}%
                        </td>
                        <td>{totalAsnafJiwa}</td>
                        <td style={{ textAlign: 'center' }}>{distribution.reduce((acc, curr) => acc + curr.jatahAsnaf, 0).toLocaleString()}</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default CalculationTab;
