import api from './api';

const authService = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise}
   */
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  /**
   * Get current user
   * @returns {Promise}
   */
  me: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  /**
   * Refresh token
   * @returns {Promise}
   */
  refresh: async () => {
    const response = await api.post('/refresh');
    return response.data;
  },
};

export default authService;
