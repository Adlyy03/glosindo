import axios from 'axios';
import useAuthStore from '../store/authStore';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Read token directly from Zustand store or localStorage fallback
    const storeToken = useAuthStore.getState().token;
    const localToken = localStorage.getItem('token');
    const token = storeToken || localToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
