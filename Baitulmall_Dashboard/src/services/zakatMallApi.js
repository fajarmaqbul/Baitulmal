import axios from './asnafApi'; // Reuse axios instance

/**
 * Zakat Mall API Service
 */

/**
 * Fetch paginated list of Zakat Mall transactions
 * @param {Object} options - { page, per_page, kategori, rt_id }
 */
export const fetchZakatMallList = async (options = {}) => {
    try {
        const response = await axios.get('/zakat-mall', { params: options });
        return response.data;
    } catch (error) {
        console.error('Error fetching Zakat Mall list:', error);
        throw error;
    }
};

/**
 * Create new Zakat Mall entry
 * @param {Object} data - { rt_id, kategori, jumlah, keterangan, tanggal }
 */
export const createZakatMall = async (data) => {
    try {
        const response = await axios.post('/zakat-mall', data);
        return response.data;
    } catch (error) {
        console.error('Error creating Zakat Mall:', error);
        throw error;
    }
};

/**
 * Update Zakat Mall entry
 * @param {number} id
 * @param {Object} data
 */
export const updateZakatMallApi = async (id, data) => {
    try {
        const response = await axios.put(`/zakat-mall/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating Zakat Mall ID ${id}:`, error);
        throw error;
    }
};

/**
 * Delete Zakat Mall entry
 * @param {number} id
 */
export const deleteZakatMallApi = async (id) => {
    try {
        const response = await axios.delete(`/zakat-mall/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting Zakat Mall ID ${id}:`, error);
        throw error;
    }
};
