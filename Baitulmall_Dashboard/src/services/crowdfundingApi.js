import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const fetchCampaigns = async () => {
    const response = await api.get('/campaigns');
    return response.data;
};

export const fetchCampaignById = async (id) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
};

export const createCampaign = async (data) => {
    const response = await api.post('/campaigns', data);
    return response.data;
};

export const updateCampaign = async (id, data) => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
};

export const deleteCampaign = async (id) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
};

export const submitDonation = async (data) => {
    const response = await api.post('/donations', data);
    return response.data;
};

export default api;
