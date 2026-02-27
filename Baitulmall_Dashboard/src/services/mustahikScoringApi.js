import api from './api';

export const fetchMustahikScores = async () => {
    try {
        const response = await api.get('asnaf/scoring');
        return response.data;
    } catch (error) {
        console.error('Error fetching mustahik scores:', error);
        throw error;
    }
};
