import axios from 'axios';
import useAuthStore from '../store/authStore';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // When served over HTTPS, route through the relative '/api' reverse proxy
    // to prevent Mixed Content errors (browser blocking HTTP requests from HTTPS).
    if (window.location.protocol === 'https:') {
      return '/api';
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStorageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return `/storage/${path.replace(/^\/?storage\//, '')}`;
  }
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
  return `${base}/storage/${path.replace(/^\/?storage\//, '')}`;
};

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

// Response interceptor to handle errors & session expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/login') || url.includes('/logout');

    // Avoid infinite redirect loop if 401 originated from login or logout endpoint
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Clear auth locally WITHOUT calling remote logout (calling API logout when 401 causes infinite loop)
      const authStore = useAuthStore.getState();
      if (typeof authStore.clearAuth === 'function') {
        authStore.clearAuth();
      } else {
        useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      const publicPaths = [
        '/',
        '/beranda',
        '/home',
        '/login',
        '/register',
        '/guest-register',
        '/guest/register',
        '/registrasi-tamu',
        '/guest-registration',
        '/event/',
        '/events/',
        '/games/'
      ];

      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isPublicPath =
        currentPath === '/' ||
        currentPath === '/beranda' ||
        currentPath === '/home' ||
        publicPaths.some((p) => p !== '/' && currentPath.startsWith(p));

      if (!isPublicPath && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
