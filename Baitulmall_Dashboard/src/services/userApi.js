import api from './authApi';

export const fetchUsers = async (params) => {
    try {
        const response = await api.get('/users', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateUserRole = async (userId, data) => {
    try {
        const response = await api.put(`/users/${userId}/role`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateUser = async (userId, data) => {
    try {
        const response = await api.put(`/users/${userId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const fetchStructures = async () => {
    try {
        const response = await api.get('/structures');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
