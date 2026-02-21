import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Key, Mail, Shield } from 'lucide-react';
import { fetchStructures } from '../../services/userApi';

const UserManagementModal = ({ isOpen, onClose, onSaveRole, onSaveCredentials, userData, isSubmitting }) => {
    const [structures, setStructures] = useState([]);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
            <div className="bg-[#0f172a] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="text-blue-500" size={24} />
                        Manajemen Pengguna
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'credentials' ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5' : 'text-slate-400 hover:text-slate-200'}`}
                        onClick={() => setActiveTab('credentials')}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Key size={16} /> Akun & Password
                        </span>
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'role' ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5' : 'text-slate-400 hover:text-slate-200'}`}
                        onClick={() => setActiveTab('role')}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Shield size={16} /> Role & Jabatan
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
                            <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider mb-0.5">Edit Pengguna</p>
                            <p className="text-lg font-bold text-white leading-tight">{userData?.name}</p>
                            <p className="text-sm text-blue-200/70">{userData?.email}</p>
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
                                        className="input w-full bg-slate-950 border-slate-700 pl-10"
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
                                        className="input w-full bg-slate-950 border-slate-700 pl-10"
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
                                        className="input w-full bg-slate-950 border-slate-700 pl-10"
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
                                    className="input w-full bg-slate-950 border-slate-700"
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
                                <input
                                    type="text"
                                    className="input w-full bg-slate-950 border-slate-700"
                                    placeholder="Contoh: Bendahara, Ketua, Staff"
                                    value={roleForm.jabatan}
                                    onChange={(e) => setRoleForm({ ...roleForm, jabatan: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-slate-500">Jabatan ini akan menentukan hak akses pengguna.</p>
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
        </div>
    );
};

export default UserManagementModal;
