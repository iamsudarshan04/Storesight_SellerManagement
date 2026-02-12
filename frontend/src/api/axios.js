import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Debug: Log the base URL being used
console.log('🔍 API Base URL:', import.meta.env.VITE_API_URL || '/api');
console.log('🔍 Environment:', import.meta.env.MODE);

// Add token to requests if available
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('📡 Making request to:', config.baseURL + config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('❌ API Error:', error.response?.status, error.response?.data);
        console.error('❌ Request URL:', error.config?.url);
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
