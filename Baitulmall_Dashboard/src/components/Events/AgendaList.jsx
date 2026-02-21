import React from 'react';
import { UserPlus, User, Mic, FileText } from 'lucide-react';

const AgendaList = ({ agendas, onAssign }) => {
    // Group by Date
    const grouped = agendas.reduce((acc, agenda) => {
        const date = agenda.tanggal_mulai;
        if (!acc[date]) acc[date] = [];
        acc[date].push(agenda);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            {Object.keys(grouped).map(date => (
                <div key={date} className="relative pl-8 border-l-2 border-slate-200 ml-4 pb-2">
                    {/* Timeline Dot */}
                    <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>

                    <h3 className="text-lg font-bold text-slate-800 mb-4 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-200">
                        {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {grouped[date].map(agenda => (
                            <div key={agenda.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-slate-800">{agenda.nama_struktur}</h4>
                                    <button
                                        onClick={() => onAssign(agenda)}
                                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1"
                                    >
                                        <UserPlus size={12} /> Assign
                                    </button>
                                </div>

                                {/* Assignments List */}
                                <div className="space-y-2">
                                    {/* Imam */}
                                    <RoleDisplay
                                        role="Imam"
                                        icon={<User size={14} />}
                                        assignments={agenda.assignments}
                                    />
                                    {/* Bilal */}
                                    <RoleDisplay
                                        role="Bilal"
                                        icon={<Mic size={14} />}
                                        assignments={agenda.assignments}
                                    />
                                    {/* Penceramah */}
                                    <RoleDisplay
                                        role="Penceramah"
                                        icon={<FileText size={14} />}
                                        assignments={agenda.assignments}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const RoleDisplay = ({ role, icon, assignments }) => {
    // Determine the assignment for this specific role in this specific agenda
    // Note: The assignments prop passed here is agenda.assignments (all assignments for this agenda)
    const assigned = assignments.find(a => a.jabatan === role && a.status === 'Aktif');

    return (
        <div className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded border border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
                {icon}
                <span className="font-medium">{role}</span>
            </div>
            <div className={`font-semibold ${assigned ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                {assigned ? assigned.person?.nama_lengkap : 'Belum ditentukan'}
            </div>
        </div>
    );
};

export default AgendaList;
