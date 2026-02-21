import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Edit2, Trash2, Search, Loader2, MapPin
} from 'lucide-react';
import { fetchBeneficiaries, createBeneficiary, updateBeneficiary, deleteBeneficiary } from '../services/santunanApi';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import BeneficiaryForm from './BeneficiaryForm';

const BeneficiaryList = ({ type, title, colorClass }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchBeneficiaries({ jenis: type, search, per_page: 80 });
            setData(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [search]);

    const handleFormSubmit = async (formData) => {
        try {
            if (currentItem) {
                await updateBeneficiary(currentItem.id, formData);
            } else {
                await createBeneficiary(formData);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Gagal menyimpan data';
            const validationErrors = err.response?.data?.errors
                ? '\n' + Object.values(err.response.data.errors).flat().join('\n')
                : '';
            alert(`${msg}${validationErrors}`);
        }
    };

    const openModal = (item = null) => {
        setCurrentItem(item);
        setShowModal(true);
    };

    const handleDelete = async () => {
        try {
            await deleteBeneficiary(deleteModal.id);
            setDeleteModal({ open: false, id: null });
            loadData();
        } catch (err) {
            alert("Gagal menghapus");
        }
    };

    return (
        <div className="card h-100 animate-fade-in" style={{ borderTop: `4px solid var(--${colorClass})` }}>
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ background: 'var(--background)' }}>
                <div className="d-flex align-items-center gap-2">
                    <Users className={`text-${colorClass}`} size={20} />
                    <h5 className="mb-0 fw-bold">{title}</h5>
                </div>
                <button className={`btn btn-sm btn-${colorClass}`} onClick={() => openModal()}>
                    <Plus size={16} /> Tambah
                </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-bottom">
                <div className="input-group">
                    <span className="input-group-text border-end-0" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}><Search size={16} className="text-muted" /></span>
                    <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder={`Cari nama ${title}...`}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="p-0 overflow-auto" style={{ height: '500px' }}>
                {loading ? (
                    <div className="text-center p-5 text-muted"><Loader2 className="spin" /> Memuat data...</div>
                ) : (
                    <table className="table-compact mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="sticky-top" style={{ background: 'var(--background)' }}>
                            <tr>
                                <th className="ps-4">Nama Lengkap</th>
                                {type === 'yatim' && <th>Wali</th>}
                                <th>Alamat / RT</th>
                                <th className="text-center">Status</th>
                                <th className="text-end pe-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.id} className={item.is_active ? '' : 'text-muted'} style={{ opacity: item.is_active ? 1 : 0.6 }}>
                                    <td className="ps-4 fw-bold">
                                        {item.nama_lengkap}
                                        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                                            {item.data_tambahan?.umur ? `${item.data_tambahan.umur} Thn` : ''}
                                        </div>
                                    </td>
                                    {type === 'yatim' && <td>{item.data_tambahan?.wali || '-'}</td>}
                                    <td>
                                        <div className="d-flex align-items-center gap-1">
                                            <span className="badge bg-white border text-dark">RT {item.rt?.kode}</span>
                                        </div>
                                        {item.alamat && <div className="text-muted small mt-1 text-truncate" style={{ maxWidth: '150px' }} title={item.alamat}><MapPin size={10} className="me-1" />{item.alamat}</div>}
                                    </td>
                                    <td className="text-center">
                                        {item.is_active ? (
                                            <span className="badge bg-success-subtle text-success">Aktif</span>
                                        ) : (
                                            <span className="badge bg-secondary-subtle text-muted">Nonaktif</span>
                                        )}
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn-icon me-2" onClick={() => openModal(item)}><Edit2 size={16} /></button>
                                        <button className="btn-icon text-danger" onClick={() => setDeleteModal({ open: true, id: item.id })}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr><td colSpan="5" className="text-center p-4 text-muted">Belum ada data.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-in">
                        <div className="modal-header">
                            <h5 className="mb-0 fw-bold">{currentItem ? 'Edit Data' : 'Tambah Data Baru'}</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <BeneficiaryForm
                            kategori={type}
                            initialData={currentItem}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setShowModal(false)}
                        />
                    </div>
                </div>
            )}

            <ConfirmDeleteModal
                open={deleteModal.open}
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ open: false, id: null })}
            />
        </div>
    );
};

export default BeneficiaryList;
