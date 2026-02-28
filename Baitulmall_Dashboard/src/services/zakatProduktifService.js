import api from './api';

export const fetchZakatProduktif = async (params = {}) => {
    const res = await api.get('/zakat-produktif', { params });
    return res.data;
};

export const fetchZakatProduktifDetail = async (id) => {
    const res = await api.get(`/zakat-produktif/${id}`);
    return res.data;
};

export const createZakatProduktif = async (data) => {
    const res = await api.post('/zakat-produktif', data);
    return res.data;
};

export const updateZakatProduktif = async (id, data) => {
    const res = await api.put(`/zakat-produktif/${id}`, data);
    return res.data;
};

export const deleteZakatProduktif = async (id) => {
    const res = await api.delete(`/zakat-produktif/${id}`);
    return res.data;
};

export const createMonitoringProject = async (id, data) => {
    const res = await api.post(`/zakat-produktif/${id}/monitoring`, data);
    return res.data;
};

export const fetchZakatProduktifSummary = async () => {
    const res = await api.get('/zakat-produktif/summary');
    return res.data;
};
