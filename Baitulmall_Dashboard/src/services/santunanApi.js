import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1';

// Sedekah (Donation) API
export const fetchSedekahList = (params = {}) => axios.get(`${API_URL}/sedekah`, { params }).then(res => res.data);
export const fetchSedekahSummary = (params = {}) => axios.get(`${API_URL}/sedekah/summary`, { params }).then(res => res.data);
export const createSedekah = (data) => axios.post(`${API_URL}/sedekah`, data).then(res => res.data);
export const updateSedekahApi = (id, data) => axios.put(`${API_URL}/sedekah/${id}`, data).then(res => res.data);
export const deleteSedekahApi = (id) => axios.delete(`${API_URL}/sedekah/${id}`).then(res => res.data);

// Alias Pengeluaran (Penyaluran Sedekah)
export const fetchPengeluaranList = (month, year) => axios.get(`${API_URL}/sedekah`, { params: { jenis: 'penyaluran', tahun: year } })
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
export const createPengeluaran = (data) => axios.post(`${API_URL}/sedekah`, { ...data, jenis: 'penyaluran', tujuan: data.deskripsi, jumlah: data.nominal, tahun: new Date(data.tanggal).getFullYear() }).then(res => res.data);
export const updatePengeluaran = (id, data) => axios.put(`${API_URL}/sedekah/${id}`, { ...data, jenis: 'penyaluran', tujuan: data.deskripsi, jumlah: data.nominal }).then(res => res.data);
export const deletePengeluaran = (id) => axios.delete(`${API_URL}/sedekah/${id}`).then(res => res.data);

// Santunan (Recipient) API
export const fetchSantunanList = (params = {}) => axios.get(`${API_URL}/santunan`, { params }).then(res => res.data);
export const createSantunan = (data) => axios.post(`${API_URL}/santunan`, data).then(res => res.data);
export const updateSantunanApi = (id, data) => axios.put(`${API_URL}/santunan/${id}`, data).then(res => res.data);
export const deleteSantunanApi = (id) => axios.delete(`${API_URL}/santunan/${id}`).then(res => res.data);

// Santunan Donation (Incoming Funds)
export const fetchSantunanDonations = (params = {}) => axios.get(`${API_URL}/santunan-donations`, { params }).then(res => res.data);
export const createSantunanDonation = (data) => axios.post(`${API_URL}/santunan-donations`, data).then(res => res.data);
export const deleteSantunanDonation = (id) => axios.delete(`${API_URL}/santunan-donations/${id}`).then(res => res.data);

// Summary API
export const fetchSantunanSummary = (params = {}) => axios.get(`${API_URL}/santunan/summary`, { params }).then(res => res.data);
export const fetchSantunanActivities = () => axios.get(`${API_URL}/santunan/activities`).then(res => res.data);

// Master Data (Beneficiaries)
export const fetchBeneficiaries = (params) => axios.get(`${API_URL}/santunan/beneficiaries`, { params }).then(res => res.data);
export const createBeneficiary = (data) => axios.post(`${API_URL}/santunan/beneficiaries`, data);
export const updateBeneficiary = (id, data) => axios.put(`${API_URL}/santunan/beneficiaries/${id}`, data);
export const deleteBeneficiary = (id) => axios.delete(`${API_URL}/santunan/beneficiaries/${id}`);
