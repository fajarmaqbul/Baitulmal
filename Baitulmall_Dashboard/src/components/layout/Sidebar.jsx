import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UsersRound, HeartHandshake, Briefcase, Baby, Settings, LogOut, HandCoins, UserCog, MapPin, Calendar } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
            <div className="sidebar-brand">
                <a href="/" className="brand-link">
                    <img src="https://adminlte.io/themes/v3/dist/img/AdminLTELogo.png" alt="Logo" className="brand-image opacity-75 shadow" />
                    <span className="brand-text fw-light">Baitulmall</span>
                </a>
            </div>

            <div className="sidebar-wrapper">
                <nav className="mt-2">
                    <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu" data-accordion="false">
                        <li className="nav-item">
                            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <LayoutDashboard size={18} className="nav-icon" />
                                <p>Dashboard</p>
                            </NavLink>
                        </li>

                        <li className="nav-header">MANAJEMEN</li>

                        <li className="nav-item">
                            <NavLink to="/zakat-fitrah" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <HandCoins size={18} className="nav-icon" />
                                <p>Zakat Fitrah</p>
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/zakat-mall" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Briefcase size={18} className="nav-icon" />
                                <p>Zakat Mal</p>
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/sedekah" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <HeartHandshake size={18} className="nav-icon" />
                                <p>Sedekah</p>
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/santunan" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Baby size={18} className="nav-icon" />
                                <p>Santunan</p>
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/kepengurusan" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <UserCog size={18} className="nav-icon" />
                                <p>Kepengurusan</p>
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/event-management" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Calendar size={18} className="nav-icon" />
                                <p>Event & Panitia</p>
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/asnaf" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <UsersRound size={18} className="nav-icon" />
                                <p>Data Asnaf</p>
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/peta-asnaf" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <MapPin size={18} className="nav-icon" />
                                <p>Peta Asnaf</p>
                            </NavLink>
                        </li>

                        <li className="nav-header">PENGATURAN</li>

                        <li className="nav-item">
                            <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Settings size={18} className="nav-icon" />
                                <p>Pengaturan</p>
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <a href="#" className="nav-link text-danger">
                                <LogOut size={18} className="nav-icon" />
                                <p>Logout</p>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
