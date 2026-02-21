import axios from './asnafApi'; // Reuse axios instance

/**
 * Zakat Fitrah API Service
 */

/**
 * Fetch paginated list of Zakat Fitrah (Muzaki)
 * @param {Object} options - { page, per_page, tahun, rt_id }
 */
export const fetchZakatFitrahList = async (options = {}) => {
    try {
        const response = await axios.get('/muzaki', { params: options });
        return response.data;
    } catch (error) {
        console.error('Error fetching Zakat Fitrah list:', error);
        throw error;
    }
};

/**
 * Fetch Muzaki Statistics (Total Beras, Total Jiwa, etc.)
 * @param {string|number} tahun 
 */
export const fetchMuzakiStats = async (tahun) => {
    try {
        const response = await axios.get('/muzaki/stats', { params: { tahun } });
        return response.data;
    } catch (error) {
        console.error('Error fetching Muzaki stats:', error);
        throw error; // Let component handle error/fallback
    }
};

/**
 * Create new Zakat Fitrah Entry
 * @param {Object} data 
 */
export const createZakatFitrah = async (data) => {
    try {
        const response = await axios.post('/muzaki', data);
        return response.data;
    } catch (error) {
        console.error('Error creating Zakat Fitrah:', error);
        throw error;
    }
};

/**
 * Update Zakat Fitrah Entry
 * @param {number} id
 * @param {Object} data
 */
export const updateZakatFitrah = async (id, data) => {
    try {
        const response = await axios.put(`/muzaki/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating Zakat Fitrah ID ${id}:`, error);
        throw error;
    }
};

/**
 * Delete Zakat Fitrah Entry
 * @param {number} id
 */
export const deleteZakatFitrahApi = async (id) => {
    try {
        const response = await axios.delete(`/muzaki/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting Zakat Fitrah ID ${id}:`, error);
        throw error;
    }
};


/**
 * Fetch Zakat Fitrah Financial Summary
 * @param {string|number} tahun
 */
export const fetchZakatFitrahSummary = async (tahun) => {
    try {
        const response = await axios.get(`/zakat-fitrah/summary/${tahun}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Zakat Fitrah summary:', error);
        throw error;
    }
};
