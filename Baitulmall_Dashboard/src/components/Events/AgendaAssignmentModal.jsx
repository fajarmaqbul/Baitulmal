import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Search } from 'lucide-react';

const AgendaAssignmentModal = ({ agenda, onClose, onSuccess }) => {
    const [people, setPeople] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState('');
    const [role, setRole] = useState('Imam');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch people for dropdown
        api.get('/people')
            .then(res => setPeople(res.data.data))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/agendas/${agenda.id}/assign`, {
                person_id: selectedPerson,
                jabatan: role
            });
            onSuccess();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign');
        } finally {
            setLoading(false);
        }
    };

    // Existing assignments check
    const isAssigned = (roleName) => {
        return agenda.assignments.some(a => a.jabatan === roleName && a.status === 'Aktif');
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Petugas: {agenda.nama_struktur}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Posisi / Jabatan</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="Imam" disabled={isAssigned('Imam')}>Imam {isAssigned('Imam') ? '(Terisi)' : ''}</option>
                            <option value="Bilal" disabled={isAssigned('Bilal')}>Bilal {isAssigned('Bilal') ? '(Terisi)' : ''}</option>
                            <option value="Penceramah" disabled={isAssigned('Penceramah')}>Penceramah {isAssigned('Penceramah') ? '(Terisi)' : ''}</option>
                            <option value="Koordinator">Koordinator</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Personel</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={selectedPerson}
                            onChange={(e) => setSelectedPerson(e.target.value)}
                            required
                        >
                            <option value="">-- Pilih Orang --</option>
                            {people.map(p => (
                                <option key={p.id} value={p.id}>{p.nama_lengkap}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-300 rounded-lg text-slate-600 hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedPerson}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Petugas'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgendaAssignmentModal;
