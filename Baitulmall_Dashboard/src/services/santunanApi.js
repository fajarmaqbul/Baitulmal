import api from './api';

// Sedekah (Donation) API
export const fetchSedekahList = (params = {}) => api.get('/sedekah', { params }).then(res => res.data);
export const fetchSedekahSummary = (params = {}) => api.get('/sedekah/summary', { params }).then(res => res.data);
export const createSedekah = (data) => api.post('/sedekah', data).then(res => res.data);
export const updateSedekahApi = (id, data) => api.put(`/sedekah/${id}`, data).then(res => res.data);
export const deleteSedekahApi = (id) => api.delete(`/sedekah/${id}`).then(res => res.data);

// Alias Pengeluaran (Penyaluran Sedekah)
export const fetchPengeluaranList = (month, year) => api.get('/sedekah', { params: { jenis: 'penyaluran', tahun: year } })
    .then(res => {
        const data = res.data.data || res.data;
        // Map backend fields back for frontend compatibility
        const mapped = data.map(item => ({
            ...item,
            deskripsi: item.tujuan,
            nominal: Number(item.jumlah)
        }));
        return { success: true, data: mapped };
    });
export const createPengeluaran = (data) => api.post('/sedekah', { ...data, jenis: 'penyaluran', tujuan: data.deskripsi, jumlah: data.nominal, tahun: new Date(data.tanggal).getFullYear() }).then(res => res.data);
export const updatePengeluaran = (id, data) => api.put(`/sedekah/${id}`, { ...data, jenis: 'penyaluran', tujuan: data.deskripsi, jumlah: data.nominal }).then(res => res.data);
export const deletePengeluaran = (id) => api.delete(`/sedekah/${id}`).then(res => res.data);

// Santunan (Recipient) API
export const fetchSantunanList = (params = {}) => api.get('/santunan', { params }).then(res => res.data);
export const createSantunan = (data) => api.post('/santunan', data).then(res => res.data);
export const updateSantunanApi = (id, data) => api.put(`/santunan/${id}`, data).then(res => res.data);
export const deleteSantunanApi = (id) => api.delete(`/santunan/${id}`).then(res => res.data);

// Santunan Donation (Incoming Funds)
export const fetchSantunanDonations = (params = {}) => api.get('/santunan-donations', { params }).then(res => res.data);
export const createSantunanDonation = (data) => api.post('/santunan-donations', data).then(res => res.data);
export const deleteSantunanDonation = (id) => api.delete(`/santunan-donations/${id}`).then(res => res.data);

// Summary API
export const fetchSantunanSummary = (params = {}) => api.get('/santunan/summary', { params }).then(res => res.data);
export const fetchSantunanActivities = () => api.get('/santunan/activities').then(res => res.data);

// Master Data (Beneficiaries)
export const fetchBeneficiaries = (params) => api.get('/santunan/beneficiaries', { params }).then(res => res.data);
export const createBeneficiary = (data) => api.post('/santunan/beneficiaries', data);
export const updateBeneficiary = (id, data) => api.put(`/santunan/beneficiaries/${id}`, data);
export const deleteBeneficiary = (id) => api.delete(`/santunan/beneficiaries/${id}`);
