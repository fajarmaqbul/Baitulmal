import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, MapPin, CheckCircle, AlertCircle, Loader2, ArrowRight, Heart } from 'lucide-react';
import axios from '../services/asnafApi'; // Reuse existing axios instance
import { fetchSettingByKey } from '../services/settingApi';

const MuzakiPublicForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [rts, setRts] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        nama: '',
        rt_id: '',
        jumlah_jiwa: '',
        jumlah_beras_kg: '',
        status_bayar: 'belum',
        tahun: new Date().getFullYear().toString()
    });

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // 1. Check if public registration is enabled
                const settingRes = await fetchSettingByKey('enable_online_muzaki');
                if (settingRes && settingRes.value === 'true' || settingRes.value === true) {
                    setEnabled(true);

                    // 2. Fetch RT List
                    const rtRes = await axios.get('/rts');
                    setRts(rtRes.data || []);

                    // 3. Get current ramadhan year
                    const yearSetting = await fetchSettingByKey('current_ramadhan_year');
                    if (yearSetting && yearSetting.value) {
                        setFormData(prev => ({ ...prev, tahun: yearSetting.value.split(' / ')[0] }));
                    }
                } else {
                    setEnabled(false);
                }
            } catch (err) {
                console.error('Error initializing form:', err);
                setError('Gagal memuat sistem pendaftaran. Silakan coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Validation
            if (!formData.nama || !formData.rt_id || !formData.jumlah_jiwa) {
                throw new Error('Mohon lengkapi semua field yang berbintang (*)');
            }

            // In public form, we default to 'belum' status unless they pay online (not implemented yet)
            // But we automatically calculate beras if not provided (assume 2.5kg per person)
            const payload = {
                ...formData,
                jumlah_beras_kg: formData.jumlah_beras_kg || (parseFloat(formData.jumlah_jiwa) * 2.5),
                status_bayar: 'belum' // Public reg is mostly for registration, payment verified later
            };

            await axios.post('/muzaki', payload);
            setSuccess(true);
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.response?.data?.message || err.message || 'Gagal mengirim data. Silakan hubungi admin.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <Loader2 className="w-10 mod-spin text-blue-600" />
            </div>
        );
    }

    if (!enabled && !success) {
        return (
            <div className="public-form-container">
                <div className="public-form-card text-center p-8">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Ditutup</h2>
                    <p className="text-slate-600 mb-6">
                        Maaf, pendaftaran zakat online untuk saat ini sedang tidak aktif.
                        Silakan hubungi petugas masjid untuk informasi lebih lanjut.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="public-form-container">
                <div className="public-form-card text-center p-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h2>
                    <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                        Data Anda telah kami terima. Silakan lakukan pembayaran ke petugas Baitulmal
                        di Masjid atau melalui RT setempat untuk verifikasi akhir.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                        <ArrowRight className="w-5 h-5" />
                        Daftar Lainnya
                    </button>
                </div>
                <p className="mt-8 text-white/70 text-sm">© {new Date().getFullYear()} Baitulmal Masjid Kandri</p>
            </div>
        );
    }

    return (
        <div className="public-form-container py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                            <Heart className="w-8 h-8 text-white fill-current" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-md">Daftar Zakat</h1>
                    <p className="text-blue-100 text-lg opacity-90">Baitulmal Masjid Kandri</p>
                    <div className="mt-2 inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Ramadhan {formData.tahun}</span>
                    </div>
                </div>

                <div className="public-form-card p-8">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-group">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                                <User className="w-4 h-4" />
                                Nama Kepala Keluarga / Muzaki *
                            </label>
                            <input
                                type="text"
                                name="nama"
                                value={formData.nama}
                                onChange={handleChange}
                                placeholder="Masukkan nama lengkap"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-slate-50"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    Wilayah (RT) *
                                </label>
                                <select
                                    name="rt_id"
                                    value={formData.rt_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-slate-50"
                                    required
                                >
                                    <option value="">Pilih RT</option>
                                    {rts.map(rt => (
                                        <option key={rt.id} value={rt.id}>RT {rt.nomor_rt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4" />
                                    Jumlah Jiwa *
                                </label>
                                <input
                                    type="number"
                                    name="jumlah_jiwa"
                                    value={formData.jumlah_jiwa}
                                    onChange={handleChange}
                                    placeholder="Contoh: 4"
                                    min="1"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-slate-50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-2">
                            <p className="text-xs text-blue-700 leading-relaxed italic">
                                * Pendaftaran online akan kami verifikasi saat pembayaran diterima oleh petugas Baitulmal.
                                Estimasi zakat fitrah: {formData.jumlah_jiwa ? (parseFloat(formData.jumlah_jiwa) * 2.5).toFixed(1) : '0'} KG Beras.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mod-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    Kirim Pendaftaran
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-white/70 text-sm">
                    Butuh bantuan? Hubungi Sekretariat Baitulmal.
                </p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .public-form-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                }
                .public-form-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    width: 100%;
                }
                .form-group label {
                    display: flex;
                    align-items: center;
                }
                @keyframes mod-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .mod-spin {
                    animation: mod-spin 1s linear infinite;
                }
            `}} />
        </div>
    );
};

export default MuzakiPublicForm;
