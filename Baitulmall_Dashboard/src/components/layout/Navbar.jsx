import React, { useState, useEffect } from 'react';
import { Search, Menu, MessageSquare, Bell, ChevronDown, Maximize, User, LogOut, Settings, Globe, BookOpen, Scale, Landmark } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user data from localStorage", error);
                setUser(null);
            }
        }
    }, []);

    return (
        <nav className="navbar" style={{ padding: '0 1.5rem', background: 'var(--card-bg)', zIndex: 1030, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <div className="container-fluid d-flex align-items-center justify-content-between">
                {/* Left Section: Toggler & Local Info */}
                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-icon"
                        style={{ color: 'var(--text-muted)', width: '38px', height: '38px' }}
                        onClick={() => document.body.classList.toggle('sidebar-collapse')}
                    >
                        <Menu size={18} />
                    </button>
                    <div className="d-none d-md-block ms-2">
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Ringkasan / <span style={{ color: 'var(--primary)' }}>Overview</span>
                        </span>
                    </div>
                </div>

                {/* Center Section: Search Bar - Standardized */}
                <div className="d-none d-lg-block flex-grow-1 mx-5" style={{ maxWidth: '450px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.7 }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Cari data, laporan, atau asnaf..."
                            style={{
                                width: '100%',
                                paddingLeft: '2.5rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border-color)',
                                height: '36px',
                                fontSize: '0.8rem',
                                borderRadius: '8px'
                            }}
                        />
                    </div>
                </div>

                {/* Right Section: Notifications & Profile */}
                <div className="d-flex align-items-center gap-1">
                    <div className="d-flex align-items-center me-1">
                        <button className="btn btn-icon" style={{ color: 'var(--text-muted)', width: '36px', height: '36px' }}>
                            <MessageSquare size={16} />
                        </button>
                        <button className="btn btn-icon" style={{ color: 'var(--text-muted)', position: 'relative', width: '36px', height: '36px' }}>
                            <Bell size={16} />
                            <span style={{ position: 'absolute', top: '8px', right: '8px', width: '5px', height: '5px', background: 'var(--danger)', borderRadius: '50%', border: '1px solid var(--card-bg)' }}></span>
                        </button>
                    </div>

                    <div className="vr d-none d-md-block mx-2" style={{ height: '20px', opacity: 0.1, background: 'var(--text-muted)' }}></div>

                    {/* Public Portals Dropdown */}
                    <div className="dropdown">
                        <button
                            className="btn d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                            style={{
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border-color)',
                                background: 'rgba(255,255,255,0.02)',
                                fontSize: '0.8rem',
                                fontWeight: 700
                            }}
                            type="button"
                            data-bs-toggle="dropdown"
                        >
                            <Globe size={16} className="text-primary" />
                            <span className="d-none d-md-inline">Public Portals</span>
                            <ChevronDown size={12} opacity={0.5} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 p-2" style={{ background: 'var(--card-bg)', minWidth: '220px', borderRadius: '16px', marginTop: '10px' }}>
                            <li>
                                <NavLink to="/tatakelola" className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 px-3 mb-1" style={{ color: 'var(--text-muted)' }}>
                                    <div className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary"><BookOpen size={16} /></div>
                                    <div>
                                        <div className="fw-bold text-white small">Tata Kelola Umum</div>
                                        <div style={{ fontSize: '0.65rem' }}>Prinsip & Transparansi</div>
                                    </div>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/tatakelola/zakat-fitrah" className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 px-3 mb-1" style={{ color: 'var(--text-muted)' }}>
                                    <div className="p-2 bg-success bg-opacity-10 rounded-3 text-success"><Scale size={16} /></div>
                                    <div>
                                        <div className="fw-bold text-white small">Tata Kelola ZF</div>
                                        <div style={{ fontSize: '0.65rem' }}>Edukasi & Porsi 8 Asnaf</div>
                                    </div>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/tatakelola/zakat-produktif" className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 px-3 mb-1" style={{ color: 'var(--text-muted)' }}>
                                    <div className="p-2 bg-warning bg-opacity-10 rounded-3 text-warning"><Landmark size={16} /></div>
                                    <div>
                                        <div className="fw-bold text-white small">Tata Kelola Produktif</div>
                                        <div style={{ fontSize: '0.65rem' }}>Pemberdayaan Ekonomi</div>
                                    </div>
                                </NavLink>
                            </li>
                            <li><hr className="dropdown-divider opacity-10" /></li>
                            <li>
                                <NavLink to="/public" className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 px-3" style={{ color: 'var(--text-muted)' }}>
                                    <div className="p-2 bg-info bg-opacity-10 rounded-3 text-info"><Globe size={16} /></div>
                                    <div>
                                        <div className="fw-bold text-white small">Portal Transparansi</div>
                                        <div style={{ fontSize: '0.65rem' }}>Dashboard Publik</div>
                                    </div>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    <div className="vr d-none d-md-block mx-2" style={{ height: '20px', opacity: 0.1, background: 'var(--text-muted)' }}></div>

                    <div className="dropdown">
                        <div
                            className="d-flex align-items-center gap-2"
                            style={{ cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '10px', transition: 'all 0.2s', border: '1px solid transparent' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >

                            <div className="profile-img" style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'var(--avatar-bg)',
                                color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid var(--avatar-border)'
                            }}>
                                <User size={16} />
                            </div>
                            <div className="d-none d-sm-flex flex-column" style={{ lineHeight: 1 }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.name || 'Admin'}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{user?.role || 'Superuser'}</span>
                            </div>
                            <ChevronDown size={12} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
