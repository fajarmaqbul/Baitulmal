import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import AIChatAssistant from '../AIChatAssistant';
import { Bot, MessageSquare } from 'lucide-react';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = React.useState(false);

    useEffect(() => {
        // Simple Auth Guard
        const token = localStorage.getItem('auth_token');
        if (!token) {
            navigate('/login');
            return;
        }

        document.body.classList.add('layout-fixed', 'sidebar-expand-lg');
        document.body.style.backgroundColor = 'var(--background)';
        document.body.style.color = 'var(--text-main)';

        // Theme Initialization
        const savedTheme = localStorage.getItem('cardTheme') || 'slate-dark-pro';
        document.documentElement.setAttribute('data-theme', savedTheme);

        return () => {
            document.body.classList.remove('layout-fixed', 'sidebar-expand-lg');
        };
    }, [navigate]);

    return (
        <div className="container-scroller" style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            <Sidebar />

            <div className="container-fluid page-body-wrapper" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main className="main-panel" style={{ flex: 1, marginTop: 0, display: 'flex', flexDirection: 'column' }}>
                    <div className="content-wrapper">
                        {children || <Outlet />}
                    </div>
                    <Footer />
                </main>
            </div>

            {/* AI Assistant Floating Button */}
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all z-50 flex items-center justify-center ${isChatOpen ? 'bg-slate-500 hover:bg-slate-600' : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'}`}
                style={{ width: '60px', height: '60px' }}
                title="Buka Asisten AI"
            >
                {isChatOpen ? <Bot size={30} color="white" /> : <MessageSquare size={28} color="white" fill="white" />}
                {!isChatOpen && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </button>

            {/* AI Chat Layout Interface */}
            <AIChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
};

export default AdminLayout;
