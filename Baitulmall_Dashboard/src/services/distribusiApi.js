import api from './api';

/**
 * Fetch Distribusi list
 * @param {Object} options - { page, per_page, tahun, status }
 */
export const fetchDistribusi = async (options = {}) => {
    try {
        const response = await api.get('/distribusi', { params: options });
        return response.data;
    } catch (error) {
        console.error('Error fetching Distribusi:', error);
        throw error;
    }
};

/**
 * Create or Bulk Create Distribusi
 * @param {Object|Array} data - Single object or { distributions: [...] }
 */
export const saveDistribusi = async (data) => {
    try {
        const response = await api.post('/distribusi', data);
        return response.data;
    } catch (error) {
        console.error('Error saving Distribusi:', error);
        throw error;
    }
};

/**
 * Delete a Distribution Record
 * @param {number|string} id 
 */
export const deleteDistribusi = async (id) => {
    try {
        const response = await api.delete(`/distribusi/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting Distribusi ID ${id}:`, error);
        throw error;
    }
};
/**
 * Delete multiple Distribution Records
 * @param {Array} ids 
 */
export const deleteDistribusiBulk = async (ids) => {
    try {
        const response = await api.delete('/distribusi', { data: { ids } });
        return response.data;
    } catch (error) {
        console.error('Error deleting bulk Distribusi:', error);
        throw error;
    }
};
