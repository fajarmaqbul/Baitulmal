import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Plus,
    Edit2,
    Trash2,
    Users,
    FileText,
    Save,
    X,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { fetchRTs } from '../services/asnafApi';

// Centralized api instance is imported

const SignatureManager = () => {
    const [signers, setSigners] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [signerForm, setSignerForm] = useState({
        nama_pejabat: '',
        jabatan: '',
        nip: ''
    });
    const [editingSigner, setEditingSigner] = useState(null);

    const [ruleForm, setRuleForm] = useState({
        page_name: 'zakat_fitrah',
        category_filter: 'ALL',
        rt_filter: 'ALL',
        left_signer_id: '',
        right_signer_id: ''
    });
    const [editingRuleId, setEditingRuleId] = useState(null);

    const [rts, setRts] = useState([]);

    useEffect(() => {
        const fetchMaster = async () => {
            setLoading(true);
            try {
                const [signerRes, ruleRes, rtData] = await Promise.all([
                    api.get('/signers'),
                    api.get('/signature-rules'),
                    fetchRTs()
                ]);
                setSigners(signerRes.data.data);
                setRules(ruleRes.data.data);
                setRts(Array.isArray(rtData) ? rtData : (rtData.data || []));
            } catch (err) {
                console.error("Failed to load signature data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMaster();
    }, [refreshTrigger]);

    // --- Signer Logic ---

    const handleSaveSigner = async (e) => {
        e.preventDefault();
        try {
            if (editingSigner) {
                await api.put(`/signers/${editingSigner.id}`, signerForm);
            } else {
                await api.post('/signers', signerForm);
            }
            setSignerForm({ nama_pejabat: '', jabatan: '', nip: '' });
            setEditingSigner(null);
            setRefreshTrigger(p => p + 1);
        } catch (err) {
            alert('Gagal menyimpan data pejabat');
        }
    };

    const handleDeleteSigner = async (id) => {
        if (!window.confirm('Hapus pejabat ini? Aturan yang menggunakan pejabat ini akan kehilangan referensi.')) return;
        try {
            await api.delete(`/signers/${id}`);
            setRefreshTrigger(p => p + 1);
        } catch (err) {
            alert('Gagal menghapus data');
        }
    };

    const startEditSigner = (signer) => {
        setEditingSigner(signer);
        setSignerForm({
            nama_pejabat: signer.nama_pejabat,
            jabatan: signer.jabatan,
            nip: signer.nip || ''
        });
    };

    // --- Rule Logic ---

    const handleSaveRule = async () => {
        try {
            // Validation
            if (!ruleForm.left_signer_id && !ruleForm.right_signer_id) {
                alert('Pilih minimal satu pejabat penanda tangan.');
                return;
            }

            const payload = {
                ...ruleForm,
                left_signer_id: ruleForm.left_signer_id || null,
                right_signer_id: ruleForm.right_signer_id || null,
            };

            if (editingRuleId) {
                await api.put(`/signature-rules/${editingRuleId}`, payload);
            } else {
                await api.post('/signature-rules', payload);
            }

            // Reset
            setRuleForm(prev => ({ ...prev, category_filter: 'ALL', rt_filter: 'ALL', left_signer_id: '', right_signer_id: '' }));
            setEditingRuleId(null);
            setRefreshTrigger(p => p + 1);
        } catch (err) {
            alert('Gagal menyimpan aturan: ' + (err.response?.data?.message || err.message));
        }
    };

    const startEditRule = (rule) => {
        setEditingRuleId(rule.id);
        setRuleForm({
            page_name: rule.page_name,
            category_filter: rule.category_filter || 'ALL',
            rt_filter: rule.rt_filter || 'ALL',
            left_signer_id: rule.left_signer_id || '',
            right_signer_id: rule.right_signer_id || ''
        });
        // Scroll to top of form
        document.querySelector('.rules-form-container')?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEditRule = () => {
        setEditingRuleId(null);
        setRuleForm(prev => ({ ...prev, category_filter: 'ALL', rt_filter: 'ALL', left_signer_id: '', right_signer_id: '' }));
    };

    const handleDeleteRule = async (id) => {
        if (!window.confirm('Hapus aturan ini?')) return;
        try {
            await api.delete(`/signature-rules/${id}`);
            setRefreshTrigger(p => p + 1);
        } catch (err) {
            alert('Gagal menghapus aturan');
        }
    };

    const pageOptions = [
        { val: 'zakat_fitrah', label: 'Zakat Fitrah' },
        { val: 'zakat_mall', label: 'Zakat Mall (Profesi/Harta)' },
        { val: 'sedekah', label: 'Sedekah / Infaq' },
        { val: 'santunan', label: 'Santunan / Operasional' },
        { val: 'asnaf', label: 'Data Asnaf' },
    ];

    const categoryOptions = [
        'ALL', 'Fakir', 'Miskin', 'Amil', 'Mualaf', 'Riqab', 'Gharim', 'Fisabilillah', 'Ibnu Sabil',
        'Operasional', 'Pembangunan', 'Yatim', 'Janda'
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>

            {/* Left Column: Master Signers */}
            <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users className="text-primary" size={20} /> 1. Master Penandatangan
                </h3>

                <div className="list-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {signers.map(s => (
                        <div key={s.id} style={{
                            padding: '1rem',
                            background: editingSigner?.id === s.id ? 'rgba(0,144,231,0.1)' : 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.nama_pejabat}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.jabatan} {s.nip ? `(${s.nip})` : ''}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-icon" onClick={() => startEditSigner(s)}><Edit2 size={14} /></button>
                                <button className="btn-icon text-danger" onClick={() => handleDeleteSigner(s.id)}><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                    {signers.length === 0 && !loading && <div className="text-muted text-center" style={{ fontSize: '0.9rem' }}>Belum ada data pejabat.</div>}
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <h5 style={{ marginBottom: '1rem' }}>{editingSigner ? 'Edit Pejabat' : 'Tambah Pejabat Baru'}</h5>
                    <form onSubmit={handleSaveSigner} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group">
                            <input
                                className="input"
                                placeholder="Nama Lengkap"
                                value={signerForm.nama_pejabat}
                                onChange={e => setSignerForm({ ...signerForm, nama_pejabat: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className="input"
                                placeholder="Jabatan (e.g. Ketua Baitulmal)"
                                value={signerForm.jabatan}
                                onChange={e => setSignerForm({ ...signerForm, jabatan: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className="input"
                                placeholder="NIP (Opsional)"
                                value={signerForm.nip}
                                onChange={e => setSignerForm({ ...signerForm, nip: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {editingSigner && (
                                <button type="button" className="btn btn-outline" onClick={() => { setEditingSigner(null); setSignerForm({ nama_pejabat: '', jabatan: '', nip: '' }); }}>
                                    Batal
                                </button>
                            )}
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                {editingSigner ? 'Update Data' : '+ Tambah Data'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Rules */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText className="text-primary" size={20} /> 2. Aturan Tanda Tangan (Rules)
                </h3>

                <div className="glass-card rules-form-container" style={{ background: 'rgba(0,144,231,0.05)', border: '1px dashed var(--primary)', marginBottom: '2rem' }}>
                    <h5 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{editingRuleId ? 'Edit Aturan' : 'Buat Aturan Baru'}</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>Halaman</label>
                            <select
                                className="input"
                                value={ruleForm.page_name}
                                onChange={e => setRuleForm({ ...ruleForm, page_name: e.target.value })}
                            >
                                {pageOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>Kategori</label>
                            <select
                                className="input"
                                value={ruleForm.category_filter}
                                onChange={e => setRuleForm({ ...ruleForm, category_filter: e.target.value })}
                            >
                                <option value="ALL">Semua Kategori</option>
                                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>Wilayah RT</label>
                            <select
                                className="input"
                                value={ruleForm.rt_filter}
                                onChange={e => setRuleForm({ ...ruleForm, rt_filter: e.target.value })}
                            >
                                <option value="ALL">Semua RT</option>
                                {rts.map(r => <option key={r.id} value={r.kode}>RT {r.kode}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>Kiri (Pihak 1)</label>
                            <select
                                className="input"
                                value={ruleForm.left_signer_id}
                                onChange={e => setRuleForm({ ...ruleForm, left_signer_id: e.target.value })}
                            >
                                <option value="">- Pilih Pejabat -</option>
                                {signers.map(s => <option key={s.id} value={s.id}>{s.nama_pejabat} ({s.jabatan})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>Kanan (Pihak 2)</label>
                            <select
                                className="input"
                                value={ruleForm.right_signer_id}
                                onChange={e => setRuleForm({ ...ruleForm, right_signer_id: e.target.value })}
                            >
                                <option value="">- Pilih Pejabat -</option>
                                {signers.map(s => <option key={s.id} value={s.id}>{s.nama_pejabat} ({s.jabatan})</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {editingRuleId && (
                            <button className="btn btn-outline" style={{ width: '100px' }} onClick={cancelEditRule}>
                                Batal
                            </button>
                        )}
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveRule}>
                            {editingRuleId ? 'UPDATE RULE' : 'SIMPAN RULE'}
                        </button>
                    </div>
                </div>

                <div className="rules-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {rules.length === 0 && <div className="text-muted text-center">Belum ada aturan yang dibuat.</div>}
                    {rules.map(r => (
                        <div key={r.id} style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>{r.page_name.replace('_', ' ')}</span>
                                    {r.category_filter !== 'ALL' && <span className="badge badge-warning">{r.category_filter}</span>}
                                    {r.rt_filter !== 'ALL' && <span className="badge badge-success">RT {r.rt_filter}</span>}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-icon" onClick={() => startEditRule(r)}><Edit2 size={14} /></button>
                                    <button className="btn-icon text-danger" onClick={() => handleDeleteRule(r.id)}><Trash2 size={14} /></button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <div>
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Kiri:</span><br />
                                    <strong>{r.left_signer?.nama_pejabat || '-'}</strong>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Kanan:</span><br />
                                    <strong>{r.right_signer?.nama_pejabat || '-'}</strong>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SignatureManager;
