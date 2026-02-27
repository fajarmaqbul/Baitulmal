import api from './api';

/**
 * Fetch alms capacity data
 * @param {number} unitCost 
 */
export const fetchCapacity = async (unitCost = 100000) => {
    try {
        const response = await api.get('sedekah/analytics/capacity', {
            params: { unit_cost: unitCost }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching capacity:', error);
        throw error;
    }
};

/**
 * Fetch donor loyalty (RFM) data
 */
export const fetchLoyalty = async () => {
    try {
        const response = await api.get('sedekah/analytics/loyalty');
        return response.data;
    } catch (error) {
        console.error('Error fetching loyalty:', error);
        throw error;
    }
};

/**
 * Fetch RT participation heatmap data
 */
export const fetchParticipation = async () => {
    try {
        const response = await api.get('sedekah/analytics/participation');
        return response.data;
    } catch (error) {
        console.error('Error fetching participation:', error);
        throw error;
    }
};
