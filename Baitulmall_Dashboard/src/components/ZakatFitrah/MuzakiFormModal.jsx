import React from 'react';

const MuzakiFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    editId,
    rtList,
    zakatRateKg,
    isLocked
}) => {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '450px' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>{editId ? 'Edit Data Muzaki' : 'Tambah Data Muzaki'}</h2>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="label">Nama Muzaki</label>
                        <input
                            className="input"
                            value={formData.nama}
                            onChange={e => setFormData({ ...formData, nama: e.target.value })}
                            placeholder="Nama Lengkap"
                            required
                            disabled={isLocked && editId}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Tahun (Otomatis)</label>
                        <input
                            className="input"
                            value={formData.tahun}
                            readOnly
                            disabled
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Jumlah Jiwa</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.jumlahJiwa}
                            onChange={e => setFormData({ ...formData, jumlahJiwa: e.target.value })}
                            placeholder="Jumlah anggota keluarga"
                            required
                            min="1"
                            disabled={isLocked && editId}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Jumlah Beras (Otomatis)</label>
                        <input
                            type="text"
                            className="input"
                            value={(Number(formData.jumlahJiwa || 0) * zakatRateKg).toFixed(2) + ' KG'}
                            readOnly
                            disabled
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--primary)', fontWeight: 'bold' }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">RT Domisili</label>
                        <select
                            className="input"
                            value={formData.rt}
                            onChange={e => setFormData({ ...formData, rt: e.target.value })}
                            disabled={isLocked && editId}
                        >
                            {rtList.map(rt => (
                                <option key={rt.id} value={rt.kode} style={{ background: '#1a1a1a', color: '#fff' }}>
                                    RT {rt.kode} - {rt.keterangan || 'Warga'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Status Pembayaran</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="status"
                                    value="Lunas"
                                    checked={formData.status === 'Lunas'}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                /> Lunas
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="status"
                                    value="Belum Lunas"
                                    checked={formData.status === 'Belum Lunas'}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                /> Belum Lunas
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Simpan' : 'Tambah'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MuzakiFormModal;
