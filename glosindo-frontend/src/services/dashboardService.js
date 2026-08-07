import api from './api';

const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  /**
   * Get visit trends (last 7 days)
   */
  getVisitTrends: async () => {
    const response = await api.get('/dashboard/visit-trends');
    return response.data;
  },

  /**
   * Get monthly trends (last 6 months)
   */
  getMonthlyTrends: async () => {
    const response = await api.get('/dashboard/monthly-trends');
    return response.data;
  },

  /**
   * Get top visitors
   * @param {number} limit
   */
  getTopVisitors: async (limit = 10) => {
    const response = await api.get('/dashboard/top-visitors', { params: { limit } });
    return response.data;
  },
};

export default dashboardService;
