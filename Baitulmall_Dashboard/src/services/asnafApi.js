import api from './api';

/**
 * Baitulmall API Service
 * 
 * Centralized API service layer for Laravel backend communication
 * Using shared axios instance from ./api.js
 * 
 * IMPORTANT: This is pure data fetching layer - NO UI LOGIC HERE
 */

/**
 * Fetch Asnaf data for map visualization
 * 
 * @param {Object} filters - Optional filters
 * @param {number} filters.tahun - Year filter (default: current year)
 * @param {string} filters.kategori - Category filter (Fakir, Miskin, Fisabilillah, Amil)
 * @param {number} filters.rt_id - RT ID filter
 * @returns {Promise<Array>} Array of Asnaf with coordinates
 */
export const fetchAsnafMap = async (filters = {}) => {
    try {
        const params = {
            tahun: filters.tahun || new Date().getFullYear(),
            ...(filters.kategori && { kategori: filters.kategori }),
            ...(filters.rt_id && { rt_id: filters.rt_id }),
        };

        const response = await api.get('/asnaf/map', { params });
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching Asnaf map data:', error);
        throw error;
    }
};

/**
 * Fetch paginated list of Asnaf
 * 
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.per_page - Items per page (default: 50)
 * @param {string} options.kategori - Category filter
 * @param {number} options.rt_id - RT ID filter
 * @param {number} options.tahun - Year filter
 * @param {string} options.status - Status filter (active/inactive)
 * @returns {Promise<Object>} Paginated Asnaf data
 */
export const fetchAsnafList = async (options = {}) => {
    try {
        const params = {
            page: options.page || 1,
            per_page: options.per_page || 50,
            ...(options.kategori && { kategori: options.kategori }),
            ...(options.rt_id && { rt_id: options.rt_id }),
            ...(options.tahun && { tahun: options.tahun }),
            ...(options.status && { status: options.status }),
        };

        const response = await api.get('/asnaf', { params });
        return response.data; // Returns pagination object {data, total, per_page, current_page, etc}
    } catch (error) {
        console.error('Error fetching Asnaf list:', error);
        throw error;
    }
};

/**
 * Fetch Asnaf statistics summary
 * 
 * @param {number} tahun - Year for statistics (default: current year)
 * @returns {Promise<Object>} Statistics object {total_kk, total_jiwa, by_kategori, by_rt}
 */
export const fetchAsnafStatistics = async (tahun) => {
    try {
        const params = {
            tahun: tahun || new Date().getFullYear(),
        };

        const response = await api.get('/asnaf/statistics', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching Asnaf statistics:', error);
        throw error;
    }
};

/**
 * Fetch single Asnaf by ID
 * 
 * @param {number} id - Asnaf ID
 * @returns {Promise<Object>} Asnaf object
 */
export const fetchAsnafById = async (id) => {
    try {
        const response = await api.get(`/asnaf/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Asnaf ID ${id}:`, error);
        throw error;
    }
};

/**
 * Create new Asnaf entry
 * 
 * @param {Object} data - Asnaf data
 * @param {number} data.rt_id - RT ID (required)
 * @param {string} data.nama - Name (required)
 * @param {string} data.kategori - Category (required: Fakir, Miskin, Fisabilillah, Amil)
 * @param {number} data.jumlah_jiwa - Number of family members (required)
 * @param {number} data.tahun - Year (required)
 * @param {number} data.latitude - Latitude (optional)
 * @param {number} data.longitude - Longitude (optional)
 * @param {string} data.alamat - Address (optional)
 * @returns {Promise<Object>} Created Asnaf object
 */
export const createAsnaf = async (data) => {
    try {
        const response = await api.post('/asnaf', data);
        return response.data;
    } catch (error) {
        console.error('Error creating Asnaf:', error);
        throw error;
    }
};

/**
 * Update existing Asnaf entry
 * 
 * @param {number} id - Asnaf ID
 * @param {Object} data - Updated Asnaf data
 * @returns {Promise<Object>} Updated Asnaf object
 */
export const updateAsnaf = async (id, data) => {
    try {
        const response = await api.put(`/asnaf/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating Asnaf ID ${id}:`, error);
        throw error;
    }
};

/**
 * Delete Asnaf entry (soft delete)
 * 
 * @param {number} id - Asnaf ID
 * @returns {Promise<Object>} Success message
 */
export const deleteAsnaf = async (id) => {
    try {
        const response = await api.delete(`/asnaf/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting Asnaf ID ${id}:`, error);
        throw error;
    }
};

/**
 * Fetch all RTs (Rukun Tetangga)
 * 
 * @returns {Promise<Array>} Array of RT objects
 */
export const fetchRTs = async () => {
    try {
        const response = await api.get('/rts');
        return response.data;
    } catch (error) {
        console.error('Error fetching RTs:', error);
        throw error;
    }
};

/**
 * Fetch single RT by ID
 * 
 * @param {number} id - RT ID
 * @returns {Promise<Object>} RT object
 */
export const fetchRTById = async (id) => {
    try {
        const response = await api.get(`/rts/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching RT ID ${id}:`, error);
        throw error;
    }
};

/**
 * Fetch Asnaf in specific RT
 * 
 * @param {number} rtId - RT ID
 * @returns {Promise<Array>} Array of Asnaf in RT
 */
export const fetchAsnafByRT = async (rtId) => {
    try {
        const response = await api.get(`/rts/${rtId}/asnaf`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Asnaf for RT ${rtId}:`, error);
        throw error;
    }
};

/**
 * Report a death event
 * 
 * @param {Object} data - Death report data
 * @param {string} data.nama - Name of deceased
 * @param {number} data.rt_id - RT ID
 * @param {number} data.amount - Santunan amount
 * @param {string} data.tanggal - Date of death
 * @param {number} data.asnaf_id - Optional Asnaf ID
 * @returns {Promise<Object>} Response data
 */
export const reportDeath = async (data) => {
    try {
        const response = await api.post('/death-events', data);
        return response.data;
    } catch (error) {
        console.error('Error reporting death:', error);
        throw error;
    }
};

/**
 * Fetch Graduation Index (Social Mobility)
 * 
 * @param {number} tahun - Year to evaluate against previous year
 * @returns {Promise<Object>} Summary and details arrays
 */
export const fetchGraduationIndex = async (tahun) => {
    try {
        const params = { tahun: tahun || new Date().getFullYear() };
        const response = await api.get('/asnaf/graduation-index', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching Graduation Index:', error);
        throw error;
    }
};

// Export the configured axios instance for custom requests if needed
export default api;
