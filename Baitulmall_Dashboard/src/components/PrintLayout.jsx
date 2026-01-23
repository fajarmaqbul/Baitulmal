import React from 'react';
import '../styles/print.css';

const PrintLayout = React.forwardRef(({ title, subtitle, children, orientation = 'portrait', className = '' }, ref) => {
    return (
        <div ref={ref} className={`print-area ${className}`}>
            <style type="text/css" media="print">
                {`
                    @page { 
                        size: ${orientation}; 
                        margin: 10mm; 
                    }
                    
                    body {
                        visibility: visible !important;
                        background: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact;
                    }

                    .print-area {
                        width: 100%;
                        background: white;
                        position: relative;
                    }
                    
                    /* Reset global styles that might interfere */
                    .no-print { display: none !important; }
                    
                    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
                    th, td { border: 1px solid #000; padding: 4px 8px; }
                    th { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    
                    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 3rem; page-break-inside: avoid; }
                    .signature-item { text-align: center; }
                    .signature-title { font-weight: bold; margin-bottom: 4rem; }
                    .signature-name { font-weight: bold; text-decoration: underline; }
                `}
            </style>

            <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                <h1 style={{ fontSize: '18pt', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
                    {title}
                </h1>
                {subtitle && (
                    <h3 style={{ fontSize: '14pt', fontWeight: 600, margin: '0.5rem 0 0' }}>
                        {subtitle}
                    </h3>
                )}
                <p style={{ margin: '0.5rem 0 0', fontSize: '10pt', fontStyle: 'italic' }}>
                    Dicetak pada: {new Date().toLocaleString('id-ID')}
                </p>
            </div>

            <div className="print-content">
                {children}
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, fontSize: '9pt', borderTop: '1px solid #ccc', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Baitulmall System v2.0</span>
                <span>Halaman 1</span>
            </div>
        </div>
    );
});

PrintLayout.displayName = 'PrintLayout';

export default PrintLayout;

