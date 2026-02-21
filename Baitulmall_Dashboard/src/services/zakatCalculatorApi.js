import api from './authApi';

export const fetchGoldPrice = async () => {
    try {
        const response = await api.get('/gold-price');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateGoldPrice = async (price) => {
    try {
        const response = await api.post('/gold-price', { price_per_gram: price });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const calculateZakat = async (type, data) => {
    try {
        const response = await api.post('/zakat-calculator/calculate', { zakat_type: type, data });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const saveCalculation = async (muzakiId, type, result, haulMet = true) => {
    try {
        const payload = {
            muzaki_id: muzakiId,
            zakat_type: type,
            result,
            haul_met: haulMet
        };
        const response = await api.post('/zakat-calculator/save', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const fetchCalculationHistory = async (muzakiId) => {
    try {
        const response = await api.get(`/zakat-calculator/history/${muzakiId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const exportCalculationHistory = async (muzakiId) => {
    try {
        const response = await api.get(`/zakat-calculator/export/${muzakiId}`, { responseType: 'blob' });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Riwayat_Zakat_${muzakiId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return true;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
