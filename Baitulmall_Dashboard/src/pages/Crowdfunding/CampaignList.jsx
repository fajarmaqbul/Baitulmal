
import React, { useState, useEffect } from 'react';
import { fetchCampaigns, createCampaign, deleteCampaign } from '../../services/crowdfundingApi';
import { Plus, Trash2, Calendar, Target, Heart, Shield, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useSignatureRule } from '../../hooks/useSignatureRule';

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { leftSigner, rightSigner } = useSignatureRule('crowdfunding');

    // Form State
    const [form, setForm] = useState({
        title: '',
        slug: '',
        target_amount: '',
        description: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchCampaigns();
            setCampaigns(data);
        } catch (error) {
            console.error("Failed to fetch campaigns", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSlug = (title) => {
        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        setForm(prev => ({ ...prev, title, slug }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCampaign(form);
            setIsDialogOpen(false);
            setForm({
                title: '',
                slug: '',
                target_amount: '',
                description: '',
                start_date: new Date().toISOString().slice(0, 10),
                end_date: '',
                is_active: true
            });
            loadData();
        } catch (error) {
            alert('Gagal membuat campaign: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Yakin ingin menghapus campaign ini?')) {
            try {
                await deleteCampaign(id);
                loadData();
            } catch (error) {
                alert('Gagal menghapus');
            }
        }
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
    };

    const calculateProgress = (collected, target) => {
        if (!target) return 0;
        return Math.min(100, Math.round((collected / target) * 100));
    };

    return (
        <div className="animate-fade-in">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Donasi Tematik</h2>
                    <p className="small mb-0" style={{ color: 'var(--text-muted)' }}>Kelola program penggalangan dana khusus</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    {/* TTD Info */}
                    <div className="d-none d-md-flex align-items-center gap-2 small px-3 py-2 rounded-pill border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                        <Shield size={14} className={leftSigner ? "text-success" : "text-muted"} />
                        <span style={{ color: 'var(--text-muted)' }}>TTD:</span>
                        {leftSigner || rightSigner ? (
                            <strong style={{ color: 'var(--text-main)' }}>
                                {leftSigner?.nama_pejabat?.split(' ')[0] || '?'} & {rightSigner?.nama_pejabat?.split(' ')[0] || '?'}
                            </strong>
                        ) : (
                            <span className="text-danger fst-italic">Belum diset</span>
                        )}
                    </div>

                    <button
                        className="btn btn-primary d-flex align-items-center gap-2 fw-bold"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Plus size={16} /> Buat Campaign Baru
                    </button>
                </div>
            </div>

            {/* GRID CONTENT */}
            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5">
                        <Loader2 className="spin" size={40} style={{ color: 'var(--primary)' }} />
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="col-12">
                        <div className="glass-card text-center py-5" style={{ borderRadius: '16px', borderStyle: 'dashed' }}>
                            <div className="text-muted mb-3"><Heart size={48} style={{ opacity: 0.2 }} /></div>
                            <h5 style={{ color: 'var(--text-muted)' }}>Belum ada campaign aktif</h5>
                            <p className="small text-muted">Silakan buat campaign baru untuk memulai donasi tematik.</p>
                        </div>
                    </div>
                ) : (
                    campaigns.map(campaign => (
                        <div key={campaign.id} className="col-md-6 col-lg-4">
                            <div className="glass-card h-100 d-flex flex-column hover-lift" style={{ borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
                                {/* Progress Bar Top */}
                                <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', position: 'relative' }}>
                                    <div
                                        style={{
                                            position: 'absolute', top: 0, left: 0, height: '100%',
                                            width: `${calculateProgress(campaign.collected_amount, campaign.target_amount)}% `,
                                            background: 'var(--primary)',
                                            transition: 'width 1s ease-in-out'
                                        }}
                                    ></div>
                                </div>

                                <div className="p-4 flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <span className={`badge ${campaign.is_active ? 'bg-success' : 'bg-secondary'} `} style={{ fontSize: '0.7rem' }}>
                                            {campaign.is_active ? "Aktif" : "Selesai"}
                                        </span>
                                        <button className="btn btn-sm btn-ghost p-1 text-danger" onClick={() => handleDelete(campaign.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <h5 className="fw-bold mb-2 line-clamp-2" style={{ color: 'var(--text-main)', minHeight: '3rem' }}>
                                        {campaign.title}
                                    </h5>
                                    <p className="small line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>
                                        {campaign.description || "Tidak ada deskripsi"}
                                    </p>

                                    <div className="d-flex align-items-center justify-content-between small text-muted mb-1">
                                        <span>Terkumpul</span>
                                        <span className="fw-bold" style={{ color: 'var(--success)' }}>{calculateProgress(campaign.collected_amount, campaign.target_amount)}%</span>
                                    </div>
                                    <div className="mb-3">
                                        <div className="d-flex align-items-baseline gap-1">
                                            <span className="fw-bold h5 mb-0" style={{ color: 'var(--text-main)' }}>{formatRupiah(campaign.collected_amount || 0)}</span>
                                            <span className="small text-muted">dari {formatRupiah(campaign.target_amount)}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex items-center gap-4 text-xs text-muted">
                                        <div className="d-flex align-items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                            <Calendar size={14} />
                                            {campaign.end_date ? format(new Date(campaign.end_date), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                                        </div>
                                        <div className="d-flex align-items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                            <Target size={14} />
                                            {campaign.target_amount ? 'Target OK' : 'No Target'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL / DIALOG */}
            {isDialogOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-card shadow-lg p-0 fade-in action-menu" style={{ width: '600px', borderRadius: '16px', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-color)' }}>
                            <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Buat Campaign Baru</h5>
                            <button className="btn btn-sm btn-ghost" onClick={() => setIsDialogOpen(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Judul Campaign</label>
                                            <input
                                                className="input w-100"
                                                placeholder="Misal: Ambulans Gratis"
                                                value={form.title}
                                                onChange={(e) => handleGenerateSlug(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Slug (Auto)</label>
                                            <input
                                                className="input w-100"
                                                style={{ background: 'rgba(0,0,0,0.05)' }}
                                                value={form.slug}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="mb-3">
                                            <label className="label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Target Donasi (Rp)</label>
                                            <div className="input-group">
                                                <span className="input-group-text fw-bold" style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}>Rp</span>
                                                <input
                                                    type="number"
                                                    className="input flex-grow-1"
                                                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                                    value={form.target_amount}
                                                    onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Tanggal Mulai</label>
                                            <input
                                                type="date"
                                                className="input w-100"
                                                value={form.start_date}
                                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Tanggal Selesai</label>
                                            <input
                                                type="date"
                                                className="input w-100"
                                                value={form.end_date}
                                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="mb-3">
                                            <label className="label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Deskripsi Singkat</label>
                                            <textarea
                                                className="input w-100"
                                                rows="3"
                                                value={form.description}
                                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button type="button" className="btn btn-ghost" onClick={() => setIsDialogOpen(false)} style={{ color: 'var(--text-muted)' }}>Batal</button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold">Simpan Campaign</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignList;

