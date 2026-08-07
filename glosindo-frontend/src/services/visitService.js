import api from './api';

const visitService = {
  /**
   * Get all visits
   * @param {Object} params - { search, start_date, end_date, status, page }
   */
  getAll: async (params = {}) => {
    const response = await api.get('/visits', { params });
    return response.data;
  },

  /**
   * Get active visits (status IN)
   */
  getActive: async () => {
    const response = await api.get('/visits/active');
    return response.data;
  },

  /**
   * Get visit history with pagination
   * @param {Object} params - { search, start_date, end_date, page }
   */
  getHistory: async (params = {}) => {
    const response = await api.get('/visits/history', { params });
    return response.data;
  },

  /**
   * Get visit by ID
   * @param {number} id
   */
  getById: async (id) => {
    const response = await api.get(`/visits/${id}`);
    return response.data;
  },

  /**
   * Create new visit (check-in)
   * @param {Object} data - { visitor_id, purpose, meet_to }
   */
  checkIn: async (data) => {
    const response = await api.post('/visits', data);
    return response.data;
  },

  /**
   * Check-out a visit
   * @param {number} id
   */
  checkOut: async (id) => {
    const response = await api.put(`/visits/${id}/checkout`);
    return response.data;
  },

  /**
   * Delete a visit (admin only)
   * @param {number} id
   */
  delete: async (id) => {
    const response = await api.delete(`/visits/${id}`);
    return response.data;
  },
};

export default visitService;
