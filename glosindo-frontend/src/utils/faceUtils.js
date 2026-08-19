/**
 * Calculate Euclidean distance between two 128-D face vectors
 * @param {Array<number>} vecA
 * @param {Array<number>} vecB
 * @returns {number}
 */
export function euclideanDistance(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error(`Vector length mismatch: ${vecA.length} vs ${vecB.length}`);
  }
  return Math.sqrt(
    vecA.reduce((sum, val, i) => sum + Math.pow(val - vecB[i], 2), 0)
  );
}

/**
 * Find best matching visitor from stored embeddings
 * @param {Array<number>} liveDescriptor - extracted from webcam
 * @param {Array<{visitor_id, name, company, face_vector}>} storedEmbeddings
 * @param {number} threshold - max distance to consider a match (default 0.5)
 * @returns {Object|null} matched visitor entry or null
 */
export function findBestMatch(liveDescriptor, storedEmbeddings, threshold = 0.5) {
  if (!liveDescriptor || !storedEmbeddings?.length) return null;

  let best = { visitor: null, distance: Infinity };

  for (const entry of storedEmbeddings) {
    try {
      // face_vector may be stored as JSON string — parse if needed
      const faceVector = typeof entry.face_vector === 'string'
        ? JSON.parse(entry.face_vector)
        : entry.face_vector;

      if (!Array.isArray(faceVector) || faceVector.length !== liveDescriptor.length) continue;

      const dist = euclideanDistance(liveDescriptor, faceVector);
      if (dist < best.distance) {
        best = { visitor: entry, distance: dist };
      }
    } catch (_) {
      // Skip malformed entries
      continue;
    }
  }

  return best.distance <= threshold ? best.visitor : null;
}

/**
 * Convert Float32Array descriptor to plain Array for JSON serialization
 * @param {Float32Array} descriptor
 * @returns {Array<number>}
 */
export function descriptorToArray(descriptor) {
  return Array.from(descriptor);
}
