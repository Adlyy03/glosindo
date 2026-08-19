import axios from 'axios';
import useAuthStore from '../store/authStore';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API RESPONSE:', {
      status: response.status,
      url: response.config?.url,
      data: response.data,
    });

    return response;
  },
  (error) => {
    console.error('❌ API ERROR:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      data: error.response?.data,
    });

    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      useAuthStore.getState().logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const publicPaths = [
        '/login',
        '/register',
        '/guest-register',
        '/registrasi-tamu',
        '/guest-registration'
      ];

      const isPublicPath = publicPaths.some(
        (p) => window.location.pathname.startsWith(p)
      );

      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Avoid redirect loop if the 401 error originated from the login endpoint
    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      useAuthStore.getState().logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const publicPaths = ['/login', '/register', '/guest-register', '/registrasi-tamu', '/guest-registration'];
      const isPublicPath = publicPaths.some((p) => window.location.pathname.startsWith(p));

      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
