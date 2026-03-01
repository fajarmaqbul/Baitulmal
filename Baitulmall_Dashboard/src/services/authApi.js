import api from './api';


export const login = async (email, password) => {
    try {
        const response = await api.post('/login', { email, password });
        if (response.data.success || response.data.access_token) {
            const token = response.data.access_token || response.data.token;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(response.data.user || response.data.data));
        }

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/621e1365-05bc-449d-a714-261349822a08', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'debug-session',
                runId: 'auth-run-1',
                hypothesisId: 'H1-H4',
                location: 'authApi.login:response',
                message: 'Login API response shape',
                data: {
                    has_success_flag: typeof response.data.success !== 'undefined',
                    has_access_token: typeof response.data.access_token !== 'undefined' || typeof response.data.token !== 'undefined',
                    has_user_root: typeof response.data.user !== 'undefined',
                    has_user_under_data: typeof response.data.data !== 'undefined',
                },
                timestamp: Date.now(),
            }),
        }).catch(() => { });
        // #endregion

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const logout = async () => {
    try {
        await api.post('/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};

export const getUser = async () => {
    try {
        const response = await api.get('/user');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const resetPassword = async (data) => {
    try {
        const response = await api.post('/reset-password', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default api;
