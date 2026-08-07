import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

// Singleton state — models only load once across the entire app
let modelsLoadedGlobal = false;
let loadingPromise = null;

const useFaceModels = () => {
  const [modelsLoaded, setModelsLoaded] = useState(modelsLoadedGlobal);
  const [loading, setLoading] = useState(!modelsLoadedGlobal);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (modelsLoadedGlobal) {
      setModelsLoaded(true);
      setLoading(false);
      return;
    }

    // Reuse in-flight promise if already loading
    if (!loadingPromise) {
      loadingPromise = Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    }

    loadingPromise
      .then(() => {
        modelsLoadedGlobal = true;
        setModelsLoaded(true);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load face-api models:', err);
        setError('Model wajah gagal dimuat. Pastikan file model ada di folder /public/models/');
        setLoading(false);
        loadingPromise = null; // Reset so it can retry
      });
  }, []);

  return { modelsLoaded, loading, error };
};

export default useFaceModels;
