import api from './api';

const asnafAnalyticsApi = {
    getAnomalies: async () => {
        const response = await api.get('/asnaf/analytics/anomalies');
        return response.data;
    },

    getRtHeatmap: async () => {
        const response = await api.get('/asnaf/analytics/heatmap');
        return response.data;
    },

    getHadKifayah: async (baseKifayah = 1000000) => {
        const response = await api.get(`/asnaf/analytics/had-kifayah?base_kifayah=${baseKifayah}`);
        return response.data;
    },

    getProductiveCandidates: async () => {
        const response = await api.get('/asnaf/analytics/productive-candidates');
        return response.data;
    }
};

export default asnafAnalyticsApi;
