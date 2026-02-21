import React, { useState, useEffect } from 'react';
import {
    Calculator,
    Coins,
    RefreshCcw,
    Save,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    Info,
    History,
    FileText
} from 'lucide-react';
import { fetchGoldPrice, updateGoldPrice, calculateZakat, saveCalculation } from '../../services/zakatCalculatorApi';
import { fetchMuzakis } from '../../services/muzakiApi';

const ZakatCalculator = () => {
    // State
    const [loading, setLoading] = useState(false);
    const [goldPrice, setGoldPrice] = useState({ price_per_gram: 0, currency: 'IDR' });
    const [zakatType, setZakatType] = useState('Maal');
    const [muzakiList, setMuzakiList] = useState([]);
    const [selectedMuzaki, setSelectedMuzaki] = useState('');
    const [calculationResult, setCalculationResult] = useState(null);
    const [haulMet, setHaulMet] = useState(true);
    const [historyList, setHistoryList] = useState([]);

    // Form Inputs
    const [formData, setFormData] = useState({
        // Maal
        total_harta: '',
        hutang: '',
        // Perdagangan
        modal_diputar: '',
        keuntungan: '',
        piutang_lancar: '',
        hutang_jatuh_tempo: '',
        // Profesi
        period: 'monthly',
        income: '',
        bonus: '',
        needs: '',
        debt: ''
    });

    // Fetch Initial Data
    useEffect(() => {
        loadGoldPrice();
        loadMuzakis();
    }, []);

    const loadGoldPrice = async () => {
        try {
            const res = await fetchGoldPrice();
            if (res.success) {
                setGoldPrice(res.data);
            }
        } catch (err) {
            console.error('Failed to load gold price', err);
        }
    };

    const loadMuzakis = async () => {
        try {
            const res = await fetchMuzakis({ per_page: 100 });
            setMuzakiList(res.data?.data || []);
        } catch (err) {
            console.error('Failed to load muzakis', err);
        }
    };

    useEffect(() => {
        if (selectedMuzaki) {
            loadHistory(selectedMuzaki);
        } else {
            setHistoryList([]);
        }
    }, [selectedMuzaki]);

    const loadHistory = async (id) => {
        try {
            const res = await fetchCalculationHistory(id);
            if (res.success) {
                setHistoryList(res.data);
            }
        } catch (err) {
            console.error('Failed to load history', err);
        }
    };

    const handleExportPdf = async () => {
        if (!selectedMuzaki) return;
        try {
            setLoading(true);
            await exportCalculationHistory(selectedMuzaki);
        } catch (err) {
            alert('Gagal export PDF: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setCalculationResult(null);

        // Prepare clean layout
        const calcPayload = {};

        if (zakatType === 'Maal') {
            calcPayload.total_harta = Number(formData.total_harta) || 0;
            calcPayload.hutang = Number(formData.hutang) || 0;
        } else if (zakatType === 'Perdagangan') {
            calcPayload.modal_diputar = Number(formData.modal_diputar) || 0;
            calcPayload.keuntungan = Number(formData.keuntungan) || 0;
            calcPayload.piutang_lancar = Number(formData.piutang_lancar) || 0;
            calcPayload.hutang_jatuh_tempo = Number(formData.hutang_jatuh_tempo) || 0;
        } else if (zakatType === 'Profesi') {
            calcPayload.period = formData.period;
            calcPayload.income = Number(formData.income) || 0;
            calcPayload.bonus = Number(formData.bonus) || 0;
            calcPayload.needs = Number(formData.needs) || 0;
            calcPayload.debt = Number(formData.debt) || 0;
        }

        try {
            const res = await calculateZakat(zakatType, calcPayload);
            if (res.success) {
                setCalculationResult(res.calculation);
            }
        } catch (err) {
            alert('Gagal menghitung zakat: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedMuzaki) {
            alert('Pilih Muzaki terlebih dahulu untuk menyimpan.');
            return;
        }
        if (!calculationResult) return;

        try {
            setLoading(true);
            await saveCalculation(selectedMuzaki, zakatType, calculationResult, haulMet);
            alert('Hasil perhitungan berhasil disimpan ke riwayat!');
            setCalculationResult(null); // Reset
            setFormData({ ...formData, total_harta: '', income: '', modal_diputar: '' }); // Reset fields
            loadHistory(selectedMuzaki);
        } catch (err) {
            alert('Gagal menyimpan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left Column: Input Form */}
            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(0, 144, 231, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontWeight: 800 }}>Kalkulator Zakat</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hitung kewajiban zakat secara akurat</span>
                    </div>
                </div>

                {/* Zakat Type Selector */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    {['Maal', 'Perdagangan', 'Profesi'].map(type => (
                        <button
                            key={type}
                            onClick={() => { setZakatType(type); setCalculationResult(null); }}
                            className={`btn ${zakatType === type ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{ flex: 1, padding: '1rem', fontWeight: 700 }}
                        >
                            {type === 'Perdagangan' ? 'Zakat Perniagaan' : `Zakat ${type}`}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleCalculate} style={{ display: 'grid', gap: '1.5rem' }}>

                    {/* Dynamic Inputs */}
                    {zakatType === 'Maal' && (
                        <>
                            <div className="form-group">
                                <label className="label">Total Nilai Harta (Uang, Emas, Saham)</label>
                                <input type="number" className="input" placeholder="0"
                                    value={formData.total_harta} onChange={e => setFormData({ ...formData, total_harta: e.target.value })} required />
                                <small className="text-muted">Masukkan total aset yang telah dimiliki selama 1 tahun.</small>
                            </div>
                            <div className="form-group">
                                <label className="label">Hutang Jangka Pendek</label>
                                <input type="number" className="input" placeholder="0"
                                    value={formData.hutang} onChange={e => setFormData({ ...formData, hutang: e.target.value })} />
                            </div>
                        </>
                    )}

                    {zakatType === 'Perdagangan' && (
                        <>
                            <div className="form-group">
                                <label className="label">Modal yang Diputar</label>
                                <input type="number" className="input" placeholder="0"
                                    value={formData.modal_diputar} onChange={e => setFormData({ ...formData, modal_diputar: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="label">Keuntungan / Laba (Selama 1 Tahun)</label>
                                <input type="number" className="input" placeholder="0"
                                    value={formData.keuntungan} onChange={e => setFormData({ ...formData, keuntungan: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="label">Piutang Lancar</label>
                                <input type="number" className="input" placeholder="0"
                                    value={formData.piutang_lancar} onChange={e => setFormData({ ...formData, piutang_lancar: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Hutang Jatuh Tempo</label>
                                <input type="number" className="input" placeholder="0"
                                    value={formData.hutang_jatuh_tempo} onChange={e => setFormData({ ...formData, hutang_jatuh_tempo: e.target.value })} />
                            </div>
                        </>
                    )}

                    {zakatType === 'Profesi' && (
                        <>
                            <div className="form-group">
                                <label className="label">Periode Penghasilan</label>
                                <select className="input" value={formData.period} onChange={e => setFormData({ ...formData, period: e.target.value })}>
                                    <option value="monthly">Bulanan</option>
                                    <option value="yearly">Tahunan</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Total Penghasilan (Gaji + Tunjangan)</label>
                                <input type="number" className="input" placeholder="0"
                                    value={formData.income} onChange={e => setFormData({ ...formData, income: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="label">Bonus / Pendapatan Lain</label>
                                <input type="number" className="input" placeholder="0"
                                    value={formData.bonus} onChange={e => setFormData({ ...formData, bonus: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="label">Kebutuhan Pokok (Opsional)</label>
                                    <input type="number" className="input" placeholder="0"
                                        value={formData.needs} onChange={e => setFormData({ ...formData, needs: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="label">Hutang Jatuh Tempo</label>
                                    <input type="number" className="input" placeholder="0"
                                        value={formData.debt} onChange={e => setFormData({ ...formData, debt: e.target.value })} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Haul Check - Only for Maal & Perdagangan */}
                    {(zakatType !== 'Profesi') && (
                        <div className="form-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                            <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={haulMet}
                                    onChange={e => setHaulMet(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span>Harta sudah tersimpan selama 1 tahun (Haul)</span>
                            </label>
                            {!haulMet && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={14} />
                                    <span>Jika belum Haul, zakat belum wajib ditunaikan.</span>
                                </div>
                            )}
                        </div>
                    )}

                    <button disabled={loading} type="submit" className="btn btn-lg btn-success" style={{ fontWeight: 800, marginTop: '1rem' }}>
                        HITUNG ZAKAT SEKARANG
                    </button>
                </form>
            </div>

            {/* Right Column: Info & Result */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Gold Price Widget */}
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #1e1e2d 0%, #2a2a3c 100%)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ color: 'var(--warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Coins size={18} /> HARGA EMAS HARI INI
                        </div>
                        <button onClick={loadGoldPrice} className="btn btn-sm btn-ghost" style={{ padding: '4px' }} title="Refresh Harga">
                            <RefreshCcw size={14} />
                        </button>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff' }}>
                        {formatRupiah(goldPrice.price_per_gram)}
                        <span style={{ fontSize: '1rem', fontWeight: 400, color: '#aaa', marginLeft: '0.5rem' }}>/gram</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic' }}>
                        Sumber: {goldPrice.source} • Update: {new Date(goldPrice.created_at || new Date()).toLocaleDateString('id-ID')}
                    </div>
                    <div style={{ marginTop: '1rem', padding: '10px', background: 'rgba(255,171,0,0.1)', borderRadius: '8px', border: '1px solid rgba(255,171,0,0.3)' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--warning)', fontWeight: 800 }}>Nisab (85 Gram)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {formatRupiah(goldPrice.price_per_gram * 85)}
                        </div>
                    </div>
                </div>

                {/* Calculation Result */}
                {calculationResult && (
                    <div className="card" style={{ padding: '1.5rem', border: `2px solid ${calculationResult.is_payable && haulMet ? 'var(--success)' : 'var(--border-color)'}` }}>
                        <h5 style={{ fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>HASIL PERHITUNGAN</h5>

                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span className="text-muted">Total Harta Bersih:</span>
                                <span style={{ fontWeight: 700 }}>{formatRupiah(calculationResult.clean_assets)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span className="text-muted">Nisab ({zakatType === 'Profesi' && calculationResult.details?.period === 'monthly' ? 'Bulanan' : 'Tahunan'}):</span>
                                <span style={{ fontWeight: 700 }}>{formatRupiah(calculationResult.nisab_threshold)}</span>
                            </div>
                            <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '0.85rem' }}>Status Wajib Zakat</span>
                                {calculationResult.is_payable ? (
                                    <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>WAJIB ZAKAT</span>
                                ) : (
                                    <span className="badge badge-secondary" style={{ fontSize: '0.85rem' }}>TIDAK WAJIB</span>
                                )}
                            </div>

                            {!haulMet && (
                                <div className="alert alert-warning" style={{ fontSize: '0.8rem', marginTop: '1rem' }}>
                                    <Info size={14} style={{ marginRight: '5px' }} />
                                    Meskipun harta mencapai nisab, zakat belum wajib karena belum mencapai Haul (1 tahun).
                                </div>
                            )}

                        </div>

                        {calculationResult.is_payable && haulMet && (
                            <div style={{ textAlign: 'center', background: 'rgba(0, 210, 91, 0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--success)', fontWeight: 800, marginBottom: '0.5rem' }}>Jumlah Zakat Yang Harus Dikeluarkan</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                                    {formatRupiah(calculationResult.calculated_amount)}
                                </div>
                            </div>
                        )}

                        {/* Save Section */}
                        <div>
                            <label className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>Simpan Ke Riwayat Muzaki</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    className="input"
                                    value={selectedMuzaki}
                                    onChange={e => setSelectedMuzaki(e.target.value)}
                                    style={{ flex: 1 }}
                                >
                                    <option value="">Pilih Muzaki...</option>
                                    {muzakiList.map(m => (
                                        <option key={m.id} value={m.id}>{m.nama} (RT {m.rt?.kode})</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleSave}
                                    disabled={!selectedMuzaki || loading}
                                    className="btn btn-primary"
                                    title="Simpan Hasil"
                                >
                                    <Save size={18} />
                                </button>
                            </div>
                        </div>

                    </div>
                )}

                {/* History Section */}
                {selectedMuzaki && (
                    <div className="card" style={{ padding: '1.5rem', marginTop: calculationResult ? 0 : '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <History size={18} /> Riwayat Perhitungan
                            </div>
                            <button
                                onClick={handleExportPdf}
                                disabled={historyList.length === 0 || loading}
                                className="btn btn-sm btn-outline-primary"
                                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                            >
                                <FileText size={14} /> Export PDF
                            </button>
                        </div>

                        {historyList.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Belum ada riwayat perhitungan.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                                {historyList.map(item => (
                                    <div key={item.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.zakat_type}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {new Date(item.calculation_date).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.9rem' }}>
                                                {item.is_payable && item.haul_met
                                                    ? <span className="text-success">{formatRupiah(item.calculated_amount)}</span>
                                                    : <span className="text-muted">Tidak Wajib/Nisab</span>}
                                            </span>
                                            {item.is_payable && item.haul_met
                                                ? <CheckCircle2 size={14} className="text-success" />
                                                : <Info size={14} className="text-muted" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZakatCalculator;
