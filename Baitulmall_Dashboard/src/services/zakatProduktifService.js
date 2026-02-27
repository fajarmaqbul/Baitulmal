import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const fetchZakatProduktif = async (params = {}) => {
    const res = await axios.get(`${API_URL}/zakat-produktif`, { params });
    return res.data;
};

export const fetchZakatProduktifDetail = async (id) => {
    const res = await axios.get(`${API_URL}/zakat-produktif/${id}`);
    return res.data;
};

export const createZakatProduktif = async (data) => {
    const res = await axios.post(`${API_URL}/zakat-produktif`, data);
    return res.data;
};

export const updateZakatProduktif = async (id, data) => {
    const res = await axios.put(`${API_URL}/zakat-produktif/${id}`, data);
    return res.data;
};

export const deleteZakatProduktif = async (id) => {
    const res = await axios.delete(`${API_URL}/zakat-produktif/${id}`);
    return res.data;
};

export const createMonitoringProject = async (id, data) => {
    const res = await axios.post(`${API_URL}/zakat-produktif/${id}/monitoring`, data);
    return res.data;
};

export const fetchZakatProduktifSummary = async () => {
    const res = await axios.get(`${API_URL}/zakat-produktif/summary`);
    return res.data;
};
