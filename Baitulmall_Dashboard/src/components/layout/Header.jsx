import React, { useEffect } from 'react';
import { Menu, Search, Maximize, Bell, MessagesSquare } from 'lucide-react';

const Header = () => {
    // Fungsi manual untuk toggle sidebar tanpa jQuery/Data API jika diperlukan
    const toggleSidebar = (e) => {
        e.preventDefault();
        document.body.classList.toggle('sidebar-collapse');
        document.body.classList.toggle('sidebar-open'); // Untuk mobile
    };

    return (
        <nav className="app-header navbar navbar-expand bg-body">
            <div className="container-fluid">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            data-lte-toggle="sidebar"
                            href="#"
                            role="button"
                            onClick={toggleSidebar}
                        >
                            <Menu size={20} />
                        </a>
                    </li>
                    <li className="nav-item d-none d-md-block">
                        <a href="/" className="nav-link">Home</a>
                    </li>
                    <li className="nav-item d-none d-md-block">
                        <a href="#" className="nav-link">Contact</a>
                    </li>
                </ul>

                <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                        <a className="nav-link" href="#" data-lte-toggle="fullscreen">
                            <Search size={20} />
                        </a>
                    </li>
                    <li className="nav-item dropdown">
                        <a className="nav-link" data-bs-toggle="dropdown" href="#">
                            <MessagesSquare size={20} />
                            <span className="navbar-badge badge text-bg-danger">3</span>
                        </a>
                    </li>
                    <li className="nav-item dropdown">
                        <a className="nav-link" data-bs-toggle="dropdown" href="#">
                            <Bell size={20} />
                            <span className="navbar-badge badge text-bg-warning">15</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={() => document.documentElement.requestFullscreen()}>
                            <Maximize size={20} />
                        </a>
                    </li>
                    <li className="nav-item user-menu">
                        <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                            <img src="https://ui-avatars.com/api/?name=Admin+Baitulmall" className="user-image rounded-circle shadow" alt="User Image" />
                            <span className="d-none d-md-inline">Administrator</span>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Header;
