import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1';

// Sedekah (Donation) API
export const fetchSedekahList = (params = {}) => axios.get(`${API_URL}/sedekah`, { params }).then(res => res.data);
export const createSedekah = (data) => axios.post(`${API_URL}/sedekah`, data).then(res => res.data);
export const deleteSedekahApi = (id) => axios.delete(`${API_URL}/sedekah/${id}`).then(res => res.data);

// Santunan (Recipient) API
export const fetchSantunanList = (params = {}) => axios.get(`${API_URL}/santunan`, { params }).then(res => res.data);
export const createSantunan = (data) => axios.post(`${API_URL}/santunan`, data).then(res => res.data);
export const updateSantunanApi = (id, data) => axios.put(`${API_URL}/santunan/${id}`, data).then(res => res.data);
export const deleteSantunanApi = (id) => axios.delete(`${API_URL}/santunan/${id}`).then(res => res.data);
