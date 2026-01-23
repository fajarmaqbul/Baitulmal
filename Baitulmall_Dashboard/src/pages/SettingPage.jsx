import React, { useState, useEffect } from 'react';
import {
    Settings,
    Plus,
    Edit2,
    Trash2,
    Search,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
    Code,
    Type,
    Hash
} from 'lucide-react';
import { fetchSettings, createSetting, updateSetting, deleteSetting } from '../services/settingApi';
import SettingFormModal from '../components/Modals/SettingFormModal';

/**
 * SettingPage - Main management page for application settings
 */
const SettingPage = () => {
    // State Management
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modal, setModal] = useState({ open: false, data: null });

    // Load Data
    const loadSettings = async () => {
        try {
            setLoading(true);
            const res = await fetchSettings();
            if (res.success) {
                setSettings(res.data);
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
            alert('Gagal mengambil data settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    // Handlers
    const handleSave = async (formData) => {
        setSubmitting(true);
        try {
            if (modal.data) {
                // Update
                await updateSetting(modal.data.id, formData);
            } else {
                // Create
                await createSetting(formData);
            }
            setModal({ open: false, data: null });
            await loadSettings();
        } catch (err) {
            console.error('Failed to save setting:', err);
            alert('Gagal menyimpan setting: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus setting ini?')) return;

        try {
            await deleteSetting(id);
            await loadSettings();
        } catch (err) {
            console.error('Failed to delete setting:', err);
            alert('Gagal menghapus setting');
        }
    };

    const handleToggleBoolean = async (setting) => {
        if (setting.type !== 'boolean') return;
        const newValue = (setting.value === 'true' || setting.value === '1') ? 'false' : 'true';
        try {
            await updateSetting(setting.id, { ...setting, value: newValue });
            await loadSettings();
        } catch (err) {
            console.error('Toggle failed:', err);
        }
    };

    // UI Helpers
    const getTypeIcon = (type) => {
        switch (type) {
            case 'number': return <Hash size={14} />;
            case 'json': return <Code size={14} />;
            case 'boolean': return <ToggleRight size={14} />;
            default: return <Type size={14} />;
        }
    };

    const filteredSettings = settings.filter(s =>
        s.key_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-container">
            <header className="header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                            <Settings size={22} />
                        </div>
                        <h2 className="title" style={{ margin: 0 }}>Konfigurasi Sistem</h2>
                    </div>
                    <p className="subtitle" style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Kelola variabel/parameter aplikasi secara dinamis.</p>
                </div>

                <div className="header-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: '1', justifyContent: 'flex-end', minWidth: '300px' }}>
                    <div className="search-box" style={{
                        position: 'relative',
                        flex: '1',
                        maxWidth: '400px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Cari setting (key atau deskripsi)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '8px 12px 8px 38px',
                                width: '100%',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>

                    <button
                        className="btn btn-ghost"
                        onClick={loadSettings}
                        disabled={loading}
                        style={{ padding: '8px' }}
                    >
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>

                    <button className="btn btn-primary" onClick={() => setModal({ open: true, data: null })} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                        <Plus size={18} />
                        <span>Tambah Setting</span>
                    </button>
                </div>
            </header>

            {/* Table */}
            <div className="glass-card table-container" style={{ marginTop: '1rem' }}>
                <table className="table-modern">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>NO</th>
                            <th style={{ width: '220px' }}>KEY NAME</th>
                            <th>VALUE</th>
                            <th>DESCRIPTION</th>
                            <th style={{ width: '120px', textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8">
                                    <div className="loading-spinner"></div>
                                    <p>Memuat data settings...</p>
                                </td>
                            </tr>
                        ) : filteredSettings.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-muted">
                                    Tidak ada setting ditemukan.
                                </td>
                            </tr>
                        ) : (
                            filteredSettings.map((s, index) => (
                                <tr key={s.id}>
                                    <td className="text-muted">{index + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                                                {s.type}
                                            </span>
                                            <code style={{ fontWeight: 600, color: 'var(--primary)', background: 'rgba(75, 73, 172, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                                {s.key_name}
                                            </code>
                                        </div>
                                    </td>
                                    <td>
                                        {s.type === 'boolean' ? (
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleToggleBoolean(s)}
                                                style={{ color: (s.value === 'true' || s.value === '1') ? 'var(--success)' : 'var(--text-muted)' }}
                                            >
                                                {(s.value === 'true' || s.value === '1') ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                            </button>
                                        ) : s.type === 'json' ? (
                                            <div className="json-preview">
                                                <Code size={14} />
                                                <span>{s.value?.length > 30 ? s.value.substring(0, 30) + '...' : s.value}</span>
                                            </div>
                                        ) : (
                                            <div style={{ fontWeight: 500 }}>
                                                {s.value || <em className="text-muted">(kosong)</em>}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <p className="description-text" title={s.description}>
                                            {s.description || '-'}
                                        </p>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon text-primary"
                                                onClick={() => setModal({ open: true, data: s })}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn-icon text-danger"
                                                onClick={() => handleDelete(s.id)}
                                                title="Hapus"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <SettingFormModal
                isOpen={modal.open}
                onClose={() => setModal({ open: false, data: null })}
                onSave={handleSave}
                settingData={modal.data}
                isSubmitting={submitting}
            />

            <style jsx>{`
                .badge-primary { background: var(--primary); color: #fff; padding: 2px 6px; border-radius: 4px; }
                .json-preview { display: flex; alignItems: center; gap: 8px; color: var(--text-muted); font-size: 0.85rem; font-family: monospace; }
                .description-text { 
                    max-width: 300px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                }
                .action-buttons { display: flex; justify-content: center; gap: 8px; }
                .loading-spinner { border: 3px solid rgba(0,0,0,0.1); border-top-color: var(--primary); border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; margin: 0 auto 8px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default SettingPage;
