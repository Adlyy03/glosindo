/**
 * High-performance Face Recognition Vector Mathematics & Match Utilities
 */

/**
 * Calculate Euclidean distance between two 128-D face vectors
 * @param {Array<number>|Float32Array} vecA
 * @param {Array<number>|Float32Array} vecB
 * @returns {number}
 */
export function euclideanDistance(vecA, vecB) {
  let sum = 0;
  const len = Math.min(vecA.length, vecB.length);
  let i = 0;
  // Loop unrolling by 4 for SIMD/JIT optimization
  for (; i <= len - 4; i += 4) {
    const d0 = vecA[i] - vecB[i];
    const d1 = vecA[i + 1] - vecB[i + 1];
    const d2 = vecA[i + 2] - vecB[i + 2];
    const d3 = vecA[i + 3] - vecB[i + 3];
    sum += d0 * d0 + d1 * d1 + d2 * d2 + d3 * d3;
  }
  for (; i < len; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Find best matching visitor from stored embeddings with early-exit squared Euclidean distance
 * @param {Array<number>|Float32Array} liveDescriptor - extracted from webcam
 * @param {Array<{visitor_id, name, company, face_vector, _parsedVector}>} storedEmbeddings
 * @param {number} threshold - max distance to consider a match (default 0.45)
 * @returns {Object|null} matched visitor entry or null
 */
export function findBestMatch(liveDescriptor, storedEmbeddings, threshold = 0.45) {
  if (!liveDescriptor || !storedEmbeddings?.length) return null;

  const thresholdSq = threshold * threshold;
  let best = { visitor: null, distanceSq: thresholdSq };
  const len = liveDescriptor.length;

  for (let e = 0; e < storedEmbeddings.length; e++) {
    const entry = storedEmbeddings[e];
    const vec = entry._parsedVector || (
      typeof entry.face_vector === 'string'
        ? JSON.parse(entry.face_vector)
        : entry.face_vector
    );

    if (!vec || vec.length !== len) continue;

    let sum = 0;
    let i = 0;

    // Loop unrolled by 4 with early exit
    for (; i <= len - 4; i += 4) {
      const d0 = liveDescriptor[i] - vec[i];
      const d1 = liveDescriptor[i + 1] - vec[i + 1];
      const d2 = liveDescriptor[i + 2] - vec[i + 2];
      const d3 = liveDescriptor[i + 3] - vec[i + 3];
      sum += d0 * d0 + d1 * d1 + d2 * d2 + d3 * d3;
      if (sum >= best.distanceSq) break;
    }

    if (sum < best.distanceSq) {
      for (; i < len; i++) {
        const diff = liveDescriptor[i] - vec[i];
        sum += diff * diff;
        if (sum >= best.distanceSq) break;
      }
    }

    if (sum < best.distanceSq) {
      best = {
        visitor: {
          ...entry,
          id: entry.id || entry.visitor_id,
          visitor_id: entry.visitor_id || entry.id,
          distance: Math.round(Math.sqrt(sum) * 1000) / 1000,
        },
        distanceSq: sum,
      };
    }
  }

  return best.visitor;
}

/**
 * Convert Float32Array descriptor to plain Array for JSON serialization (rounded to 4 decimals)
 * @param {Float32Array|Array<number>} descriptor
 * @returns {Array<number>}
 */
export function descriptorToArray(descriptor) {
  if (!descriptor) return [];
  const arr = Array.isArray(descriptor) ? descriptor : Array.from(descriptor);
  return arr.map((v) => Math.round(v * 10000) / 10000);
}
