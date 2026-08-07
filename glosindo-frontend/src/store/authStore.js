import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * Login action — call API, store token + user
       */
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const data = await authService.login(credentials);
          if (data.token) {
            localStorage.setItem('token', data.token);
            if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          }

          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
          return { success: false, message };
        }
      },

      /**
       * Logout action — invalidate token, clear state
       */
      logout: async () => {
        try {
          await authService.logout();
        } catch (_) {
          // Clear local state even if server logout fails
        } finally {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ token: null, user: null, isAuthenticated: false });
        }
      },

      /**
       * Restore session on app load — verify token still valid
       */
      restoreSession: async () => {
        const { token } = get();
        const storedToken = token || localStorage.getItem('token');

        if (!storedToken) return;

        try {
          const data = await authService.me();
          set({ token: storedToken, user: data.user, isAuthenticated: true });
        } catch (_) {
          // Token invalid/expired — clear state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ token: null, user: null, isAuthenticated: false });
        }
      },

      /**
       * Check if user has a specific role
       */
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      /**
       * Check if user is admin
       */
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
    }),
    {
      name: 'glosindo-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
