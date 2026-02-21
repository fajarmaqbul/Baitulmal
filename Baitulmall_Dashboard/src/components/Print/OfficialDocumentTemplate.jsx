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
    // Local state for settings
    const [instansi, setInstansi] = React.useState({
        nama: 'BAITULMAL FAJAR MAQBUL',
        alamat: 'MASJID KANDRI NO. 45, SEMARANG',
        kontak: 'Telepon: 0812-3456-7890 | Email: baitulmal@fajarmaqbul.org',
        logo: '/logo-masjid.png',
        kota: 'Semarang'
    });

    // Fetch settings on mount
    React.useEffect(() => {
        const loadSettings = async () => {
            // If signer is provided via props, we don't need to fetch active signer from API
            // ... logic to fetch settings remains ...
            try {
                const { fetchSettings } = await import('../../services/settingApi');
                const res = await fetchSettings();
                if (res.success) {
                    const findVal = (key, def) => res.data.find(s => s.key_name === key)?.value || def;
                    setInstansi({
                        nama: findVal('org_name', instansi.nama),
                        alamat: findVal('org_address', instansi.alamat),
                        kontak: `Telepon: ${findVal('org_phone', '...')} | Email: ${findVal('org_email', '...')}`,
                        logo: findVal('logo_url', instansi.logo),
                        kota: findVal('kota_instansi', instansi.kota)
                    });
                }
            } catch (err) {
                console.error('Template settings load error', err);
            }
        };
        loadSettings();
    }, []);

    // Helper to render signature block
    const renderSignature = (s) => (
        <div className="signature-section">
            <div className="sign-info">
                <p>{instansi.kota}, {date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>{s?.jabatan || 'Mengetahui,'}</p>
            </div>
            <div className="signature-space"></div>
            <div className="signer-name">
                <strong><u>{s?.nama_lengkap || '............................'}</u></strong>
                {s?.no_sk && <p className="sk-no">No. SK: {s.no_sk}</p>}
            </div>
        </div>
    );


    return (
        <div className="official-document">
            {/* 1. Header / Letterhead (Kop Surat) */}
            {showLetterhead && (
                <div className="letterhead">
                    <img
                        src={
                            instansi.logo && (instansi.logo.startsWith('file:') || instansi.logo.match(/^[a-zA-Z]:/))
                                ? '/logo-masjid.png'
                                : instansi.logo
                        }
                        alt="Logo"
                        className="logo"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/logo-masjid.png';
                        }}
                    />
                    <div className="org-info">
                        <h2>{instansi.nama}</h2>
                        <h3>{instansi.alamat}</h3>
                        <p>{instansi.kontak}</p>
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
            {/* 4. Footer & Signature Block */}
            <div className="document-footer">
                {Array.isArray(signer) ? (
                    <div className="flex justify-between w-full mt-8">
                        {/* If multiple signers (e.g. Ketua & Sekretaris), render them side by side */}
                        {signer.map((s, idx) => (
                            <div key={idx} className="signature-section" style={{ width: '45%' }}>
                                <div className="sign-info text-center">
                                    {idx === 1 && ( // Only show date on the second/right signer (usually Ketua)
                                        <p className="mb-1">{instansi.kota}, {date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    )}
                                    <p>{s?.jabatan || 'Mengetahui,'}</p>
                                </div>
                                <div className="signature-space" style={{ height: '60px' }}></div>
                                <div className="signer-name text-center">
                                    <strong><u>{s?.nama_lengkap || '............................'}</u></strong>
                                    {s?.no_sk && <p className="text-xs">No. SK: {s.no_sk}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Default Single Signer
                    renderSignature(signer)
                )}
            </div>

            {/* Print Helper CSS classes are defined in associated CSS file */}
        </div>
    );
};

export default OfficialDocumentTemplate;
