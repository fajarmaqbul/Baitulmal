import React from 'react';
import { ArrowRight } from 'lucide-react';

const ActivityTable = ({ muzaki, sedekah }) => {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Aktivitas Pengelolaan Terbaru</h4>
                <button className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>Lihat Semua <ArrowRight size={14} className="ms-1" /></button>
            </div>
            <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                <table className="table-compact">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>NO</th>
                            <th>SUMBER / PENERIMA</th>
                            <th>KATEGORI</th>
                            <th>NOMINAL / JUMLAH</th>
                            <th>TANGGAL</th>
                            <th>KONFIRMASI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {muzaki.slice(0, 10).map((m, index) => (
                            <tr key={m.id}>
                                <td>{index + 1}</td>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.nama}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RT {m.rt?.kode || '-'}</div>
                                </td>
                                <td><span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem' }}>ZAKAT FITRAH</span></td>
                                <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{m.jumlah_beras_kg} KG</td>
                                <td>{m.tanggal_bayar ? new Date(m.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</td>
                                <td>
                                    <div className="status-indicator">
                                        <div className={`dot ${m.status_bayar === 'lunas' ? 'dot-success' : 'dot-warning'}`}></div>
                                        <span style={{ color: m.status_bayar === 'lunas' ? 'var(--success)' : 'var(--warning)', letterSpacing: '0.5px' }}>
                                            {m.status_bayar === 'lunas' ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sedekah.slice(0, 10).map((s, index) => (
                            <tr key={s.id}>
                                <td>{muzaki.length + index + 1}</td>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.amil?.nama || 'Umum'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.keterangan || 'Infaq Masjid'}</div>
                                </td>
                                <td><span style={{ color: s.jenis === 'penerimaan' ? 'var(--success)' : 'var(--danger)', fontWeight: 700, fontSize: '0.8rem' }}>{s.jenis === 'penerimaan' ? 'INFAQ' : 'PENYALURAN'}</span></td>
                                <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>Rp {Number(s.jumlah).toLocaleString('id-ID')}</td>
                                <td>{new Date(s.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</td>
                                <td>
                                    <div className="status-indicator">
                                        <div className="dot dot-success"></div>
                                        <span style={{ color: 'var(--success)', letterSpacing: '0.5px' }}>COMPLETED</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityTable;
