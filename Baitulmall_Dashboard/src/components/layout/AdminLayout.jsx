import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';

const AdminLayout = ({ children }) => {
    // Pastikan class layout yang benar terpasang di body saat mount
    useEffect(() => {
        document.body.classList.add('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');

        return () => {
            document.body.classList.remove('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');
        };
    }, []);

    return (
        <div className="app-wrapper">
            <Sidebar />

            <main className="app-main">
                {/* Content Header (Page header) bisa ditambahkan dinamis di sini jika perlu */}

                <div className="app-content">
                    <div className="container-fluid py-4">
                        {children || <Outlet />}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminLayout;
