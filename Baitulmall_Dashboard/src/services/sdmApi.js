import axios from 'axios';

// Configure axios instance with base URL
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: { 'Content-Type': 'application/json' }
});

// Base endpoints
const ENDPOINTS = {
    PEOPLE: '/people',
    STRUCTURES: '/structures',
    ASSIGNMENTS: '/assignments',
    KEPENGURUSAN_VIEW: '/kepengurusan' // Legacy view
};

// 1. People Operations
export const fetchPeople = async (params) => {
    try {
        const response = await api.get(ENDPOINTS.PEOPLE, { params });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const createPerson = async (data) => {
    return await api.post(ENDPOINTS.PEOPLE, data);
};

// 2. Structure Operations
export const fetchStructures = async () => {
    const response = await api.get(ENDPOINTS.STRUCTURES);
    return response.data;
};

// 3. Assignment Operations
export const fetchAssignments = async (structureId) => {
    const params = structureId ? { structure_id: structureId } : {};
    const response = await api.get(ENDPOINTS.ASSIGNMENTS, { params });
    return response.data;
};

export const createAssignment = async (data) => {
    return await api.post(ENDPOINTS.ASSIGNMENTS, data);
};

export const deleteAssignment = async (id) => {
    return await api.delete(`${ENDPOINTS.ASSIGNMENTS}/${id}`);
};

// 4. Composite Helper (For Kepengurusan Page)
export const fetchKepengurusan = async () => {
    // Uses the view endpoint that flattens data similar to old localStorage format
    const response = await api.get(ENDPOINTS.KEPENGURUSAN_VIEW);
    return response.data; // { success: true, data: [...] }
};

export const savePengurusBaru = async (formData, structureId) => {
    // This requires a composite transaction:
    // 1. Check/Create Person
    // 2. Create Assignment

    // For simplicity, we assume frontend sends full payload and we handle it here or backend.
    // If we strictly follow REST:
    // Step 1: Create Person
    const personRes = await createPerson({
        nama_lengkap: formData.nama,
        no_wa: formData.no_wa,
        alamat_domisili: formData.alamat,
        jenis_kelamin: 'L' // Default
    });

    const personId = personRes.data.data.id;

    // Step 2: Assign
    const assignRes = await createAssignment({
        person_id: personId,
        structure_id: structureId,
        jabatan: formData.jabatan,
        tanggal_mulai: formData.periode_mulai + '-01-01', // Year to date
        status: formData.status,
        keterangan: formData.job_desk
    });

    return assignRes.data;
};
