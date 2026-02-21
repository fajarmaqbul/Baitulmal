import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Plus,
    Calendar,
    MapPin,
    MoreVertical,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';


const EventList = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            console.log("Fetching events...");
            const response = await axios.get('http://127.0.0.1:8000/api/v1/events');
            console.log("Events API Response:", response.data);
            if (response.data && response.data.success) {
                setEvents(response.data.data);
            } else {
                console.error("API returned success:false or invalid format");
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus acara ini?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/v1/events/${id}`);
            fetchEvents(); // Refresh list
        } catch (error) {
            console.error("Failed to delete event:", error);
            alert("Gagal menghapus acara");
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.nama_struktur.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.deskripsi && event.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === "all" || (event.status && event.status.toLowerCase() === filterStatus.toLowerCase());
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight">Daftar Acara</h2>
                    <p className="text-muted mt-1 font-medium">Kelola semua kegiatan masjid dan baitulmal</p>
                </div>
                <Button onClick={() => navigate('/event-management/new')} className="gap-2 font-bold shadow-lg shadow-blue-900/20 bg-blue-600 hover:bg-blue-500 text-white border-0">
                    <Plus size={18} /> Buat Acara Baru
                </Button>
            </div>

            {/* Filters */}
            <Card className="glass-card border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <Input
                            placeholder="Cari nama acara..."
                            className="input pl-10 placeholder:text-slate-500"
                            style={{ paddingLeft: '3rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="h-4 w-4 text-muted" />
                        <select
                            className="input h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Event Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                    <Calendar className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-200">Belum ada acara</h3>
                    <p className="text-slate-400 mb-4">Mulai dengan membuat acara baru pertama Anda.</p>
                    <Button variant="outline" onClick={() => navigate('/event-management/new')}>
                        Buat Acara Baru
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                        <Card key={event.id} className="group hover:shadow-lg transition-all duration-200 border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden">
                            <CardHeader className="p-0">
                                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm text-slate-800">
                                        {event.status || 'Draft'}
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <div className="font-bold text-lg leading-tight line-clamp-2">{event.nama_struktur}</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-2 text-sm text-muted">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted" />
                                        <span>
                                            {event.tanggal_mulai ? new Date(event.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tanggal belum set'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted" />
                                        <span className="truncate">{event.lokasi || 'Lokasi belum set'}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-center gap-2">
                                    <Link to={`/events/${event.id}`} className="text-xs font-medium text-muted hover:text-blue-500 flex items-center gap-1 transition-colors">
                                        <Eye size={14} /> Lihat Detail
                                    </Link>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={() => navigate(`/event-management/${event.id}`)}
                                            title="Edit Draft"
                                        >
                                            <Edit size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(event.id)}
                                            title="Hapus"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventList;
