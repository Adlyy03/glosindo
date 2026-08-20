import api from './api';

const eventService = {
  /**
   * Get all events with optional filters.
   */
  getAll: (params = {}) => api.get('/events', { params }),

  /**
   * Get events available for check-in.
   */
  getActive: () => api.get('/events/active'),

  /**
   * Get event by ID or code (includes statistics and participants).
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
   * Public: Get public event details for registration.
   */
  getPublicEvent: (code) => api.get(`/public/events/${code}`),

  /**
   * Public: Check face scan against database and check if already participant.
   */
  checkFace: (code, faceVector) =>
    api.post(`/public/events/${code}/check-face`, { face_vector: faceVector }),

  /**
   * Public: Submit public registration for event.
   */
  registerPublic: (code, data) => api.post(`/public/events/${code}/register`, data),

  /**
   * Get event participants.
   */
  getParticipants: (id, params = {}) => api.get(`/events/${id}/participants`, { params }),

  /**
   * Add participant manually to event.
   */
  storeParticipant: (id, data) => api.post(`/events/${id}/participants`, data),

  /**
   * Check in a participant.
   */
  checkInParticipant: (id, participantId) =>
    api.post(`/events/${id}/participants/${participantId}/check-in`),

  /**
   * Check out a participant.
   */
  checkOutParticipant: (id, participantId) =>
    api.post(`/events/${id}/participants/${participantId}/check-out`),

  /**
   * Remove a participant from event.
   */
  deleteParticipant: (id, participantId) =>
    api.delete(`/events/${id}/participants/${participantId}`),

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