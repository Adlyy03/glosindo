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
          
          set({
            token: data.token || null,
            user: data.user || null,
            isAuthenticated: !!data.token,
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
        const storedToken = localStorage.getItem('token');

        if (!storedToken) {
          set({ token: null, user: null, isAuthenticated: false });
          return;
        }

        try {
          const data = await authService.me();
          set({ token: storedToken, user: data.user, isAuthenticated: true });
        } catch (_) {
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

      /**
       * Check if feature disabled for current user
       */
      isFeatureDisabled: (featureId) => {
        const { user } = get();
        const disabled = user?.disabled_features || [];
        return disabled.includes(featureId);
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
