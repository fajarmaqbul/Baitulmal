import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Key, Mail, Shield } from 'lucide-react';
import { fetchStructures } from '../../services/userApi';
import { fetchRoles } from '../../services/roleApi';

const UserManagementModal = ({ isOpen, onClose, onSaveRole, onSaveCredentials, userData, isSubmitting }) => {
    const [structures, setStructures] = useState([]);
    const [roles, setRoles] = useState([]);
    const [activeTab, setActiveTab] = useState('credentials'); // credentials, role

    // Credentials Form
    const [credForm, setCredForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    // Role Form
    const [roleForm, setRoleForm] = useState({
        jabatan: '',
        structure_id: ''
    });

    useEffect(() => {
        if (isOpen) {
            loadStructures();
            loadRoles();
        }
    }, [isOpen]);

    useEffect(() => {
        if (userData) {
            // Role Data
            const assignment = userData.person?.assignments?.find(a => a.status === 'Aktif') || {};
            setRoleForm({
                jabatan: assignment.jabatan || '',
                structure_id: assignment.structure_id || ''
            });

            // Credential Data
            setCredForm({
                name: userData.name || '',
                email: userData.email || '',
                password: '' // Always empty initially
            });
        }
    }, [userData]);

    const loadStructures = async () => {
        try {
            const res = await fetchStructures();
            if (res.success) {
                setStructures(res.data);
            }
        } catch (error) {
            console.error("Failed to load structures", error);
        }
    };

    const loadRoles = async () => {
        try {
            const res = await fetchRoles();
            if (res.success) {
                setRoles(res.data);
            }
        } catch (error) {
            console.error("Failed to load roles", error);
        }
    };

    const handleCredSubmit = (e) => {
        e.preventDefault();
        onSaveCredentials(userData.id, credForm);
    };

    const handleRoleSubmit = (e) => {
        e.preventDefault();
        onSaveRole(userData.id, roleForm);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all overflow-y-auto">
            <div className="w-full max-w-xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                {/* Visual Accent Top */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#2c3e50] via-blue-500/50 to-[#2c3e50]"></div>

                <div className="flex items-center justify-between p-6 border-b" style={{ background: 'var(--card-footer-bg)', borderColor: 'var(--border-color)' }}>
                    <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tight" style={{ color: 'var(--text-main)' }}>
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                            <User className="text-slate-300" size={20} />
                        </div>
                        Manajemen Pengguna
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-xl transition-all group" style={{ color: 'var(--text-muted)' }}>
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Tabs - Charcoal Style */}
                <div className="flex border-b" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                    <button
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'credentials' ? 'border-b-2' : ''}`}
                        style={{
                            color: activeTab === 'credentials' ? 'var(--text-main)' : 'var(--text-muted)',
                            borderColor: activeTab === 'credentials' ? 'var(--primary)' : 'transparent',
                            background: activeTab === 'credentials' ? 'var(--table-row-hover)' : 'transparent'
                        }}
                        onClick={() => setActiveTab('credentials')}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Key size={14} /> Akun & Keamanan
                        </span>
                    </button>
                    <button
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'role' ? 'border-b-2' : ''}`}
                        style={{
                            color: activeTab === 'role' ? 'var(--text-main)' : 'var(--text-muted)',
                            borderColor: activeTab === 'role' ? 'var(--primary)' : 'transparent',
                            background: activeTab === 'role' ? 'var(--table-row-hover)' : 'transparent'
                        }}
                        onClick={() => setActiveTab('role')}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Shield size={14} /> Otoritas Role
                        </span>
                    </button>
                </div>

                <div className="p-6">
                    {/* User Info Header */}
                    <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mb-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                            {userData?.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-0.5">Edit Pengguna</p>
                            <p className="text-lg font-bold leading-tight" style={{ color: 'var(--text-main)' }}>{userData?.name}</p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{userData?.email}</p>
                        </div>
                    </div>

                    {activeTab === 'credentials' && (
                        <form onSubmit={handleCredSubmit} className="space-y-4 animate-slide-up">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Nama Lengkap</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        className="input w-full"
                                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                        value={credForm.name}
                                        onChange={(e) => setCredForm({ ...credForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email Login</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="email"
                                        className="input w-full"
                                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                        value={credForm.email}
                                        onChange={(e) => setCredForm({ ...credForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Password Baru</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="password"
                                        className="input w-full"
                                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                        placeholder="Kosongkan jika tidak ingin mengubah password"
                                        value={credForm.password}
                                        onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
                                        minLength={6}
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Minimal 6 karakter.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Simpan Akun
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'role' && (
                        <form onSubmit={handleRoleSubmit} className="space-y-4 animate-slide-up">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Struktural / Organisasi</label>
                                <select
                                    className="input w-full"
                                    style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                    value={roleForm.structure_id}
                                    onChange={(e) => setRoleForm({ ...roleForm, structure_id: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Struktur --</option>
                                    {structures.map(s => (
                                        <option key={s.id} value={s.id}>{s.nama_struktur}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Jabatan / Role</label>
                                <select
                                    className="input w-full"
                                    style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                    value={roleForm.jabatan}
                                    onChange={(e) => setRoleForm({ ...roleForm, jabatan: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Jabatan --</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                    {/* Fallback for existing data not in roles table */}
                                    {roleForm.jabatan && !roles.some(r => r.name === roleForm.jabatan) && (
                                        <option value={roleForm.jabatan}>{roleForm.jabatan} (Manual)</option>
                                    )}
                                </select>
                                <p className="text-xs text-slate-500">Pilih jabatan dari daftar yang telah didefinisikan oleh Super Admin.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Simpan Role
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div >
    );
};

export default UserManagementModal;
