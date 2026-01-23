import axios from 'axios';

// Configure axios instance with base URL
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: { 'Content-Type': 'application/json' }
});

/**
 * Fetch active signer based on structure context and role
 * @param {string} structureCode e.g. 'BAITULMALL_2023'
 * @param {string} role e.g. 'Ketua Umum'
 * @param {boolean} isZakat Filter by can_sign_zakat authority
 */
export const fetchActiveSigner = async (structureCode, role, isZakat = false) => {
    try {
        const response = await api.get('/signers/active', {
            params: {
                kode_struktur: structureCode,
                jabatan: role,
                filter_zakat: isZakat
            }
        });
        return response.data; // { success: true, data: { nama_lengkap, jabatan, structure, ... } }
    } catch (error) {
        console.error('Failed to fetch signer:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Signer not found'
        };
    }
};
