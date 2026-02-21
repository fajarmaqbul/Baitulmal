// MOCK API for Kotak Sedekah Feature
// In a real app, this would call endpoints like /api/v1/kotak-sedekah

// Seed data storage (in-memory for demo purposes)
let MOCK_DB = {
    sessions: Array.from({ length: 7 }, (_, i) => ({
        id: i + 1,
        rt_kode: `0${i + 1}`,
        amil_nama: '', // Start empty
        items: []
    }))
};

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchKotakData = async (month, year) => {
    await delay(300);
    // In a real app, we would filter by month/year here.
    // For now, we return the same mock structure, but in reality 
    // the backend would return specific sessions for that period.
    return { success: true, data: [...MOCK_DB.sessions] };
};

export const updateAmilName = async (sessionId, name) => {
    await delay(200);
    const session = MOCK_DB.sessions.find(s => s.id === sessionId);
    if (session) {
        session.amil_nama = name;
        return { success: true, data: session };
    }
    return { success: false, message: 'Session not found' };
};

export const addKotakItem = async (sessionId, item) => {
    await delay(200);
    const session = MOCK_DB.sessions.find(s => s.id === sessionId);
    if (session) {
        const newItem = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            nama_donatur: item.nama_donatur || 'Hamba Allah',
            nominal: Number(item.nominal),
            created_at: new Date().toISOString()
        };
        session.items.push(newItem);
        return { success: true, data: newItem };
    }
    return { success: false, message: 'Session not found' };
};

export const deleteKotakItem = async (sessionId, itemId) => {
    await delay(200);
    const session = MOCK_DB.sessions.find(s => s.id === sessionId);
    if (session) {
        session.items = session.items.filter(i => i.id !== itemId);
        return { success: true };
    }
    return { success: false, message: 'Session not found' };
};
