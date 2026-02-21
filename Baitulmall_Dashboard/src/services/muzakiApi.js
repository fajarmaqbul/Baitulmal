import api from './authApi';

export const fetchMuzakis = async (params) => {
    try {
        const response = await api.get('/muzaki', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const fetchMuzakiById = async (id) => {
    try {
        const response = await api.get(`/muzaki/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createMuzaki = async (data) => {
    try {
        const response = await api.post('/muzaki', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateMuzaki = async (id, data) => {
    try {
        const response = await api.put(`/muzaki/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteMuzaki = async (id) => {
    try {
        const response = await api.delete(`/muzaki/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
