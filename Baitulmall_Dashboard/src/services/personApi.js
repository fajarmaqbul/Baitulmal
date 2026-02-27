import api from './api';

export const fetchPeople = async (params = {}) => {
    const response = await api.get('/people', { params });
    return response.data;
};

export const createPerson = async (data) => {
    const response = await api.post('/people', data);
    return response.data;
};

export const updatePerson = async (id, data) => {
    const response = await api.put(`/people/${id}`, data);
    return response.data;
};

export const deletePerson = async (id) => {
    const response = await api.delete(`/people/${id}`);
    return response.data;
};

export const fetchPersonById = async (id) => {
    const response = await api.get(`/people/${id}`);
    return response.data;
};

export const fetchPeopleOverview = async () => {
    const response = await api.get('/people/overview');
    return response.data;
};
