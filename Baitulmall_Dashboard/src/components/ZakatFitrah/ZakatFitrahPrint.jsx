import React from 'react';
import PrintLayout from '../PrintLayout';

const ZakatFitrahPrint = ({
    activeTab,
    distribusiKategori,
    distribusiScope,
    selectedRt,
    selectedTahun,
    leftSigner,
    rightSigner,
    muzakiList,
    totalMuzakiJiwa,
    totalBeras,
    distribution,
    totalAsnafJiwa,
    filteredAsnafDistribusi,
    getBerasPerJiwa,
    totalJiwaView,
    totalBerasView,
    distribusiHistoryList
}) => (
    <PrintLayout
        title={activeTab === 'distribusi'
            ? `Daftar Distribusi ${distribusiKategori} ${distribusiScope === 'warga' ? `RT ${selectedRt}` : '(Global)'}`
            : activeTab === 'muzaki'
                ? 'Daftar Muzaki (Zakat Fitrah)'
                : activeTab === 'distributed'
                    ? 'Laporan Realisasi Distribusi Zakat'
                    : 'Perhitungan Distribusi Zakat'}
        subtitle={`Baitulmal Masjid Fajar Maqbul - Tahun ${selectedTahun}`}
        signer={{ left: leftSigner, right: rightSigner }}
    >
        {activeTab === 'muzaki' && (
            <>
                <table className="table-print-boxed">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>No</th>
                            <th>Nama Muzaki</th>
                            <th style={{ width: '60px' }}>RT</th>
                            <th style={{ width: '100px' }}>Jumlah Jiwa</th>
                            <th style={{ width: '120px' }}>Zakat (KG)</th>
                            <th style={{ width: '100px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {muzakiList.map((item, index) => (
                            <tr key={item.id}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td>{item.nama}</td>
                                <td style={{ textAlign: 'center' }}>{item.rt?.kode || '-'}</td>
                                <td style={{ textAlign: 'center' }}>{item.jumlah_jiwa}</td>
                                <td style={{ textAlign: 'center' }}>{Number(item.jumlah_beras_kg).toLocaleString()} KG</td>
                                <td style={{ textAlign: 'center' }}>{item.status_bayar}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 800, background: '#eee' }}>
                            <td colSpan="3" style={{ textAlign: 'center' }}>Total</td>
                            <td style={{ textAlign: 'center' }}>{totalMuzakiJiwa} Jiwa</td>
                            <td style={{ textAlign: 'center' }}>{totalBeras.toLocaleString()} KG</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
                <div className="signature-grid">
                    <div className="signature-item">
                        <div className="signature-title">{leftSigner?.jabatan || 'Ketua Baitulmal'}</div>
                        <div className="signature-name">{leftSigner?.nama_pejabat || '............................'}</div>
                        {leftSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {leftSigner.nip}</div>}
                    </div>
                    <div className="signature-item">
                        <div className="signature-title">{rightSigner?.jabatan || ''}</div>
                        <div className="signature-name">{rightSigner?.nama_pejabat || '............................'}</div>
                        {rightSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {rightSigner.nip}</div>}
                    </div>
                </div>
            </>
        )}

        {activeTab === 'calculation' && (
            <>
                <div style={{ marginBottom: '1rem', border: '1px solid #000', padding: '10px' }}>
                    <strong>Total Beras Terkumpul:</strong> {totalBeras.toLocaleString()} KG
                    <br />
                    <em>Ketentuan: 1 Bagian = 12.5% dari total beras.</em>
                </div>
                <table className="table-print-boxed">
                    <thead>
                        <tr>
                            <th>Kategori Asnaf</th>
                            <th style={{ width: '100px' }}>Bagian</th>
                            <th style={{ width: '100px' }}>Persentase</th>
                            <th style={{ width: '100px' }}>Total Jiwa</th>
                            <th style={{ width: '150px' }}>Jatah Beras (KG)</th>
                            <th style={{ width: '150px' }}>Beras / Jiwa (KG)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {distribution.map((d, index) => (
                            <tr key={index}>
                                <td style={{ fontWeight: 600 }}>{d.category}</td>
                                <td style={{ textAlign: 'center' }}>{d.portion}</td>
                                <td style={{ textAlign: 'center' }}>{(d.percentage * 100).toFixed(1)}%</td>
                                <td style={{ textAlign: 'center' }}>{d.totalJiwa}</td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{d.jatahAsnaf.toLocaleString()}</td>
                                <td style={{ textAlign: 'center' }}>{d.berasPerJiwa.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#eee', fontWeight: 'bold' }}>
                            <td colSpan="2">TOTAL</td>
                            <td style={{ textAlign: 'center' }}>
                                {(distribution.reduce((acc, curr) => acc + curr.percentage, 0) * 100).toFixed(1)}%
                            </td>
                            <td style={{ textAlign: 'center' }}>{totalAsnafJiwa}</td>
                            <td style={{ textAlign: 'center' }}>{distribution.reduce((acc, curr) => acc + curr.jatahAsnaf, 0).toLocaleString()}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                <div className="signature-grid">
                    <div className="signature-item">
                        <div className="signature-title">{leftSigner?.jabatan || 'Ketua Baitulmal'}</div>
                        <div className="signature-name">{leftSigner?.nama_pejabat || '............................'}</div>
                        {leftSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {leftSigner.nip}</div>}
                    </div>
                    <div className="signature-item">
                        <div className="signature-title">{rightSigner?.jabatan || ''}</div>
                        <div className="signature-name">{rightSigner?.nama_pejabat || '............................'}</div>
                        {rightSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {rightSigner.nip}</div>}
                    </div>
                </div>
            </>
        )}

        {activeTab === 'distribusi' && (
            <>
                <table className="table-print-boxed">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>No</th>
                            <th style={{ width: '30%' }}>Kepala Keluarga</th>
                            <th style={{ width: '80px' }}>Jumlah Jiwa</th>
                            <th style={{ width: '100px' }}>Zakat (KG)</th>
                            <th>Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAsnafDistribusi.map((item, index) => (
                            <tr key={item.id}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td>{item.nama}</td>
                                <td style={{ textAlign: 'center' }}>{item.jumlah_jiwa || item.jumlahJiwa}</td>
                                <td style={{ textAlign: 'center' }}>{((item.jumlah_jiwa || item.jumlahJiwa) * getBerasPerJiwa(item.kategori)).toFixed(2)}</td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 800, background: '#eee' }}>
                            <td colSpan="2" style={{ textAlign: 'center' }}>Total</td>
                            <td style={{ textAlign: 'center' }}>{totalJiwaView} Jiwa</td>
                            <td style={{ textAlign: 'center' }}>{totalBerasView.toFixed(2)} KG</td>
                            <td style={{ textAlign: 'center' }}></td>
                        </tr>
                    </tfoot>
                </table>

                <div className="signature-grid">
                    <div className="signature-item">
                        <div className="signature-title">{leftSigner?.jabatan || 'Ketua Baitulmal'}</div>
                        <div className="signature-name">{leftSigner?.nama_pejabat || '............................'}</div>
                        {leftSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {leftSigner.nip}</div>}
                    </div>
                    <div className="signature-item">
                        <div className="signature-title">{rightSigner?.jabatan || 'Sekretaris / Bendahara'}</div>
                        <div className="signature-name">{rightSigner?.nama_pejabat || '............................'}</div>
                        {rightSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {rightSigner.nip}</div>}
                    </div>
                </div>
            </>
        )}

        {activeTab === 'annual_report' && (
            <>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', background: '#f8fafc', padding: '15px', border: '1px solid #000' }}>
                    <h2 style={{ margin: 0, fontSize: '14pt' }}>RINGKASAN TAHUNAN ZAKAT FITRAH</h2>
                    <div style={{ fontSize: '11pt', fontWeight: 600 }}>Tahun {selectedTahun} / {parseInt(selectedTahun) - 579} H</div>
                </div>

                {/* Section 1: Penerimaan */}
                <h3 style={{ fontSize: '11pt', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '10px' }}>I. PENERIMAAN (SUMBER DANA)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '1.5rem' }}>
                    <div style={{ border: '1px solid #000', padding: '10px' }}>
                        <div style={{ fontSize: '9pt', color: '#666' }}>Total Muzaki (Kepala Keluarga)</div>
                        <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>{muzakiList.length} KK</div>
                    </div>
                    <div style={{ border: '1px solid #000', padding: '10px' }}>
                        <div style={{ fontSize: '9pt', color: '#666' }}>Total Beras Terkumpul</div>
                        <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>{totalBeras.toLocaleString()} KG</div>
                    </div>
                </div>

                {/* Section 2: Skema Distribusi */}
                <h3 style={{ fontSize: '11pt', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '10px' }}>II. SKEMA ALOKASI DISTRIBUSI</h3>
                <table className="table-print-boxed" style={{ marginBottom: '1.5rem' }}>
                    <thead>
                        <tr style={{ background: '#f0f0f0' }}>
                            <th>Kategori Asnaf</th>
                            <th>Bagian</th>
                            <th>Persentase</th>
                            <th>Total Jiwa</th>
                            <th>Jatah (KG)</th>
                            <th>Per Jiwa (KG)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {distribution.map((d, index) => (
                            <tr key={index}>
                                <td style={{ fontWeight: 600 }}>{d.category}</td>
                                <td style={{ textAlign: 'center' }}>{d.portion}</td>
                                <td style={{ textAlign: 'center' }}>{(d.percentage * 100).toFixed(1)}%</td>
                                <td style={{ textAlign: 'center' }}>{d.totalJiwa}</td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{d.jatahAsnaf.toLocaleString()}</td>
                                <td style={{ textAlign: 'center' }}>{d.berasPerJiwa.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Section 3: Realisasi Penyaluran */}
                <h3 style={{ fontSize: '11pt', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '10px' }}>III. REALISASI PENYALURAN</h3>
                <table className="table-print-boxed">
                    <thead>
                        <tr style={{ background: '#f0f0f0' }}>
                            <th>Kategori</th>
                            <th>Target Alokasi (KG)</th>
                            <th>Realisasi (KG)</th>
                            <th>Selisih / Sisa (KG)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {distribution.map((d, index) => {
                            const realisasi = distribusiHistoryList
                                .filter(h => h.kategori_asnaf === d.category)
                                .reduce((sum, h) => sum + Number(h.jumlah_kg), 0);
                            const selisih = d.jatahAsnaf - realisasi;
                            return (
                                <tr key={index}>
                                    <td>{d.category}</td>
                                    <td style={{ textAlign: 'center' }}>{d.jatahAsnaf.toLocaleString()}</td>
                                    <td style={{ textAlign: 'center' }}>{realisasi.toLocaleString()}</td>
                                    <td style={{ textAlign: 'center', color: selisih > 0 ? '#b91c1c' : '#000' }}>
                                        {selisih.toLocaleString()}
                                    </td>
                                    <td style={{ textAlign: 'center', fontSize: '8pt' }}>
                                        {Math.abs(selisih) < 0.1 ? 'SELESAI' : selisih > 0 ? 'HILANG/SISA' : 'OVER'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#eee', fontWeight: 'bold' }}>
                            <td>TOTAL KESELURUHAN</td>
                            <td style={{ textAlign: 'center' }}>{totalBeras.toLocaleString()}</td>
                            <td style={{ textAlign: 'center' }}>{distribusiHistoryList.reduce((acc, curr) => acc + Number(curr.jumlah_kg), 0).toLocaleString()}</td>
                            <td style={{ textAlign: 'center' }}>{(totalBeras - distribusiHistoryList.reduce((acc, curr) => acc + Number(curr.jumlah_kg), 0)).toLocaleString()}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                <div className="signature-grid">
                    <div className="signature-item">
                        <div className="signature-title">{leftSigner?.jabatan || 'Ketua Baitulmal'}</div>
                        <div className="signature-name">{leftSigner?.nama_pejabat || '............................'}</div>
                        {leftSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {leftSigner.nip}</div>}
                    </div>
                    <div className="signature-item">
                        <div className="signature-title">{rightSigner?.jabatan || 'Bendahara'}</div>
                        <div className="signature-name">{rightSigner?.nama_pejabat || '............................'}</div>
                        {rightSigner?.nip && <div className="signature-sk" style={{ fontSize: '0.8rem', opacity: 0.8 }}>NIP/NIY: {rightSigner.nip}</div>}
                    </div>
                </div>
            </>
        )}
    </PrintLayout >
);

export default ZakatFitrahPrint;
