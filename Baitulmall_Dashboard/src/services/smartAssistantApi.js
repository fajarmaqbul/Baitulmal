import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Setup axios instance with auth (if you already have one in utils, import it instead)
// For now assuming we need to pass token if it's protected, 
// or relying on global axios config if set elsewhere.
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add interceptor to include token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const smartAssistantApi = {
    /**
     * Send a natural language query to the backend
     * @param {string} message 
     */
    chat: async (message) => {
        try {
            const response = await api.post('/ai/chat', { query: message });
            return response.data;
        } catch (error) {
            console.error("AI Chat Error:", error);
            throw error;
        }
    },

    /**
     * Generate a document based on template type
     * @param {string} type 
     * @param {object} data 
     */
    generateDocument: async (type, data = {}) => {
        try {
            const response = await api.post('/ai/generate-document', { type, data });
            return response.data;
        } catch (error) {
            console.error("Doc Gen Error:", error);
            throw error;
        }
    },

    /**
     * Generate event data (rundown, budget, checklist)
     * @param {string} type - 'rundown' | 'budget' | 'checklist' | 'description'
     * @param {object} eventData 
     */
    generateEventData: async (type, eventData = {}) => {
        try {
            const response = await api.post('/ai/event-generate', { type, data: eventData });
            return response.data;
        } catch (error) {
            console.error("Event Gen Error:", error);
            throw error;
        }
    }
};
