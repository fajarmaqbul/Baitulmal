import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, UsersRound, HeartHandshake, Briefcase, Baby, Settings, LogOut, HandCoins, UserCog, MapPin, Calendar, Landmark, Box, ArrowLeftRight, MessageSquare, Shield, FileText, ShoppingBag, Globe, BookOpen, Scale, ChevronDown, ChevronRight } from 'lucide-react';
import { logout } from '../../services/authApi';
import { useRole, ROLES } from '../../contexts/RoleContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const [kepengurusanOpen, setKepengurusanOpen] = React.useState(false);
    const { hasPermission, currentRole } = useRole();

    const [openCategories, setOpenCategories] = React.useState({
        utama: true,
        zis: true,
        master: true,
        aset: true,
        umkm: true,
        portal: true,
        admin: true,
        akses: true
    });

    const toggleCategory = (cat) => {
        setOpenCategories(prev => ({
            ...prev,
            [cat]: !prev[cat]
        }));
    };

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
    };

    return (
        <nav className="sidebar" id="sidebar">
            <div className="sidebar-brand-wrapper d-none d-lg-flex align-items-center justify-content-center" style={{ height: '70px', padding: '10px' }}>
                <a className="sidebar-brand brand-logo" href="/" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.5rem', textDecoration: 'none', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(0, 144, 231, 0.2)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Landmark size={28} />
                    </div>
                    <span style={{ fontSize: '1.1rem' }}>BAITULMAL</span>
                </a>
            </div>

            <ul className="nav">

                <li className="nav-category" onClick={() => toggleCategory('utama')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>UTAMA</span>
                    {openCategories.utama ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </li>
                {openCategories.utama && hasPermission('Dashboard') && (
                    <li className="nav-item menu-items">
                        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="menu-icon" style={{ background: 'rgba(0, 144, 231, 0.1)', color: 'var(--primary)' }}>
                                <LayoutDashboard size={18} />
                            </span>
                            <span className="menu-title">Dashboard</span>
                        </NavLink>
                    </li>
                )}

                <li className="nav-category" onClick={() => toggleCategory('zis')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>LAYANAN ZIS</span>
                    {openCategories.zis ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </li>
                {openCategories.zis && (
                    <>
                        {hasPermission('Zakat Fitrah') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/zakat-fitrah" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(0, 210, 91, 0.1)', color: 'var(--success)' }}>
                                        <HandCoins size={18} />
                                    </span>
                                    <span className="menu-title">Zakat Fitrah</span>
                                </NavLink>
                            </li>
                        )}

                        {hasPermission('Zakat Mal') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/zakat-mall" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(255, 171, 0, 0.08)', color: 'var(--warning)' }}>
                                        <Briefcase size={18} />
                                    </span>
                                    <span className="menu-title">Zakat Mal</span>
                                </NavLink>
                            </li>
                        )}

                        {hasPermission('Zakat Produktif') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/zakat-produktif" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(0, 144, 231, 0.1)', color: 'var(--primary)' }}>
                                        <Landmark size={18} />
                                    </span>
                                    <span className="menu-title">Zakat Produktif</span>
                                </NavLink>
                            </li>
                        )}

                        {hasPermission('Sedekah') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/sedekah" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(252, 66, 74, 0.1)', color: 'var(--danger)' }}>
                                        <HeartHandshake size={18} />
                                    </span>
                                    <span className="menu-title">Sedekah</span>
                                </NavLink>
                            </li>
                        )}

                        {hasPermission('Santunan') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/santunan" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(143, 95, 232, 0.08)', color: 'var(--info)' }}>
                                        <Baby size={18} />
                                    </span>
                                    <span className="menu-title">Santunan</span>
                                </NavLink>
                            </li>
                        )}

                        {hasPermission('Donasi Tematik') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/crowdfunding" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(252, 66, 74, 0.1)', color: 'var(--danger)' }}>
                                        <HeartHandshake size={18} />
                                    </span>
                                    <span className="menu-title">Donasi Tematik</span>
                                </NavLink>
                            </li>
                        )}
                    </>
                )}

                <li className="nav-category" onClick={() => toggleCategory('master')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>MASTER & PENGURUS</span>
                    {openCategories.master ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </li>
                {openCategories.master && (
                    <>
                        {hasPermission('Kepengurusan') && (
                            <li className="nav-item menu-items">
                                <div
                                    className="nav-link"
                                    onClick={() => setKepengurusanOpen(!kepengurusanOpen)}
                                    style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span className="menu-icon" style={{ background: 'rgba(105, 112, 122, 0.08)', color: 'var(--text-muted)' }}>
                                            <UserCog size={18} />
                                        </span>
                                        <span className="menu-title">Kepengurusan</span>
                                    </div>
                                    <i className={`mdi ${kepengurusanOpen ? 'mdi-chevron-down' : 'mdi-chevron-right'}`} style={{ fontSize: '1rem' }}></i>
                                </div>
                                {kepengurusanOpen && (
                                    <ul className="flex-column" style={{ listStyle: 'none', padding: '0.5rem 0 0.5rem 1.5rem', margin: 0 }}>
                                        <li className="nav-item">
                                            <NavLink to="/kepengurusan-takmir" className="nav-link" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>Pengurus Takmir</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to="/kepengurusan-baitulmall" className="nav-link" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>Pengurus Baitulmal</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to="/kepengurusan-rw" className="nav-link" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>Pengurus RW</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to="/kepengurusan-rt" className="nav-link" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>Pengurus RT</NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        )}

                        {hasPermission('Kepengurusan') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/sdm/overview" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(0, 144, 231, 0.1)', color: 'var(--primary)' }}>
                                        <UsersRound size={18} />
                                    </span>
                                    <span className="menu-title">Database SDM (Warga)</span>
                                    <span style={{ marginLeft: '10px', fontSize: '10px', background: 'var(--primary)', padding: '2px 6px', borderRadius: '10px', color: '#fff' }}>Baru</span>
                                </NavLink>
                            </li>
                        )}

                        {hasPermission('Data Asnaf') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/asnaf" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(0, 144, 231, 0.1)', color: 'var(--primary)' }}>
                                        <UsersRound size={18} />
                                    </span>
                                    <span className="menu-title">Data Asnaf (Master)</span>
                                </NavLink>
                            </li>
                        )}

                        {hasPermission('Event & Panitia') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/event-management" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(0, 210, 91, 0.1)', color: 'var(--success)' }}>
                                        <Calendar size={18} />
                                    </span>
                                    <span className="menu-title">Event & Panitia</span>
                                </NavLink>
                            </li>
                        )}
                    </>
                )}

                <li className="nav-category" onClick={() => toggleCategory('aset')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>ASET & LOGISTIK</span>
                    {openCategories.aset ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </li>
                {openCategories.aset && (
                    <>
                        {hasPermission('Inventaris Aset') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/inventory" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(0, 144, 231, 0.1)', color: 'var(--primary)' }}>
                                        <Box size={18} />
                                    </span>
                                    <span className="menu-title">Inventaris Aset</span>
                                </NavLink>
                            </li>
                        )}

                        {hasPermission('Inventaris Aset') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/inventory/loans" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(255, 171, 0, 0.08)', color: 'var(--warning)' }}>
                                        <ArrowLeftRight size={18} />
                                    </span>
                                    <span className="menu-title">Peminjaman</span>
                                </NavLink>
                            </li>
                        )}
                    </>
                )}

                <li className="nav-category" onClick={() => toggleCategory('umkm')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>EKONOMI UMKM</span>
                    {openCategories.umkm ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </li>
                {openCategories.umkm && (
                    <>
                        <li className="nav-item menu-items">
                            <NavLink to="/product-management" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="menu-icon" style={{ background: 'rgba(0, 144, 231, 0.1)', color: 'var(--primary)' }}>
                                    <ShoppingBag size={18} />
                                </span>
                                <span className="menu-title">Manajemen Produk</span>
                            </NavLink>
                        </li>
                        <li className="nav-item menu-items">
                            <NavLink to="/etalase" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="menu-icon" style={{ background: 'rgba(0, 144, 231, 0.1)', color: 'var(--primary)' }}>
                                    <ShoppingBag size={18} />
                                </span>
                                <span className="menu-title">Etalase UMKM</span>
                            </NavLink>
                        </li>
                    </>
                )}

                <li className="nav-category" onClick={() => toggleCategory('portal')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>PORTAL PUBLIK</span>
                    {openCategories.portal ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </li>
                {openCategories.portal && (
                    <>
                        <li className="nav-item menu-items">
                            <NavLink to="/tatakelola" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="menu-icon" style={{ background: 'rgba(0, 144, 231, 0.1)', color: 'var(--primary)' }}>
                                    <BookOpen size={18} />
                                </span>
                                <span className="menu-title">Tata Kelola Umum</span>
                            </NavLink>
                        </li>
                        <li className="nav-item menu-items">
                            <NavLink to="/tatakelola/zakat-fitrah" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="menu-icon" style={{ background: 'rgba(0, 210, 91, 0.1)', color: 'var(--success)' }}>
                                    <Scale size={18} />
                                </span>
                                <span className="menu-title">Tata Kelola ZF</span>
                            </NavLink>
                        </li>
                        <li className="nav-item menu-items">
                            <NavLink to="/tatakelola/zakat-produktif" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="menu-icon" style={{ background: 'rgba(255, 171, 0, 0.08)', color: 'var(--warning)' }}>
                                    <Briefcase size={18} />
                                </span>
                                <span className="menu-title">Tata Kelola Produktif</span>
                            </NavLink>
                        </li>
                        <li className="nav-item menu-items">
                            <NavLink to="/public" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="menu-icon" style={{ background: 'rgba(255, 171, 0, 0.08)', color: 'var(--warning)' }}>
                                    <Globe size={18} />
                                </span>
                                <span className="menu-title">Portal Transparansi</span>
                            </NavLink>
                        </li>
                    </>
                )}

                <li className="nav-category" onClick={() => toggleCategory('admin')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>ADMINISTRASI</span>
                    {openCategories.admin ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </li>
                {openCategories.admin && (
                    <>
                        {hasPermission('Riwayat Pesan') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(0, 210, 91, 0.1)', color: 'var(--success)' }}>
                                        <MessageSquare size={18} />
                                    </span>
                                    <span className="menu-title">Riwayat Pesan</span>
                                </NavLink>
                            </li>
                        )}

                        <li className="nav-item menu-items">
                            <NavLink to="/secretariat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="menu-icon" style={{ background: 'rgba(0, 144, 231, 0.1)', color: 'var(--primary)' }}>
                                    <FileText size={18} />
                                </span>
                                <span className="menu-title">Kesekretariatan</span>
                            </NavLink>
                        </li>

                        {hasPermission('Pengaturan') && (
                            <li className="nav-item menu-items">
                                <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="menu-icon" style={{ background: 'rgba(108, 114, 147, 0.1)', color: '#6c7293' }}>
                                        <Settings size={18} />
                                    </span>
                                    <span className="menu-title">Pengaturan</span>
                                </NavLink>
                            </li>
                        )}
                    </>
                )}

                <li className="nav-category" onClick={() => toggleCategory('akses')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>AKSES</span>
                    {openCategories.akses ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </li>
                {openCategories.akses && (
                    <li className="nav-item menu-items">
                        <div onClick={handleLogout} className="nav-link text-danger" style={{ cursor: 'pointer' }}>
                            <span className="menu-icon" style={{ background: 'rgba(252, 66, 74, 0.1)', color: 'var(--danger)' }}>
                                <LogOut size={18} />
                            </span>
                            <span className="menu-title">Logout</span>
                        </div>
                    </li>
                )}
                {/* ROLE INFO - Moved to bottom */}
                <li className="nav-item nav-profile" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <div className="nav-link" style={{ cursor: 'default' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="nav-profile-image">
                                <span className="menu-icon" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                    <Shield size={18} />
                                </span>
                            </div>
                            <div className="d-flex flex-column ms-3">
                                <span className="font-weight-bold mb-0" style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{currentRole}</span>
                                <span className="text-small" style={{ color: 'var(--text-muted)' }}>Logged in</span>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </nav>
    );
};

export default Sidebar;
