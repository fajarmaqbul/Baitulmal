import api from './api';

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
