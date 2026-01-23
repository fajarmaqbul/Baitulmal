import React from 'react';
import './OfficialDocumentTemplate.css';

/**
 * Reusable Official Document Template (Letterhead + Signer)
 */
const OfficialDocumentTemplate = ({
    title,
    documentNo,
    date,
    children,
    signer,
    showLetterhead = true
}) => {
    return (
        <div className="official-document">
            {/* 1. Header / Letterhead (Kop Surat) */}
            {showLetterhead && (
                <div className="letterhead">
                    <img src="/logo-masjid.png" alt="Logo" className="logo" />
                    <div className="org-info">
                        <h2>BAITULMALL FAJAR MAQBUL</h2>
                        <h3>MASJID KANDRI NO. 45, SEMARANG</h3>
                        <p>Telepon: 0812-3456-7890 | Email: baitulmall@fajarmaqbul.org</p>
                    </div>
                </div>
            )}

            <div className="divider"></div>

            {/* 2. Document Title */}
            <div className="document-header">
                <h1 className="title">{title}</h1>
                {documentNo && <p className="doc-no">Nomor: {documentNo}</p>}
            </div>

            {/* 3. Content Area */}
            <div className="document-body">
                {children}
            </div>

            {/* 4. Footer & Signature Block */}
            <div className="document-footer">
                <div className="signature-section">
                    <div className="sign-info">
                        <p>Semarang, {date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p>{signer?.jabatan || 'Mengetahui,'}</p>
                    </div>

                    <div className="signature-space"></div>

                    <div className="signer-name">
                        <strong><u>{signer?.nama_lengkap || '............................'}</u></strong>
                        {signer?.no_sk && <p className="sk-no">No. SK: {signer.no_sk}</p>}
                    </div>
                </div>
            </div>

            {/* Print Helper CSS classes are defined in associated CSS file */}
        </div>
    );
};

export default OfficialDocumentTemplate;
