import api from './api';

/**
 * Fetch real-time Mustahik statistics
 * @param {number} tahun - Year filter
 */
export const fetchMustahikStats = async (tahun) => {
    try {
        const response = await api.get('/stats/mustahik', {
            params: { tahun }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching real-time stats:', error);
        throw error;
    }
};
