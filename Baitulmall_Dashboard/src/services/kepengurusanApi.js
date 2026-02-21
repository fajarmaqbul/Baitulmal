import api from './authApi';

/**
 * Kepengurusan API Service
 * Centralizes organization structure data.
 */

export const fetchKepengurusan = async (kodeStruktur) => {
    try {
        const response = await api.get('/kepengurusan', {
            params: { kode_struktur: kodeStruktur }
        });
        return response.data;
    } catch (err) {
        console.error("Failed to fetch kepengurusan:", err);
        throw err;
    }
};

export const fetchStrukturInti = async () => fetchKepengurusan('BAITULMALL_2023');
export const fetchPengurusTakmir = async () => fetchKepengurusan('TAKMIR_2023');
export const fetchPengurusRW = async () => fetchKepengurusan('RW_01_2023');
export const fetchPengurusRT = async (rtCode) => fetchKepengurusan(rtCode ? `RT_${rtCode}_2023` : null);

