import api from './api';

const gamesEventService = {
  // Game Events
  getAll: (params) => api.get('/games/events', { params }),
  getById: (id) => api.get(`/games/events/${id}`),
  create: (data) => api.post('/games/events', data),
  update: (id, data) => api.put(`/games/events/${id}`, data),
  delete: (id) => api.delete(`/games/events/${id}`),

  // Groups
  getGroups: (eventId) => api.get(`/games/events/${eventId}/groups`),
  createGroup: (eventId, data) => api.post(`/games/events/${eventId}/groups`, data),
  updateGroup: (eventId, groupId, data) => api.put(`/games/events/${eventId}/groups/${groupId}`, data),
  deleteGroup: (eventId, groupId) => api.delete(`/games/events/${eventId}/groups/${groupId}`),
  generateGroupQr: (eventId, groupId) => api.get(`/games/events/${eventId}/groups/${groupId}/qr`),
  getGroupParticipants: (eventId, groupId) => api.get(`/games/events/${eventId}/groups/${groupId}/participants`),

  // Point QR Codes
  getPointQrs: (eventId) => api.get(`/games/events/${eventId}/point-qr`),
  createPointQr: (eventId, data) => api.post(`/games/events/${eventId}/point-qr`, data),
  generatePointQr: (eventId, qrId) => api.get(`/games/events/${eventId}/point-qr/${qrId}/generate`),
  updatePointQrStatus: (eventId, qrId, data) => api.put(`/games/events/${eventId}/point-qr/${qrId}/status`, data),
  deletePointQr: (eventId, qrId) => api.delete(`/games/events/${eventId}/point-qr/${qrId}`),

  // Dashboard
  getStats: (eventId) => api.get(`/games/events/${eventId}/dashboard/stats`),
  getGroupRankings: (eventId) => api.get(`/games/events/${eventId}/dashboard/group-rankings`),
  getParticipantRankings: (eventId, params) => api.get(`/games/events/${eventId}/dashboard/participant-rankings`, { params }),
  getPointDistribution: (eventId) => api.get(`/games/events/${eventId}/dashboard/point-distribution`),
  getTransactions: (eventId, params) => api.get(`/games/events/${eventId}/transactions`, { params }),
  exportTransactions: (eventId) => api.get(`/games/events/${eventId}/transactions/export`),

  // Public (no auth)
  getGroupInfo: (token) => api.get(`/games/register/${token}`),
  register: (token, data) => api.post(`/games/register/${token}`, data),
  scanPoint: (data) => api.post('/games/scan-point', data),
};

export default gamesEventService;
