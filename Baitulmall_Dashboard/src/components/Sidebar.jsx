import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    BarChart3,
    Users,
    Heart,
    Wallet,
    Gift,
    ShieldCheck,
    LayoutDashboard,
    Coins,
    Map,
    Box,
    ArrowLeftRight,
    ShoppingBag,
    Globe
} from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Inventaris Aset', icon: <Box size={20} />, path: '/inventory' },
        { name: 'Peminjaman', icon: <ArrowLeftRight size={20} />, path: '/inventory/loans' },
        { name: 'Zakat Fitrah', icon: <Gift size={20} />, path: '/zakat-fitrah' },
        { name: 'Sedekah', icon: <Heart size={20} />, path: '/sedekah' },
        { name: 'Santunan', icon: <ShieldCheck size={20} />, path: '/santunan' },
        { name: 'Zakat Mall', icon: <Coins size={20} />, path: '/zakat-mall' },
        { name: 'Manajemen Asnaf', icon: <Users size={20} />, path: '/asnaf' },
        { name: 'Kepengurusan', icon: <Wallet size={20} />, path: '/kepengurusan' },
        { name: 'Etalase UMKM', icon: <ShoppingBag size={20} />, path: '/etalase' },
        { name: 'Lihat Public', icon: <Globe size={20} />, path: '/public' },
    ];

    return (
        <aside className="sidebar">
            <div className="logo">
                <div style={{
                    width: '35px',
                    height: '35px',
                    background: 'var(--primary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.25rem',
                    fontWeight: 800
                }}>B</div>
                <span style={{ color: 'var(--sidebar-text)' }}>BAITULMAL</span>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-links">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Account</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.25rem' }}>Administrator</p>
                    <NavLink to="/preference" style={{ color: 'var(--text-muted)', cursor: 'pointer' }} title="User Preferences">
                        <LayoutDashboard size={18} />
                    </NavLink>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
