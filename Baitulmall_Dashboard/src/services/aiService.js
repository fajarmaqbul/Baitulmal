// Artificial Intelligence Service for Event Management
// Connects to Backend "Smart Logic" for generating event details
import { smartAssistantApi } from './smartAssistantApi';

/**
 * Generates a rundown based on event details via Backend API.
 */
export const generateRundown = async (eventData) => {
    try {
        console.log("Requesting Rundown AI for:", eventData.title);
        const result = await smartAssistantApi.generateEventData('rundown', eventData);
        return result;
    } catch (error) {
        console.error("AI Service Error (Rundown):", error);
        throw error;
    }
};

/**
 * Generates a budget estimation based on event details via Backend API.
 */
export const generateBudget = async (eventData) => {
    try {
        console.log("Requesting Budget AI for:", eventData.title);
        const result = await smartAssistantApi.generateEventData('budget', eventData);
        return result.items || []; // Ensure it returns the items array
    } catch (error) {
        console.error("AI Service Error (Budget):", error);
        throw error;
    }
};

/**
 * Generates a preparation checklist based on event details via Backend API.
 */
export const generateChecklist = async (eventData) => {
    try {
        console.log("Requesting Checklist AI for:", eventData.title);
        const result = await smartAssistantApi.generateEventData('checklist', eventData);
        return result;
    } catch (error) {
        console.error("AI Service Error (Checklist):", error);
        throw error;
    }
};

/**
 * Generates an event description based on event details via Backend API.
 */
export const generateDescription = async (eventData) => {
    try {
        console.log("Requesting Description AI for:", eventData.title);
        const result = await smartAssistantApi.generateEventData('description', eventData);
        return result;
    } catch (error) {
        console.error("AI Service Error (Description):", error);
        throw error;
    }
};
