import React, { useState, useEffect } from 'react';
import { fetchRTs } from '../services/asnafApi';

const BeneficiaryForm = ({ kategori, initialData = null, onSubmit, onCancel }) => {
    const [rtList, setRtList] = useState([]);
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        rt_id: '',
        alamat: '',
        keterangan: '',
        is_active: true,
        data_tambahan: { wali: '', umur: '' },
        custom_criteria: {}
    });

    useEffect(() => {
        fetchRTs().then(res => setRtList(Array.isArray(res) ? res : res.data));

        if (initialData) {
            setFormData({
                nama_lengkap: initialData.nama_lengkap || '',
                rt_id: initialData.rt_id || '',
                alamat: initialData.alamat || '',
                keterangan: initialData.keterangan || '',
                is_active: initialData.is_active !== undefined ? Boolean(initialData.is_active) : true,
                data_tambahan: initialData.data_tambahan || { wali: '', umur: '' },
                custom_criteria: initialData.custom_criteria || {}
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            jenis: kategori, // Force category
            jumlah_jiwa: (kategori === 'Amil' || kategori === 'Fisabilillah') ? 1 : (formData.jumlah_jiwa || 1)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fade-in">
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Basic Info */}
                <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.75rem' }}>Informasi Dasar</h6>
                <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input required className="form-control" value={formData.nama_lengkap} onChange={e => setFormData({ ...formData, nama_lengkap: e.target.value })} />
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Wilayah RT</label>
                            <select required className="form-select" value={formData.rt_id} onChange={e => setFormData({ ...formData, rt_id: e.target.value })}>
                                <option value="">-- Pilih RT --</option>
                                {rtList.map(r => <option key={r.id} value={r.id}>RT {r.kode}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Umur (Tahun)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.data_tambahan.umur}
                                onChange={e => setFormData({ ...formData, data_tambahan: { ...formData.data_tambahan, umur: e.target.value } })}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Alamat Lengkap</label>
                    <textarea
                        className="form-control"
                        rows="2"
                        value={formData.alamat}
                        onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                        placeholder="Nama jalan, nomor rumah, atau patokan..."
                    ></textarea>
                </div>

                {kategori === 'yatim' && (
                    <div className="form-group">
                        <label>Nama Wali (Orang Tua / Pengasuh)</label>
                        <input className="form-control" value={formData.data_tambahan.wali} onChange={e => setFormData({ ...formData, data_tambahan: { ...formData.data_tambahan, wali: e.target.value } })} />
                    </div>
                )}

                {/* Additional Info */}
                <h6 className="text-uppercase text-muted fw-bold mb-3 mt-4" style={{ fontSize: '0.75rem' }}>Detail Tambahan</h6>

                <div className="form-group">
                    <label>Keterangan / Catatan</label>
                    <textarea
                        className="form-control"
                        rows="2"
                        value={formData.keterangan}
                        onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                        placeholder="Contoh: Kondisi ekonomi, dsb..."
                    ></textarea>
                </div>

                <div className="form-check form-switch mt-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="flexSwitchCheckChecked"
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Status Aktif (Dapat menerima santunan)</label>
                </div>

                {/* SCORING CRITERIA FOR FISABILILLAH & AMIL */}
                {(kategori === 'Fisabilillah' || kategori === 'Amil') && (
                    <div className="mt-4 p-3 rounded" style={{ background: 'var(--background)', border: '1px solid var(--border-color)' }}>
                        <h6 className="text-uppercase fw-bold mb-3" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                            Kriteria Penilaian ({kategori})
                        </h6>
                        <div className="d-flex flex-column gap-2">
                            {kategori === 'Fisabilillah' && (
                                <>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input" type="checkbox" id="crit_ngaji"
                                            checked={formData.custom_criteria?.mengajar_ngaji || false}
                                            onChange={e => setFormData({ ...formData, custom_criteria: { ...formData.custom_criteria, mengajar_ngaji: e.target.checked } })}
                                        />
                                        <label className="form-check-label" htmlFor="crit_ngaji">Mengajar Ngaji (35 Poin)</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input" type="checkbox" id="crit_madrasah"
                                            checked={formData.custom_criteria?.mengajar_madrasah || false}
                                            onChange={e => setFormData({ ...formData, custom_criteria: { ...formData.custom_criteria, mengajar_madrasah: e.target.checked } })}
                                        />
                                        <label className="form-check-label" htmlFor="crit_madrasah">Mengajar Madrasah (35 Poin)</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input" type="checkbox" id="crit_imam"
                                            checked={formData.custom_criteria?.imam_masjid || false}
                                            onChange={e => setFormData({ ...formData, custom_criteria: { ...formData.custom_criteria, imam_masjid: e.target.checked } })}
                                        />
                                        <label className="form-check-label" htmlFor="crit_imam">Imam Masjid/Mushola (30 Poin)</label>
                                    </div>
                                </>
                            )}

                            {kategori === 'Amil' && (
                                <>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input" type="checkbox" id="crit_zakat"
                                            checked={formData.custom_criteria?.pengurus_zakat || false}
                                            onChange={e => setFormData({ ...formData, custom_criteria: { ...formData.custom_criteria, pengurus_zakat: e.target.checked } })}
                                        />
                                        <label className="form-check-label" htmlFor="crit_zakat">Pengurus Zakat Fitrah (35 Poin)</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input" type="checkbox" id="crit_kotak"
                                            checked={formData.custom_criteria?.pengurus_kotak_sedekah || false}
                                            onChange={e => setFormData({ ...formData, custom_criteria: { ...formData.custom_criteria, pengurus_kotak_sedekah: e.target.checked } })}
                                        />
                                        <label className="form-check-label" htmlFor="crit_kotak">Pengurus Kotak Sedekah (35 Poin)</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input" type="checkbox" id="crit_bantuan"
                                            checked={formData.custom_criteria?.penyalur_bantuan || false}
                                            onChange={e => setFormData({ ...formData, custom_criteria: { ...formData.custom_criteria, penyalur_bantuan: e.target.checked } })}
                                        />
                                        <label className="form-check-label" htmlFor="crit_bantuan">Menyalurkan Bantuan Sedekah (30 Poin)</label>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="modal-footer bg-light">
                <button type="button" className="btn btn-light" onClick={onCancel}>Batal</button>
                <button type="submit" className={`btn btn-${kategori === 'yatim' ? 'primary' : 'warning'}`}>
                    <i className="mdi mdi-check me-1"></i> Simpan Data
                </button>
            </div>
        </form>
    );
};

export default BeneficiaryForm;
