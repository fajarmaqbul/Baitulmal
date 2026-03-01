import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '../services/authApi';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [debugLink, setDebugLink] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await forgotPassword(email);
            setSuccess(true);
            // If in local env, Backend might return a debug link
            if (response.reset_url) {
                setDebugLink(response.reset_url);
            }
        } catch (err) {
            console.error('Forgot password request failed:', err);
            setError(err.message || 'Gagal mengirim tautan pemulihan. Silakan coba lagi.');
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

            {/* Content Card */}
            <div className="relative z-10 w-full max-w-md p-8 mx-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                    {/* Back to Login */}
                    <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Masuk
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-blue-500/20 rounded-2xl border border-blue-500/30 text-blue-400">
                                <Mail size={32} />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Lupa Sandi?</h1>
                        <p className="text-slate-300">Jangan khawatir, kami akan mengirimkan instruksi pemulihan kepada Anda.</p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 flex items-center gap-3 text-red-200 text-sm animate-shake">
                                    <AlertCircle size={18} className="flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-200 ml-1">Alamat Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        disabled={loading}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50"
                                        placeholder="nama@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-blue-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                            >
                                {loading ? (
                                    <Loader2 size={20} className="spin" />
                                ) : (
                                    'Kirim Instruksi'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="bg-green-500/10 border border-green-500/50 rounded-2xl p-6 flex flex-col items-center gap-4 text-green-200 text-sm">
                                <CheckCircle2 size={48} className="text-green-400" />
                                <div className="space-y-2">
                                    <p className="font-bold text-lg">Permintaan Terkirim!</p>
                                    <p>Jika <b>{email}</b> terdaftar di sistem kami, Anda akan segera menerima email pemulihan kata sandi.</p>
                                </div>
                            </div>

                            {debugLink && (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-200 text-xs">
                                    <p className="font-bold mb-2">DEBUG MODE (LOCAL):</p>
                                    <a href={debugLink} className="underline break-all">{debugLink}</a>
                                </div>
                            )}

                            <button
                                onClick={() => setSuccess(false)}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-2xl border border-white/10 transition-all"
                            >
                                Coba email lain
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
