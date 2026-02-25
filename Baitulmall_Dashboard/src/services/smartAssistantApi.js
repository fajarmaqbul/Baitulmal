import api from './api';

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
