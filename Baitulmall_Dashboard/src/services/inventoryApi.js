import axios from 'axios';

// Configure axios instance with base URL (same as asnafApi)
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

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
