import api from './api';

const visitorService = {
  /**
   * Get all visitors
   * @param {Object} params - { search, page }
   * @returns {Promise}
   */
  getAll: async (params = {}) => {
    const response = await api.get('/visitors', { params });
    return response.data;
  },

  /**
   * Get visitor by ID
   * @param {number} id
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await api.get(`/visitors/${id}`);
    return response.data;
  },

  /**
   * Create new visitor
   * @param {FormData|Object} data
   * @returns {Promise}
   */
  create: async (data) => {
    const response = await api.post('/visitors', data);
    return response.data;
  },

  /**
   * Update visitor
   * @param {number} id
   * @param {FormData|Object} data
   * @returns {Promise}
   */
  update: async (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const response = await api.post(`/visitors/${id}`, data);
      return response.data;
    } else {
      const response = await api.put(`/visitors/${id}`, data);
      return response.data;
    }
  },

  /**
   * Delete visitor
   * @param {number} id
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await api.delete(`/visitors/${id}`);
    return response.data;
  },
};

export default visitorService;
