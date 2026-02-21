import api from './api';


/**
 * Event Management API
 */

export const fetchPeopleList = async (search = '') => {
    try {
        const response = await api.get('/people', { params: { search } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch people:', error);
        return { success: false, data: [] };
    }
};

export const fetchEvents = async () => {
    try {
        const response = await api.get('/events');
        return response.data; // { success: true, data: [...] }
    } catch (error) {
        console.error('Failed to fetch events:', error);
        return { success: false, data: [] };
    }
};

export const fetchEventById = async (id) => {
    try {
        const response = await api.get(`/events/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch event ${id}:`, error);
        return { success: false, data: null };
    }
};

export const createEvent = async (data) => {
    const response = await api.post('/events', { ...data, tipe: 'Project', is_active: true });
    return response.data;
};

export const updateEvent = async (id, data) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
};

export const deleteEvent = async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
};

/**
 * Event Assignments API
 */

export const fetchEventAssignments = async (structureId) => {
    try {
        const response = await api.get(`/event-assignments?structure_id=${structureId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch event assignments:', error);
        return { success: false, data: [] };
    }
};

export const assignPersonToEvent = async (data) => {
    // data: { person_id, structure_id, jabatan, tanggal_mulai, kewenangan, keterangan }
    const response = await api.post('/event-assignments', data);
    return response.data;
};

export const updateEventAssignment = async (id, data) => {
    const response = await api.put(`/event-assignments/${id}`, data);
    return response.data;
};

export const deleteEventAssignment = async (id) => {
    const response = await api.delete(`/event-assignments/${id}`);
    return response.data;
};
