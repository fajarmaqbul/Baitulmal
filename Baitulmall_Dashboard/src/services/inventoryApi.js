import api from './api';

// Assets
export const fetchAssets = async () => {
    const response = await api.get('/assets');
    return response.data;
};

export const createAsset = async (data) => {
    const response = await api.post('/assets', data);
    return response.data;
};

export const updateAsset = async (id, data) => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
};

export const deleteAsset = async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
};

// Loans
export const fetchLoans = async () => {
    const response = await api.get('/loans');
    return response.data;
};

export const createLoan = async (data) => {
    const response = await api.post('/loans', data);
    return response.data;
};

export const returnLoan = async (id, data) => {
    const response = await api.post(`/loans/${id}/return`, data);
    return response.data;
};

export default api;
