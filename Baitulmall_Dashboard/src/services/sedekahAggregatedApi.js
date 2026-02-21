// MOCK API for Sedekah Aggregated Feature (Baitulmall 2.0)
// Designed to simulate the new database structure: sedekah_transactions

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initial Mock Data
let TRANSACTIONS = [
    {
        id: 101,
        tanggal: new Date().toISOString().split('T')[0],
        rt_kode: '01',
        amil_nama: 'Budi Santoso',
        sumber: 'KOLEKTIF_RT', // 'KOLEKTIF_RT' | 'LANGSUNG_RW' | 'TITIPAN'
        jumlah: 500000,
        keterangan: 'Setoran pekan ke-4',
        created_at: new Date().toISOString()
    },
    {
        id: 102,
        tanggal: new Date().toISOString().split('T')[0],
        rt_kode: null,
        amil_nama: 'Admin RW',
        sumber: 'LANGSUNG_RW',
        jumlah: 1500000,
        keterangan: 'Hamba Allah via Transfer',
        created_at: new Date().toISOString()
    }
];

// Calculate summary stats
const calculateSummary = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();

    const todayTotal = TRANSACTIONS
        .filter(t => t.tanggal === today)
        .reduce((sum, t) => sum + t.jumlah, 0);

    const monthTotal = TRANSACTIONS
        .filter(t => new Date(t.tanggal).getMonth() === currentMonth)
        .reduce((sum, t) => sum + t.jumlah, 0);

    const saldoTotal = TRANSACTIONS.reduce((sum, t) => sum + t.jumlah, 0); // Assuming no expenses for now or static expenses

    return {
        today: todayTotal,
        month: monthTotal,
        saldo: saldoTotal, // Simplification
        trend: [4200000, 5900000, 4500000, 6100000, 5200000, saldoTotal] // Mock trend
    };
};

export const fetchSedekahSummary = async () => {
    await delay(300);
    return {
        success: true,
        data: calculateSummary()
    };
};

export const fetchSedekahHistory = async (filters = {}) => {
    await delay(400);
    let data = [...TRANSACTIONS];

    // Simple filter simulation
    if (filters.rt) {
        data = data.filter(t => t.rt_kode === filters.rt);
    }

    // Sort desc
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
        success: true,
        data: data
    };
};

export const createSedekahTransaction = async (payload) => {
    await delay(500);

    // Validation simulation
    if (payload.jumlah <= 0) {
        throw { response: { data: { message: "Jumlah sedekah harus lebih dari 0" } } };
    }

    if (payload.sumber === 'KOLEKTIF_RT' && !payload.rt_kode) {
        throw { response: { data: { message: "RT wajib diisi untuk sedekah kolektif" } } };
    }

    const newTransaction = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        ...payload,
        created_at: new Date().toISOString()
    };

    TRANSACTIONS.push(newTransaction);

    return {
        success: true,
        data: newTransaction,
        message: "Transaksi berhasil dicatat"
    };
};
