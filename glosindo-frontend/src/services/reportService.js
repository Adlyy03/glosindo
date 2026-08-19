import api from './api';

const reportService = {
  /**
   * Get statistics data for charts
   * @param {string} period - 'weekly' or 'monthly'
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   */
  getStatistics: async (period = 'weekly', startDate = null, endDate = null) => {
    const params = { period };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return api.get('/reports/statistics', { params });
  },

  /**
   * Export Excel report
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   */
  exportExcel: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    return api.get('/reports/export-excel', {
      params,
      responseType: 'blob',
    });
  },

  /**
   * Export PDF report
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   */
  exportPdf: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    return api.get('/reports/export-pdf', {
      params,
      responseType: 'blob',
    });
  },
};

export default reportService;
