import React from 'react';
import OfficialDocumentTemplate from '../Print/OfficialDocumentTemplate';

const MuzakiReceipt = ({ selectedTahun, selectedReceiptData, strukturInti }) => (
    <OfficialDocumentTemplate
        title="KUITANSI ZAKAT FITRAH"
        documentNo={`ZF/${selectedTahun}/${selectedReceiptData?.id || '000'}`}
        signer={strukturInti?.data}
    >
        <div style={{ padding: '1rem 0' }}>
            <table style={{ width: '100%', fontSize: '1.2rem', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '180px', padding: '0.5rem 0' }}>Telah Terima Dari</td>
                        <td style={{ width: '20px' }}>:</td>
                        <td style={{ fontWeight: 700, borderBottom: '1px dotted #000' }}>{selectedReceiptData?.nama}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0.5rem 0' }}>Alamat / RT</td>
                        <td>:</td>
                        <td style={{ borderBottom: '1px dotted #000' }}>RT {selectedReceiptData?.rt?.kode}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0.5rem 0' }}>Untuk Pembayaran</td>
                        <td>:</td>
                        <td style={{ borderBottom: '1px dotted #000' }}>Zakat Fitrah Tahun {selectedTahun}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0.5rem 0' }}>Jumlah Jiwa</td>
                        <td>:</td>
                        <td style={{ borderBottom: '1px dotted #000' }}>{selectedReceiptData?.jumlah_jiwa} Jiwa</td>
                    </tr>
                </tbody>
            </table>

            <div style={{ marginTop: '2.5rem', padding: '1.5rem', border: '2px solid #000', display: 'inline-block', minWidth: '250px' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Zakat Terbayar:</div>
                <div style={{ fontSize: '2rem', fontWeight: 900 }}>{Number(selectedReceiptData?.jumlah_beras_kg).toLocaleString()} KG BERAS</div>
            </div>

            <div style={{ marginTop: '2rem', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>
                "Semoga Allah memberikan pahala atas apa yang telah engkau berikan, dan menjadikannya pembersih bagimu, serta memberkati harta yang masih ada padamu." (Doa Amil)
            </div>
        </div>
    </OfficialDocumentTemplate>
);

export default MuzakiReceipt;
