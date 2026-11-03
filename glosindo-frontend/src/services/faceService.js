import api from './api';

const faceService = {
  /**
   * Get all face embeddings (for client-side matching)
   */
  getAll: async () => {
    const response = await api.get('/face-embeddings');
    return response.data;
  },

  /**
   * Check if face matches an existing visitor via public endpoint (for kiosk)
   * @param {Array|Float32Array} faceVector - 128-dimension float array
   */
  checkPublicFace: async (faceVector) => {
    const vec = Array.isArray(faceVector) ? faceVector : Array.from(faceVector);
    // Round floats to 4 decimals to reduce payload size
    const compact = vec.map((v) => Math.round(v * 10000) / 10000);
    const response = await api.post('/public/check-face', {
      face_vector: compact,
    });
    return response.data;
  },

  /**
   * Check if face already registered (duplicate detection)
   * @param {Array} faceVector - 128-dimension float array
   */
  checkDuplicate: async (faceVector) => {
    const response = await api.post('/face-embeddings/check-duplicate', {
      face_vector: faceVector,
    });
    return response.data;
  },

  /**
   * Save face embedding for a visitor
   * @param {number} visitorId
   * @param {Array} faceVector - 128-dimension float array
   */
  save: async (visitorId, faceVector) => {
    const response = await api.post(`/visitors/${visitorId}/face-embedding`, {
      face_vector: faceVector,
    });
    return response.data;
  },

  /**
   * Compatibility alias used by the registration form.
   */
  saveEmbedding: async (visitorId, faceVector) => {
    return faceService.save(visitorId, faceVector);
  },

  /**
   * Delete face embedding for a visitor
   * @param {number} visitorId
   */
  delete: async (visitorId) => {
    const response = await api.delete(`/visitors/${visitorId}/face-embedding`);
    return response.data;
  },
};

export default faceService;
