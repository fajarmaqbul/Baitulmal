import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, User } from 'lucide-react';
import { fetchStructures } from '../../services/userApi';

const UserRoleModal = ({ isOpen, onClose, onSave, userData, isSubmitting }) => {
    const [structures, setStructures] = useState([]);
    const [formData, setFormData] = useState({
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
            // Find active assignment
            const assignment = userData.person?.assignments?.find(a => a.status === 'Aktif') || {};
            setFormData({
                jabatan: assignment.jabatan || '',
                structure_id: assignment.structure_id || ''
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(userData.id, formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="text-blue-500" size={24} />
                        Edit Role Pengguna
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mb-4">
                        <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider mb-1">Pengguna</p>
                        <p className="text-lg font-bold text-white">{userData?.name}</p>
                        <p className="text-sm text-blue-200">{userData?.email}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Struktural / Organisasi</label>
                        <select
                            className="input w-full bg-slate-950 border-slate-700"
                            value={formData.structure_id}
                            onChange={(e) => setFormData({ ...formData, structure_id: e.target.value })}
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
                            value={formData.jabatan}
                            onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
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
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Simpan Role
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserRoleModal;
