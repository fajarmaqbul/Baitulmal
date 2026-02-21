import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Calendar,
    User,
    Clock,
    MapPin,
    ChevronLeft,
    Plus,
    Edit,
    Users,
    FileText,
    AlertCircle,
    MoreVertical,
    CheckCircle
} from 'lucide-react';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchEventData = async () => {
        try {
            setLoading(true);
            const [resEvent, resPosts] = await Promise.all([
                axios.get(`http://127.0.0.1:8000/api/v1/events/${id}`),
                axios.get(`http://127.0.0.1:8000/api/v1/agenda-posts?event_id=${id}`)
            ]);

            if (resEvent.data.success) {
                setEvent(resEvent.data.data.event);
            }
            if (resPosts.data.success) {
                setPosts(resPosts.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventData();
    }, [id]);

    const handleCreatePost = () => navigate(`/events/${id}/agenda/new`);
    const handleEditPost = (postId) => navigate(`/events/${id}/agenda/${postId}/edit`);
    const handleViewPost = (postId) => navigate(`/events/${id}/agenda/${postId}`);

    // Filter posts berdasarkan status
    const filteredPosts = posts.filter(post => {
        if (activeFilter === 'all') return true;
        return post.status === activeFilter;
    });

    // Format tanggal
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full absolute top-0 animate-spin"></div>
            </div>
            <p className="mt-4 text-lg font-medium text-slate-600">Memuat Detail Event...</p>
        </div>
    );

    if (!event) return (
        <div className="flex items-center justify-center p-20">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Event Tidak Ditemukan</h2>
                <p className="text-slate-600 mb-6">Event yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
                <Link
                    to="/event-management"
                    className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-lg transition-colors font-medium"
                >
                    <ChevronLeft size={20} />
                    Kembali ke Manajemen Event
                </Link>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        <Link to="/event-management" style={{ color: 'inherit', textDecoration: 'none' }} className="hover-primary">Manajemen Event</Link>
                        <span>/</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{event.nama_struktur}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <button
                                onClick={() => navigate('/event-management')}
                                className="btn-icon"
                                style={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    padding: '0.75rem',
                                    borderRadius: '12px'
                                }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div>
                                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                                    {event.nama_struktur}
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        background: 'rgba(28, 200, 138, 0.1)',
                                        color: '#1cc88a',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center', gap: '0.4rem'
                                    }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1cc88a' }}></div>
                                        ACTIVE PROJECT
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Terakhir Update: {formatDate(event.updated_at || event.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCreatePost}
                            className="btn btn-primary"
                            style={{
                                padding: '0.85rem 1.75rem',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontWeight: 700,
                                boxShadow: '0 4px 12px rgba(0, 97, 242, 0.2)'
                            }}
                        >
                            <Plus size={20} strokeWidth={3} /> Tambah Agenda Baru
                        </button>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(0, 97, 242, 0.08)', color: 'var(--primary)' }}>
                            <Calendar size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Periode Kegiatan</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatDate(event.tanggal_mulai)}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>sampai {formatDate(event.tanggal_selesai)}</div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(102, 16, 242, 0.08)', color: '#6610f2' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tim Pelaksana</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{event.assignments_count || 0}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Anggota Terdaftar</div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(246, 194, 62, 0.08)', color: '#f6c23e' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Efisiensi Agenda</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{posts.length}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Sub-kegiatan</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
                    {/* Toolbar */}
                    <div style={{
                        padding: '1.75rem 2.5rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.01)'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>Daftar Agenda Kegiatan</h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Susunan jadwal kegiatan secara kronologi</p>
                        </div>

                        <div style={{ display: 'flex', background: 'var(--background)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            {['all', 'published', 'draft'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    style={{
                                        border: 'none',
                                        padding: '0.6rem 1.5rem',
                                        borderRadius: '10px',
                                        fontSize: '0.85rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.25s',
                                        background: activeFilter === filter ? 'var(--card-bg)' : 'transparent',
                                        color: activeFilter === filter ? 'var(--primary)' : 'var(--text-muted)',
                                        boxShadow: activeFilter === filter ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Section - TIMELINE FORMAT */}
                    <div style={{ padding: '2.5rem' }}>
                        {filteredPosts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                                <div style={{ width: '80px', height: '80px', background: 'var(--background)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--text-muted)' }}>
                                    <Clock size={40} opacity={0.3} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Belum Ada Agenda</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '0.5rem auto 1.5rem' }}>Mulai susun rencana kegiatan Anda dengan menambah agenda baru.</p>
                                <button onClick={handleCreatePost} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                                    <Plus size={18} /> Klik di Sini
                                </button>
                            </div>
                        ) : (
                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {/* Timeline Line */}
                                <div style={{ position: 'absolute', left: '120px', top: '2rem', bottom: '2rem', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>

                                {filteredPosts.sort((a, b) => new Date(a.schedule_date) - new Date(b.schedule_date)).map((post, index) => (
                                    <div
                                        key={post.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '120px 1fr',
                                            gap: '3rem',
                                            marginBottom: '1rem',
                                            position: 'relative',
                                            zIndex: 1
                                        }}
                                        className="timeline-item-hover"
                                        onClick={() => handleViewPost(post.id)}
                                    >
                                        {/* Time Sidebar */}
                                        <div style={{ textAlign: 'right', paddingTop: '1.5rem' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{formatTime(post.schedule_date)}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>WIB</div>
                                        </div>

                                        {/* Content Card */}
                                        <div style={{
                                            padding: '1.75rem 2rem',
                                            background: 'var(--card-bg)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '20px',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem',
                                            cursor: 'pointer',
                                            position: 'relative'
                                        }} className="card-hover-timeline">
                                            {/* Timeline Node Icon */}
                                            <div style={{
                                                position: 'absolute',
                                                left: '-3.7rem',
                                                top: '1.75rem',
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: post.status === 'published' ? 'var(--primary)' : 'var(--background)',
                                                border: `4px solid ${post.status === 'published' ? '#fff' : 'var(--border-color)'}`,
                                                boxShadow: post.status === 'published' ? '0 0 0 4px rgba(0,144,231,0.1)' : 'none',
                                                zIndex: 2
                                            }}></div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>{new Date(post.schedule_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                        <span style={{ width: '4px', height: '4px', background: 'var(--border-color)', borderRadius: '50%' }}></span>
                                                        {post.location && (
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                <MapPin size={12} /> {post.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>{post.title}</h3>
                                                </div>
                                                <div style={{
                                                    padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 900,
                                                    background: post.status === 'published' ? 'rgba(0,144,231,0.08)' : 'rgba(0,0,0,0.04)',
                                                    color: post.status === 'published' ? 'var(--primary)' : 'var(--text-muted)',
                                                    textTransform: 'uppercase', letterSpacing: '0.5px'
                                                }}>
                                                    {post.status}
                                                </div>
                                            </div>

                                            <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
                                                {post.content ? post.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...' : 'Tidak ada deskripsi.'}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {post.assignments_count > 0 && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                            <Users size={14} className="text-primary" />
                                                            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{post.assignments_count} TIM PETUGAS</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditPost(post.id); }}
                                                        className="btn btn-ghost"
                                                        style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>© {new Date().getFullYear()} Baitulmal Digital System • Manajemen Event & Agenda</p>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;