import { useState, useEffect } from 'react';
import faceService from '../services/faceService';
import { findBestMatch } from '../utils/faceUtils';

// Helper to pre-parse vector into Float32Array once
const prepareEmbeddings = (rawList) => {
  return (rawList || []).map((entry) => {
    let vec = entry.face_vector;
    if (typeof vec === 'string') {
      try {
        vec = JSON.parse(vec);
      } catch {
        vec = null;
      }
    }
    return {
      ...entry,
      _parsedVector: vec && (Array.isArray(vec) || vec instanceof Float32Array) ? new Float32Array(vec) : null,
    };
  }).filter((e) => e._parsedVector !== null);
};

// Global cache with auto-expiration (30 seconds)
let globalEmbeddingsCache = null;
let globalLoadingPromise = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 30000; // 30 seconds auto-refresh

export const clearEmbeddingsCache = () => {
  globalEmbeddingsCache = null;
  globalLoadingPromise = null;
  lastFetchTimestamp = 0;
};

const useFaceMatcher = () => {
  const isCacheValid = globalEmbeddingsCache && (Date.now() - lastFetchTimestamp < CACHE_TTL_MS);
  const [embeddings, setEmbeddings] = useState(isCacheValid ? globalEmbeddingsCache : []);
  const [loading, setLoading] = useState(!isCacheValid);
  const [error, setError] = useState(null);

  useEffect(() => {
    const valid = globalEmbeddingsCache && (Date.now() - lastFetchTimestamp < CACHE_TTL_MS);
    if (valid) {
      setEmbeddings(globalEmbeddingsCache);
      setLoading(false);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    faceService.getAll()
      .then((data) => {
        const prepared = prepareEmbeddings(data.data || []);
        globalEmbeddingsCache = prepared;
        lastFetchTimestamp = Date.now();
        setEmbeddings(prepared);
        setLoading(false);
      })
      .catch((err) => {
        setError('Gagal memuat data biometrik wajah');
        console.error(err);
        setLoading(false);
      });
  }, []);

  /**
   * Match a live descriptor against stored embeddings (in-memory for staff, API for kiosk)
   * @param {Float32Array|Array<number>} liveDescriptor - 128-dimension descriptor from face-api
   * @returns {Promise<Object|null>} matched visitor or null
   */
  const matchFace = async (liveDescriptor) => {
    if (!liveDescriptor) return null;

    const threshold = Number(import.meta.env.VITE_FACE_MATCH_THRESHOLD || 0.45);

    // 1. In-memory instant match (jika embeddings sudah dimuat di browser memory)
    if (embeddings.length > 0) {
      return findBestMatch(liveDescriptor, embeddings, threshold);
    }

    // 2. Jika running di Kiosk Publik (tanpa login admin), verifikasi aman via server endpoint
    try {
      const res = await faceService.checkPublicFace(liveDescriptor);
      if (res && res.matched && res.visitor) {
        return {
          id: res.visitor.id || res.visitor.visitor_id,
          name: res.visitor.name,
          company: res.visitor.company,
          phone: res.visitor.phone,
          distance: res.distance || 0,
        };
      }
      return null;
    } catch (err) {
      console.warn('publicCheckFace request failed:', err.message);
      return null;
    }
  };

  /**
   * Reload embeddings (e.g., after visitor registered or deleted)
   */
  const reload = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await faceService.getAll();
      const prepared = prepareEmbeddings(data.data || []);
      globalEmbeddingsCache = prepared;
      lastFetchTimestamp = Date.now();
      setEmbeddings(prepared);
    } catch (err) {
      setError('Gagal memuat ulang data wajah');
    } finally {
      setLoading(false);
    }
  };

  return { embeddings, loading, error, matchFace, reload };
};

export default useFaceMatcher;
