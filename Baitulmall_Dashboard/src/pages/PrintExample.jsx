import React from 'react';
import { usePrint } from '../hooks/usePrint';
import GlobalPrintButton from '../components/GlobalPrintButton';
import PrintLayout from '../components/PrintLayout';

// A sample receipt component that is formatted specifically for printing
const Receipt = ({ data }) => (
    <PrintLayout title="Bukti Transaksi" subtitle={`ID: ${data.id}`}>
        <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <h4 className="font-bold">Penerima</h4>
                    <p>{data.recipient}</p>
                </div>
                <div>
                    <h4 className="font-bold">Tanggal</h4>
                    <p>{data.date}</p>
                </div>
            </div>

            <table className="w-full border-collapse border border-gray-300 mb-8">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Deskripsi</th>
                        <th className="border p-2 text-right">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border p-2">Zakat Mal</td>
                        <td className="border p-2 text-right">Rp {data.amount.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            <div className="mt-8 border-t pt-4 text-center text-sm text-gray-500">
                <p>Terima kasih telah menunaikan zakat.</p>
                <p>Baitulmall System</p>
            </div>
        </div>
    </PrintLayout>
);

const PrintExample = () => {
    const { print } = usePrint();

    const sampleData = {
        id: "TRX-2023-001",
        recipient: "M. Idi Kurnianto",
        amount: 5000000,
        date: new Date().toLocaleDateString()
    };

    const handleManualPrint = () => {
        // We can generate data or components on the fly
        print(<Receipt data={sampleData} />);
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-2xl font-bold">Print System Demo</h1>

            <div className="card bg-base-100 shadow-xl border p-6">
                <h2 className="text-xl font-semibold mb-4">Case 1: Button with `content` prop</h2>
                <p className="mb-4">Use this when the content is static or can be pre-rendered.</p>

                {/* 
                    Pass the component directly to the button.
                    The button will handle the click and call print().
                */}
                <GlobalPrintButton
                    label="Print Receipt (Prop)"
                    className="btn-primary"
                    content={<Receipt data={sampleData} />}
                />
            </div>

            <div className="card bg-base-100 shadow-xl border p-6">
                <h2 className="text-xl font-semibold mb-4">Case 2: Manual Trigger</h2>
                <p className="mb-4">Use this when you need to calculate data or fetch something before printing.</p>

                <button
                    className="btn btn-secondary"
                    onClick={handleManualPrint}
                >
                    Generate & Print
                </button>
            </div>

            <div className="alert alert-info">
                <span>
                    <strong>Note:</strong> The receipt is NOT rendered on this page.
                    It is rendered into a hidden off-screen container only when you click print.
                </span>
            </div>
        </div>
    );
};

export default PrintExample;
