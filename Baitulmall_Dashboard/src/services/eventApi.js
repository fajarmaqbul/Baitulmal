import axios from 'axios';

// Configure axios instance with base URL
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: { 'Content-Type': 'application/json' }
});

/**
 * Event Management API Service
 * Uses the SDM architecture (organization_structures table)
 */

// ========== Event (Structure) Operations ==========

/**
 * Fetch all events (structures with tipe = 'Project' or 'Event')
 */
export const fetchEvents = async () => {
    try {
        const response = await api.get('/structures');
        // Filter to only show event/project type structures
        const events = response.data.data?.filter(s =>
            s.tipe === 'Project' || s.tipe === 'Event' || s.tipe === 'Panitia'
        ) || [];
        return { success: true, data: events };
    } catch (error) {
        console.error('Failed to fetch events:', error);
        return { success: false, data: [], message: error.message };
    }
};

/**
 * Create a new event/project structure
 */
export const createEvent = async (data) => {
    const payload = {
        kode_struktur: data.kode_struktur,
        nama_struktur: data.nama_struktur,
        tipe: data.tipe || 'Project',
        tanggal_mulai: data.tanggal_mulai,
        tanggal_selesai: data.tanggal_selesai,
        is_active: true
    };
    const response = await api.post('/structures', payload);
    return { success: true, data: response.data.data };
};

/**
 * Update an existing event/project
 */
export const updateEvent = async (id, data) => {
    const response = await api.put(`/structures/${id}`, data);
    return { success: true, data: response.data.data };
};

/**
 * Delete or close an event
 */
export const deleteEvent = async (id) => {
    try {
        await api.delete(`/structures/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete event:', error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

// ========== Assignment Operations ==========

/**
 * Fetch assignments for a specific event/structure
 */
export const fetchEventAssignments = async (structureId) => {
    try {
        const response = await api.get('/assignments', {
            params: { structure_id: structureId }
        });
        return { success: true, data: response.data.data || [] };
    } catch (error) {
        console.error('Failed to fetch assignments:', error);
        return { success: false, data: [], message: error.message };
    }
};

/**
 * Assign a person to an event
 */
export const assignPersonToEvent = async (data) => {
    try {
        const payload = {
            person_id: data.person_id,
            structure_id: data.structure_id,
            jabatan: data.jabatan,
            tanggal_mulai: data.tanggal_mulai || new Date().toISOString().split('T')[0],
            status: 'Aktif',
            keterangan: data.keterangan || ''
        };
        const response = await api.post('/assignments', payload);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error('Failed to assign person:', error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

/**
 * Remove assignment
 */
export const removeAssignment = async (assignmentId) => {
    try {
        await api.delete(`/assignments/${assignmentId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to remove assignment:', error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

// ========== People Operations ==========

/**
 * Fetch all people for selection
 */
export const fetchPeopleList = async (search = '') => {
    try {
        const response = await api.get('/people', {
            params: { search, per_page: 100 }
        });
        return { success: true, data: response.data.data?.data || response.data.data || [] };
    } catch (error) {
        console.error('Failed to fetch people:', error);
        return { success: false, data: [], message: error.message };
    }
};

export default {
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEventAssignments,
    assignPersonToEvent,
    removeAssignment,
    fetchPeopleList
};
