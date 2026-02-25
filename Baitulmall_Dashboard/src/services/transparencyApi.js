import api from './api';

export const fetchPublicStatistics = async () => {
    const response = await api.get('/public/statistics');
    return response.data;
};

export const fetchPublicStories = async () => {
    const response = await api.get('/public/stories');
    return response.data;
};

export const fetchLiveStats = async () => {
    const response = await api.get('/public/live-stats');
    return response.data;
};
