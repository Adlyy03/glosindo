import api from './api';

const eventService = {
  /**
   * Get all events with optional filters.
   */
  getAll: (params = {}) => api.get('/events', { params }),

  /**
   * Get events available for check-in (today, status scheduled/ongoing).
   */
  getActive: () => api.get('/events/active'),

  /**
   * Get event by ID (includes statistics and participants).
   */
  getById: (id) => api.get(`/events/${id}`),

  /**
   * Create a new event.
   */
  create: (data) => api.post('/events', data),

  /**
   * Update an event.
   */
  update: (id, data) => api.put(`/events/${id}`, data),

  /**
   * Delete an event (soft delete).
   */
  delete: (id) => api.delete(`/events/${id}`),

  /**
   * Get event report statistics.
   */
  getReport: (params = {}) => api.get('/reports/events', { params }),

  /**
   * Export event report to Excel.
   */
  exportExcel: (params = {}) =>
    api.get('/reports/events/export-excel', {
      params,
      responseType: 'blob',
    }),

  /**
   * Export event report to PDF.
   */
  exportPdf: (params = {}) =>
    api.get('/reports/events/export-pdf', {
      params,
      responseType: 'blob',
    }),
};

export default eventService;