import api from './api';

export const fetchProducts = async (params) => {
    try {
        const response = await api.get('/products', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createProduct = async (formData) => {
    try {
        const response = await api.post('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateProduct = async (id, formData) => {
    try {
        // Method spoofing for Laravel if using FormData for update (PUT/PATCH often struggle with multipart)
        formData.append('_method', 'PUT');
        const response = await api.post(`/products/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
