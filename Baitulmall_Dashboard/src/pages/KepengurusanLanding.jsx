import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserCog, Users, MapPin, HeartHandshake, ChevronRight } from 'lucide-react';

const KepengurusanLanding = () => {
    const categories = [
        {
            title: 'Pengurus Takmir',
            description: 'Manajemen struktur organisasi dan pengurus Takmir Masjid.',
            icon: <Users size={32} />,
            link: '/kepengurusan-takmir',
            color: '#2563eb'
        },
        {
            title: 'Pengurus Baitulmal',
            description: 'Struktur pengelola dana umat dan petugas amil lapangan.',
            icon: <HeartHandshake size={32} />,
            link: '/kepengurusan-baitulmall',
            color: '#0f2b46'
        },
        {
            title: 'Pengurus RW 01',
            description: 'Struktur kepengurusan Rukun Warga (RW) 01 Desa Kandri.',
            icon: <MapPin size={32} />,
            link: '/kepengurusan-rw',
            color: '#16a34a'
        },
        {
            title: 'Pengurus RT (Semua)',
            description: 'Manajemen pengurus Rukun Tetangga (RT) di wilayah RW 01.',
            icon: <MapPin size={32} />,
            link: '/kepengurusan-rt',
            color: '#ca8a04'
        }
    ];

    return (
        <div className="container-fluid py-4">
            <div className="mb-4">
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <UserCog size={32} className="text-primary" />
                    Manajemen Kepengurusan
                </h1>
                <p className="text-muted">Pilih kategori struktur organisasi yang ingin dikelola.</p>
            </div>

            <div className="row g-4">
                {categories.map((cat, idx) => (
                    <div key={idx} className="col-md-6 col-lg-3">
                        <NavLink to={cat.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="card h-100 shadow-sm border-0 hover-lift" style={{
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                borderTop: `4px solid ${cat.color}`
                            }}>
                                <div className="card-body p-4">
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '12px',
                                        background: `${cat.color}15`,
                                        color: cat.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {cat.icon}
                                    </div>
                                    <h5 className="fw-bold mb-2">{cat.title}</h5>
                                    <p className="text-muted small mb-4" style={{ height: '3rem', overflow: 'hidden' }}>
                                        {cat.description}
                                    </p>
                                    <div className="d-flex align-items-center fw-bold small" style={{ color: cat.color }}>
                                        Kelola Sekarang <ChevronRight size={16} className="ms-1" />
                                    </div>
                                </div>
                            </div>
                        </NavLink>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-lift:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
                }
            `}} />
        </div>
    );
};

export default KepengurusanLanding;
