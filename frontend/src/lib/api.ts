import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Attach bearer token automatically if it exists in local storage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('airlink_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Catch 401 errors globally and clear session/redirect to login
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('airlink_token');
        localStorage.removeItem('airlink_user');
        if (!window.location.pathname.endsWith('/login')) {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

export default api;
