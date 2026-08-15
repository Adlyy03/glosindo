import api from './api';

const publicRegistrationService = {
  /**
   * Get current public registration enabled status (Public)
   * @returns {Promise<{success: boolean, enabled: boolean, message: string}>}
   */
  getStatus: async () => {
    const response = await api.get('/public-registration/status');
    return response.data;
  },

  /**
   * Register guest manually from public page (Public)
   * @param {FormData|Object} data
   * @returns {Promise}
   */
  register: async (data) => {
    const response = await api.post('/public-registration/register', data, {
      headers: data instanceof FormData ? { 'Content-Type': undefined } : {},
    });
    return response.data;
  },

  /**
   * Toggle public registration status (Admin & Receptionist only)
   * @param {boolean} enabled
   * @returns {Promise}
   */
  toggleStatus: async (enabled) => {
    const response = await api.post('/public-registration/toggle', { enabled });
    return response.data;
  },
};

export default publicRegistrationService;
