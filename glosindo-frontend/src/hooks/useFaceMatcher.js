import { useState, useEffect, useRef } from 'react';
import faceService from '../services/faceService';
import { findBestMatch } from '../utils/faceUtils';

const useFaceMatcher = () => {
  const [embeddings, setEmbeddings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Cache ref — data persists while hook is mounted
  const cachedRef = useRef(false);

  useEffect(() => {
    if (cachedRef.current) return;

    const loadEmbeddings = async () => {
      setLoading(true);
      try {
        const data = await faceService.getAll();
        setEmbeddings(data.data || []);
        cachedRef.current = true;
      } catch (err) {
        setError('Gagal memuat data wajah dari server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEmbeddings();
  }, []);

  /**
   * Match a live descriptor against stored embeddings
   * @param {Float32Array} liveDescriptor - 128-dimension descriptor from face-api
   * @returns {Object|null} matched visitor or null
   */
  const matchFace = (liveDescriptor) => {
    if (!liveDescriptor || embeddings.length === 0) return null;

    const threshold = parseFloat(
      import.meta.env.VITE_FACE_MATCH_THRESHOLD || '0.7'
    );

    return findBestMatch(Array.from(liveDescriptor), embeddings, threshold);
  };

  /**
   * Reload embeddings (e.g., after new visitor registered)
   */
  const reload = async () => {
    cachedRef.current = false;
    setLoading(true);
    try {
      const data = await faceService.getAll();
      setEmbeddings(data.data || []);
      cachedRef.current = true;
    } catch (err) {
      setError('Gagal memuat ulang data wajah');
    } finally {
      setLoading(false);
    }
  };

  return { embeddings, loading, error, matchFace, reload };
};

export default useFaceMatcher;
