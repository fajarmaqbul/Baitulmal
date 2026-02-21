// SERVICES: kotakSedekahApi.js
// Simulates the V3 Backend Logic: Detailed Storage, On-the-fly Aggregation.

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ---- MOCK DATABASE (LOCAL STORAGE PERSISTENCE) ----
const STORAGE_KEY = 'BAITULMAL_SEDEKAH_DB_V1';

// Seed data (only if empty)
const SEED_DATA = [
    { id: 101, rt_kode: '01', tanggal: '2023-10-25', nama_donatur: 'Hamba Allah', nominal: 50000, created_at: '2023-10-25T10:00:00Z' },
    { id: 102, rt_kode: '01', tanggal: '2023-10-26', nama_donatur: 'Bapak Budi', nominal: 100000, created_at: '2023-10-26T09:30:00Z' },
    { id: 103, rt_kode: '02', tanggal: '2023-10-27', nama_donatur: 'Ibu Siti', nominal: 200000, created_at: '2023-10-27T14:15:00Z' },
    { id: 104, rt_kode: '05', tanggal: '2023-10-28', nama_donatur: 'Kolektif Warga', nominal: 1500000, created_at: '2023-10-28T16:00:00Z' },
];

const loadDB = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
};

const saveDB = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

let DETAILS_DB = loadDB();

/**
 * FETCH AGGREGATION (RW VIEW)
 * Backend calculates this from raw data. No manual editing allowed.
 */
// ---- PENGELUARAN DB ----
const PENGELUARAN_STORAGE_KEY = 'BAITULMAL_PENGELUARAN_DB_V1';

const SEED_PENGELUARAN = [
    { id: 201, tanggal: '2023-10-29', deskripsi: 'Beli ATK & Amplop', nominal: 50000, created_at: '2023-10-29T10:00:00Z' },
    { id: 202, tanggal: '2023-10-30', deskripsi: 'Konsumsi Rapat Bulanan', nominal: 150000, created_at: '2023-10-30T10:00:00Z' }
];

const loadPengeluaranDB = () => {
    const saved = localStorage.getItem(PENGELUARAN_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(PENGELUARAN_STORAGE_KEY, JSON.stringify(SEED_PENGELUARAN));
    return SEED_PENGELUARAN;
};

const savePengeluaranDB = (data) => {
    localStorage.setItem(PENGELUARAN_STORAGE_KEY, JSON.stringify(data));
};

let PENGELUARAN_DB = loadPengeluaranDB();

/**
 * FETCH PENGELUARAN LIST
 */
export const fetchPengeluaranList = async (month, year) => {
    await delay(300);
    const data = PENGELUARAN_DB
        .filter(item => {
            const txDate = new Date(item.tanggal);
            const txMonth = txDate.getMonth() + 1;
            const txYear = txDate.getFullYear();

            if (month && Number(month) !== txMonth) return false;
            if (year && Number(year) !== txYear) return false;
            return true;
        })
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    return { success: true, data };
};

export const createPengeluaran = async (payload) => {
    await delay(500);
    if (!payload.deskripsi) throw { message: "Deskripsi wajib diisi" };
    if (!payload.nominal || payload.nominal <= 0) throw { message: "Nominal harus lebih dari 0" };
    if (!payload.tanggal) throw { message: "Tanggal wajib diisi" };

    const newItem = {
        id: Date.now(),
        tanggal: payload.tanggal,
        deskripsi: payload.deskripsi,
        nominal: Number(payload.nominal),
        created_at: new Date().toISOString()
    };

    PENGELUARAN_DB.push(newItem);
    savePengeluaranDB(PENGELUARAN_DB);
    return { success: true, message: "Pengeluaran berhasil disimpan" };
};

export const updatePengeluaran = async (id, payload) => {
    await delay(500);
    PENGELUARAN_DB = loadPengeluaranDB();
    const index = PENGELUARAN_DB.findIndex(x => x.id === id);
    if (index === -1) throw { message: "Data tidak ditemukan" };

    PENGELUARAN_DB[index] = { ...PENGELUARAN_DB[index], ...payload, nominal: Number(payload.nominal) };
    savePengeluaranDB(PENGELUARAN_DB);
    return { success: true, message: "Pengeluaran berhasil diupdate" };
};

export const deletePengeluaran = async (id) => {
    await delay(500);
    PENGELUARAN_DB = loadPengeluaranDB();
    PENGELUARAN_DB = PENGELUARAN_DB.filter(x => x.id !== id);
    savePengeluaranDB(PENGELUARAN_DB);
    return { success: true, message: "Pengeluaran berhasil dihapus" };
};


/**
 * FETCH AGGREGATION (RW VIEW)
 * Backend calculates this from raw data. No manual editing allowed.
 */
export const fetchSedekahAggregation = async (month, year) => {
    await delay(300);

    // Group by RT
    const aggregation = {};
    const rtList = ['01', '02', '03', '04', '05', '06', '07']; // Master RT

    // Initialize
    rtList.forEach(rt => {
        aggregation[rt] = {
            rt_kode: rt,
            total_nominal: 0,
            transaction_count: 0,
            last_transaction: null
        };
    });

    // Compute with filters
    DETAILS_DB.forEach(tx => {
        const txDate = new Date(tx.tanggal);
        const txMonth = txDate.getMonth() + 1; // 0-indexed
        const txYear = txDate.getFullYear();

        // Check Filter
        if (month && Number(month) !== txMonth) return;
        if (year && Number(year) !== txYear) return;

        if (aggregation[tx.rt_kode]) {
            aggregation[tx.rt_kode].total_nominal += tx.nominal;
            aggregation[tx.rt_kode].transaction_count += 1;

            // Check latest date
            if (!aggregation[tx.rt_kode].last_transaction || new Date(tx.created_at) > new Date(aggregation[tx.rt_kode].last_transaction)) {
                aggregation[tx.rt_kode].last_transaction = tx.tanggal;
            }
        }
    });

    const totalIncome = Object.values(aggregation).reduce((sum, row) => sum + row.total_nominal, 0);

    // Calculate Expense
    const expenses = await fetchPengeluaranList(month, year);
    const totalExpense = expenses.data.reduce((sum, item) => sum + item.nominal, 0);

    return {
        success: true,
        data: {
            breakdown: Object.values(aggregation),
            grand_total: totalIncome,
            total_expense: totalExpense,
            net_balance: totalIncome - totalExpense
        }
    };
};

/**
 * FETCH DETAILS (RT VIEW / AUDIT)
 */
export const fetchSedekahDetails = async (rt_kode, month, year) => {
    await delay(300);
    // Return entries for specific RT, sorted latest first
    const data = DETAILS_DB
        .filter(item => {
            // IF rt_kode is NOT passed or 'ALL', we show all (Admin View usually) 
            // BUT currently the design is RT specific. 
            // If function called with rt_kode, filter by it.
            if (rt_kode && rt_kode !== 'ALL' && item.rt_kode !== rt_kode) return false;

            const txDate = new Date(item.tanggal);
            const txMonth = txDate.getMonth() + 1;
            const txYear = txDate.getFullYear();

            if (month && Number(month) !== txMonth) return false;
            if (year && Number(year) !== txYear) return false;

            return true;
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
        success: true,
        data: data
    };
};

/**
 * CREATE TRANSACTION (RT INPUT)
 */
export const createSedekahDetail = async (payload) => {
    await delay(500);

    // Backend Validation
    if (!payload.rt_kode) throw { message: "Kode RT tidak valid" };
    if (!payload.nominal || payload.nominal <= 0) throw { message: "Nominal harus lebih dari 0" };
    if (!payload.tanggal) throw { message: "Tanggal wajib diisi" };

    const newItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        rt_kode: payload.rt_kode,
        tanggal: payload.tanggal,
        nama_donatur: payload.nama_donatur || 'Hamba Allah',
        nominal: Number(payload.nominal),
        created_at: new Date().toISOString() // Audit trail
    };

    DETAILS_DB.push(newItem);
    saveDB(DETAILS_DB);

    return {
        success: true,
        data: newItem,
        message: "Data sedekah berhasil disimpan"
    };
};

/**
 * UPDATE TRANSACTION (RW / ADMIN ONLY)
 */
export const updateSedekahDetail = async (id, payload) => {
    await delay(500);
    DETAILS_DB = loadDB(); // Refresh

    const index = DETAILS_DB.findIndex(x => x.id === id);
    if (index === -1) throw { message: "Data tidak ditemukan" };

    // Updates
    if (payload.tanggal) DETAILS_DB[index].tanggal = payload.tanggal;
    if (payload.nama_donatur !== undefined) DETAILS_DB[index].nama_donatur = payload.nama_donatur;
    if (payload.nominal) DETAILS_DB[index].nominal = Number(payload.nominal);

    saveDB(DETAILS_DB);

    return {
        success: true,
        data: DETAILS_DB[index],
        message: "Data berhasil diperbarui"
    };
};

/**
 * DELETE TRANSACTION (RW / ADMIN ONLY)
 */
export const deleteSedekahDetail = async (id) => {
    await delay(500);
    DETAILS_DB = loadDB(); // Refresh

    const initialLen = DETAILS_DB.length;
    DETAILS_DB = DETAILS_DB.filter(x => x.id !== id);

    if (DETAILS_DB.length === initialLen) throw { message: "Data tidak ditemukan untuk dihapus" };

    saveDB(DETAILS_DB);

    return {
        success: true,
        message: "Data berhasil dihapus"
    };
};
