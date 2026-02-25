import api from './api';

export const fetchNotificationLogs = async (params) => {
    const response = await api.get('/notifications', { params });
    return response.data;
};

export default api;
