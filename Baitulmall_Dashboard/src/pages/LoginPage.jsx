import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { login } from '../services/authApi';

const LoginPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await login(formData.email, formData.password);

            // Determine Role from Backend Data
            const user = response.user || response.data?.user;

            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/621e1365-05bc-449d-a714-261349822a08', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: 'debug-session',
                    runId: 'auth-run-1',
                    hypothesisId: 'H1-H3',
                    location: 'LoginPage.handleSubmit:pre-role',
                    message: 'User object before role derivation',
                    data: {
                        has_user: !!user,
                        has_person: !!user?.person,
                        assignment_count: Array.isArray(user?.person?.assignments) ? user.person.assignments.length : 0,
                    },
                    timestamp: Date.now(),
                }),
            }).catch(() => { });
            // #endregion

            const bypassEmails = [
                'admin@baitulmall.com',
                'admin@baitulmal.com',
                'masyazid@baitulmall.com',
                'fani@baitulmall.com',
                'fajarmaqbulkandri@gmail.com'
            ];

            const userEmail = (user?.email || '').toLowerCase().trim();
            let role = 'User';
            let permissions = [];

            // Check assignments
            const assignments = user?.person?.assignments || [];
            const activeAssignment = assignments.find(a => a.status === 'Aktif' || a.status === 'aktif');

            if (bypassEmails.includes(userEmail)) {
                role = 'Super Admin';
                permissions = activeAssignment?.role?.permissions || [];
            } else if (activeAssignment) {
                const jabatan = activeAssignment.jabatan || '';
                permissions = activeAssignment.role?.permissions || [];

                if (jabatan === 'Bendahara Umum' || jabatan === 'Ketua Umum' || jabatan === 'Super Admin') {
                    role = 'Super Admin';
                } else if (jabatan === 'Admin Keuangan' || jabatan.includes('Bendahara')) {
                    role = 'Admin Keuangan';
                } else if (jabatan === 'User RT' || jabatan.includes('RT')) {
                    role = 'User RT';
                } else if (jabatan === 'Admin Zakat') {
                    role = 'Admin Zakat';
                }
            }

            // Store role and full user data (with permissions)
            localStorage.setItem('app_role', role);
            localStorage.setItem('app_user', JSON.stringify({
                ...user,
                permissions: permissions
            }));

            navigate('/');
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.message || 'Email atau kata sandi salah. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm opacity-40 transition-all duration-700"
                style={{ backgroundImage: "url('/logo.png')" }}
            ></div>
            <div className="absolute inset-0 z-1 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-900/80"></div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-8 mx-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
                                <img src="/logo.png" alt="Baitul Mal Logo" className="h-16 w-auto" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Selamat Datang</h1>
                        <p className="text-slate-300">Silakan masuk ke akun Baitul Mal Anda</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 flex items-center gap-3 text-red-200 text-sm animate-shake">
                                <AlertCircle size={18} className="flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-200 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    disabled={loading}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50"
                                    placeholder="nama@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-200 ml-1">Kata Sandi</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    disabled={loading}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm px-1">
                            <label className="flex items-center text-slate-300 cursor-pointer">
                                <input type="checkbox" className="rounded border-white/10 bg-white/5 text-blue-500 mr-2 focus:ring-0 focus:ring-offset-0 transition-all" />
                                Ingat saya
                            </label>
                            <Link to="/forgot-password" size="sm" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">Lupa sandi?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-blue-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 size={20} className="spin" />
                            ) : (
                                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                            )}
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>

                    {/* Google Login Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#1e293b] px-3 text-slate-400">Atau masuk dengan</span>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google/redirect`);
                                const data = await response.json();
                                if (data.url) {
                                    window.location.href = data.url;
                                }
                            } catch (err) {
                                console.error('Google login error:', err);
                                setError('Gagal menghubungkan ke Google.');
                            }
                        }}
                        className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 group"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Lanjutkan dengan Google
                    </button>

                    {/* Footer */}
                    <div className="mt-8 text-center text-slate-400">
                        <p>Belum punya akun?{' '}
                            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                                Daftar Sekarang
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Visual Accent */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
            </div>
        </div>
    );
};

export default LoginPage;
