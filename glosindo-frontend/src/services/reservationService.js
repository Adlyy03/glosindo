import api from './api';

const reservationService = {
  /**
   * Get paginated list of invitation links (Admin/Staff)
   */
  getInvitations: async (params = {}) => {
    const response = await api.get('/reservations/invitations', { params });
    return response.data;
  },

  /**
   * Create a new personal or mass invitation link
   */
  createInvitation: async (data) => {
    const response = await api.post('/reservations/invitations', data);
    return response.data;
  },

  /**
   * Get invitation detail with registered guests
   */
  getInvitation: async (id) => {
    const response = await api.get(`/reservations/invitations/${id}`);
    return response.data;
  },

  /**
   * Update invitation link details
   */
  updateInvitation: async (id, data) => {
    const response = await api.put(`/reservations/invitations/${id}`, data);
    return response.data;
  },

  /**
   * Toggle active/inactive status of an invitation link
   */
  toggleInvitationStatus: async (id) => {
    const response = await api.put(`/reservations/invitations/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Soft-delete an invitation link
   */
  deleteInvitation: async (id) => {
    const response = await api.delete(`/reservations/invitations/${id}`);
    return response.data;
  },

  /**
   * Get summary dashboard statistics for reservations
   */
  getStats: async () => {
    const response = await api.get('/reservations/stats');
    return response.data;
  },

  /**
   * Get all reservations with filters and pagination
   */
  getReservations: async (params = {}) => {
    const response = await api.get('/reservations', { params });
    return response.data;
  },

  /**
   * Get single reservation detail
   */
  getReservation: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  /**
   * Cancel/delete a reservation
   */
  deleteReservation: async (id) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },

  /**
   * Public: validate token and get invitation info
   */
  getPublicInvitation: async (token) => {
    const response = await api.get(`/public/reservations/${token}`);
    return response.data;
  },

  /**
   * Public: check if face is duplicate before submit
   */
  checkPublicFace: async (token, faceVector) => {
    const response = await api.post(`/public/reservations/${token}/check-face`, {
      face_vector: faceVector,
    });
    return response.data;
  },

  /**
   * Public: submit form + biometric face template (Auto Approval)
   */
  submitPublicReservation: async (token, formData) => {
    const response = await api.post(`/public/reservations/${token}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Kiosk/Public: auto check-in by visitorId (from face match) or reservationCode
   */
  autoCheckIn: async (payload) => {
    const response = await api.post('/public/reservations/auto-checkin', payload);
    return response.data;
  },

  /**
   * Kiosk/Public: unified single-step face identification and auto check-in
   */
  scanIdentify: async (payload) => {
    const response = await api.post('/public/kiosk/scan-identify', payload);
    return response.data;
  },
};

export default reservationService;

