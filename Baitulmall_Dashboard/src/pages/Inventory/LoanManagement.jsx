import React, { useState, useEffect } from 'react';
import { fetchLoans, createLoan, returnLoan, fetchAssets } from '../../services/inventoryApi';
import { Plus, Search, Calendar, Clock, Undo2, CheckCircle2, Loader2, X, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const LoanManagement = () => {
    const [loans, setLoans] = useState([]);
    const [availableAssets, setAvailableAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
    const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);

    // Form States
    const [loanForm, setLoanForm] = useState({
        asset_id: '',
        borrower_name: '',
        borrower_phone: '',
        loan_date: new Date().toISOString().slice(0, 16),
        expected_return_date: '',
        notes: ''
    });

    const [returnForm, setReturnForm] = useState({
        actual_return_date: new Date().toISOString().slice(0, 16),
        condition: 'good',
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [loansData, assetsData] = await Promise.all([
                fetchLoans(),
                fetchAssets()
            ]);
            setLoans(loansData);
            // Filter only lendable and good condition assets
            setAvailableAssets(assetsData.filter(a => a.is_lendable && a.condition === 'good'));
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoanSubmit = async (e) => {
        e.preventDefault();
        try {
            await createLoan(loanForm);
            setIsLoanDialogOpen(false);
            setLoanForm({ asset_id: '', borrower_name: '', borrower_phone: '', loan_date: '', expected_return_date: '', notes: '' });
            loadData();
        } catch (error) {
            alert('Gagal memproses peminjaman: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleReturnClick = (loan) => {
        setSelectedLoan(loan);
        setReturnForm({
            actual_return_date: new Date().toISOString().slice(0, 16),
            condition: loan.asset?.condition || 'good',
            notes: ''
        });
        setIsReturnDialogOpen(true);
    };

    const handleReturnSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLoan) return;
        try {
            await returnLoan(selectedLoan.id, returnForm);
            setIsReturnDialogOpen(false);
            setSelectedLoan(null);
            loadData();
        } catch (error) {
            alert('Gagal memproses pengembalian');
        }
    };

    return (
        <div className="animate-fade-in">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Peminjaman Aset</h2>
                    <p className="small mb-0" style={{ color: 'var(--text-muted)' }}>Monitor barang yang sedang dipinjam warga</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 fw-bold"
                    onClick={() => setIsLoanDialogOpen(true)}
                >
                    <Plus size={16} /> Pinjamkan Aset
                </button>
            </div>

            <div className="row g-4">
                {/* Active Loans */}
                <div className="col-12">
                    <h5 className="mb-3 fw-bold" style={{ color: 'var(--text-main)', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>
                        Sedang Dipinjam
                    </h5>

                    <div className="row g-3">
                        {loading ? (
                            <div className="col-12 py-4 text-center">
                                <Loader2 className="spin" size={30} style={{ color: 'var(--primary)' }} />
                            </div>
                        ) : loans.filter(l => l.status === 'active' || l.status === 'overdue').length === 0 ? (
                            <div className="col-12">
                                <div className="glass-card p-4 text-center" style={{ borderStyle: 'dashed' }}>
                                    <p className="mb-0 text-muted fst-italic">Tidak ada barang yang sedang dipinjam saat ini.</p>
                                </div>
                            </div>
                        ) : (
                            loans.filter(l => l.status === 'active' || l.status === 'overdue').map(loan => (
                                <div key={loan.id} className="col-md-6 col-lg-4">
                                    <div className="glass-card h-100 p-3 hover-lift d-flex flex-column justify-content-between" style={{ borderLeft: loan.status === 'overdue' ? '4px solid var(--danger)' : '4px solid var(--primary)' }}>
                                        <div>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="fw-bold mb-0 text-truncate" style={{ color: 'var(--text-main)' }}>{loan.asset?.name || 'Unknown Asset'}</h5>
                                                {loan.status === 'overdue' && (
                                                    <span className="badge bg-danger small">Terlambat</span>
                                                )}
                                            </div>

                                            <div className="d-flex flex-column gap-1 mb-3 small" style={{ color: 'var(--text-muted)' }}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Users size={14} />
                                                    <span className="fw-bold" style={{ color: 'var(--text-main)' }}>{loan.borrower_name}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Calendar size={14} />
                                                    <span>Kembali: {format(new Date(loan.expected_return_date), 'dd MMM yyyy HH:mm', { locale: idLocale })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className="btn btn-outline-success btn-sm w-100 d-flex align-items-center justify-content-center gap-2 mt-2"
                                            onClick={() => handleReturnClick(loan)}
                                            style={{ borderRadius: '8px' }}
                                        >
                                            <Undo2 size={14} /> Terima Kembali
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* History */}
                <div className="col-12 mt-4">
                    <h5 className="mb-3 fw-bold" style={{ color: 'var(--text-main)', borderLeft: '4px solid var(--text-muted)', paddingLeft: '1rem' }}>
                        Riwayat Peminjaman
                    </h5>
                    <div className="glass-card p-0 overflow-hidden">
                        <div className="table-responsive mb-0" style={{ border: 'none', borderRadius: 0 }}>
                            <table className="table table-hover mb-0">
                                <thead style={{ background: 'var(--card-footer-bg)', borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th className="px-4 py-3 small text-uppercase" style={{ color: 'var(--text-main)' }}>Barang</th>
                                        <th className="px-4 py-3 small text-uppercase" style={{ color: 'var(--text-main)' }}>Peminjam</th>
                                        <th className="px-4 py-3 small text-uppercase" style={{ color: 'var(--text-main)' }}>Tgl Pinjam</th>
                                        <th className="px-4 py-3 small text-uppercase" style={{ color: 'var(--text-main)' }}>Tgl Kembali</th>
                                        <th className="px-4 py-3 small text-uppercase" style={{ color: 'var(--text-main)' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.filter(l => l.status === 'returned').length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted fst-italic">Belum ada riwayat pengembalian.</td>
                                        </tr>
                                    ) : (
                                        loans.filter(l => l.status === 'returned').map(loan => (
                                            <tr key={loan.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td className="px-4 py-3 fw-bold" style={{ color: 'var(--text-main)' }}>{loan.asset?.name}</td>
                                                <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{loan.borrower_name}</td>
                                                <td className="px-4 py-3 text-muted">{format(new Date(loan.loan_date), 'dd MMM yyyy', { locale: idLocale })}</td>
                                                <td className="px-4 py-3 text-muted">{loan.actual_return_date ? format(new Date(loan.actual_return_date), 'dd MMM yyyy', { locale: idLocale }) : '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="badge bg-success bg-opacity-10 text-success d-inline-flex align-items-center gap-1 border border-success border-opacity-25">
                                                        <CheckCircle2 size={10} /> Selesai
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* LOAN DIALOG */}
            {isLoanDialogOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-card shadow-lg p-0 fade-in action-menu" style={{ width: '500px', borderRadius: '16px', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-color)' }}>
                            <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Form Peminjaman Aset</h5>
                            <button className="btn btn-sm btn-ghost" onClick={() => setIsLoanDialogOpen(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleLoanSubmit}>
                                <div className="mb-3">
                                    <label className="label mb-1 small fw-bold text-muted">Pilih Aset</label>
                                    <select
                                        className="input w-100"
                                        value={loanForm.asset_id}
                                        onChange={(e) => setLoanForm({ ...loanForm, asset_id: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Pilih Barang --</option>
                                        {availableAssets.map(a => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="label mb-1 small fw-bold text-muted">Nama Peminjam</label>
                                    <input
                                        className="input w-100"
                                        value={loanForm.borrower_name}
                                        onChange={(e) => setLoanForm({ ...loanForm, borrower_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="label mb-1 small fw-bold text-muted">Nomor HP</label>
                                    <input
                                        className="input w-100"
                                        value={loanForm.borrower_phone}
                                        onChange={(e) => setLoanForm({ ...loanForm, borrower_phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className="mb-3">
                                            <label className="label mb-1 small fw-bold text-muted">Tgl Pinjam</label>
                                            <input
                                                type="datetime-local"
                                                className="input w-100"
                                                value={loanForm.loan_date}
                                                onChange={(e) => setLoanForm({ ...loanForm, loan_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="mb-3">
                                            <label className="label mb-1 small fw-bold text-muted">Rencana Kembali</label>
                                            <input
                                                type="datetime-local"
                                                className="input w-100"
                                                value={loanForm.expected_return_date}
                                                onChange={(e) => setLoanForm({ ...loanForm, expected_return_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button type="button" className="btn btn-ghost" onClick={() => setIsLoanDialogOpen(false)} style={{ color: 'var(--text-muted)' }}>Batal</button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold">Simpan Peminjaman</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* RETURN DIALOG */}
            {isReturnDialogOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-card shadow-lg p-0 fade-in action-menu" style={{ width: '450px', borderRadius: '16px', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-color)' }}>
                            <div>
                                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Pengembalian Aset</h5>
                                <p className="mb-0 small text-muted">{selectedLoan?.asset?.name}</p>
                            </div>
                            <button className="btn btn-sm btn-ghost" onClick={() => setIsReturnDialogOpen(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleReturnSubmit}>
                                <div className="mb-3">
                                    <label className="label mb-1 small fw-bold text-muted">Tanggal Kembali</label>
                                    <input
                                        type="datetime-local"
                                        className="input w-100"
                                        value={returnForm.actual_return_date}
                                        onChange={(e) => setReturnForm({ ...returnForm, actual_return_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="label mb-1 small fw-bold text-muted">Kondisi Barang Saat Ini</label>
                                    <select
                                        className="input w-100"
                                        value={returnForm.condition}
                                        onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                                    >
                                        <option value="good">Baik</option>
                                        <option value="damaged">Rusak</option>
                                        <option value="lost">Hilang</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="label mb-1 small fw-bold text-muted">Catatan</label>
                                    <textarea
                                        className="input w-100"
                                        rows="3"
                                        placeholder="Ada kerusakan? atau catatan lain..."
                                        value={returnForm.notes}
                                        onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button type="button" className="btn btn-ghost" onClick={() => setIsReturnDialogOpen(false)} style={{ color: 'var(--text-muted)' }}>Batal</button>
                                    <button type="submit" className="btn btn-success text-white px-4 fw-bold">Konfirmasi Kembali</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanManagement;
