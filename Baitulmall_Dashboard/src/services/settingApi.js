import axios from 'axios';

/**
 * Settings API Service
 * Centralized service for application settings
 */

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

/**
 * Fetch all settings
 */
export const fetchSettings = async () => {
    try {
        const response = await api.get('/settings');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        throw error;
    }
};

/**
 * Create a new setting
 */
export const createSetting = async (data) => {
    try {
        const response = await api.post('/settings', data);
        return response.data;
    } catch (error) {
        console.error('Failed to create setting:', error);
        throw error;
    }
};

/**
 * Update an existing setting
 */
export const updateSetting = async (id, data) => {
    try {
        const response = await api.put(`/settings/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to update setting ID ${id}:`, error);
        throw error;
    }
};

/**
 * Delete a setting
 */
export const deleteSetting = async (id) => {
    try {
        const response = await api.delete(`/settings/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete setting ID ${id}:`, error);
        throw error;
    }
};

/**
 * Fetch a specific setting by key
 */
export const fetchSettingByKey = async (key) => {
    try {
        const data = await fetchSettings();
        // Handle if data is wrapped or direct array
        const list = Array.isArray(data) ? data : (data.data || []);
        return list.find(s => s.key_name === key);
    } catch (error) {
        console.error(`Failed to fetch setting key ${key}:`, error);
        return null; // Return null instead of throwing to prevent app crash on optional settings
    }
};

export default {
    fetchSettings,
    createSetting,
    updateSetting,
    deleteSetting
};
