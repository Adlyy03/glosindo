import { useEffect, useRef, useState } from 'react';
import WebcamCapture from './WebcamCapture';
import useFaceModels from '../hooks/useFaceModels';
import useFaceMatcher from '../hooks/useFaceMatcher';
import { descriptorToArray } from '../utils/faceUtils';

/**
 * FaceScanner — orchestrates face detection + matching
 * Props:
 *   onMatchFound(visitor)   — called when face matches existing visitor
 *   onNoMatch(descriptor)   — called when no match (new visitor), passes descriptor
 */
const FaceScanner = ({ onMatchFound, onNoMatch, reloadSignal }) => {
  const webcamRef = useRef(null);
  const { modelsLoaded, loading: modelsLoading, error: modelsError } = useFaceModels();
  const { loading: embeddingsLoading, matchFace, reload } = useFaceMatcher();
  const [result, setResult] = useState(null); // { type: 'match'|'no_match', data }
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (typeof reloadSignal === 'number' && reloadSignal > 0) {
      reload();
    }
  }, [reloadSignal]);

  const handleScan = async () => {
    setResult(null);
    const descriptor = await webcamRef.current?.captureDescriptor();
    if (!descriptor) return;

    const matched = matchFace(descriptor);

    if (matched) {
      setResult({ type: 'match', data: matched });
      onMatchFound?.(matched);
    } else {
      setResult({ type: 'no_match' });
      onNoMatch?.(descriptorToArray(descriptor));
    }
  };

  // Auto-scan every 5 seconds
  useEffect(() => {
    if (!modelsLoaded || embeddingsLoading) return;

    setScanning(true);
    const interval = setInterval(() => {
      handleScan();
    }, 5000);

    // First scan immediately
    handleScan();

    return () => {
      clearInterval(interval);
      setScanning(false);
    };
  }, [modelsLoaded, embeddingsLoading]);

  // Models loading state
  if (modelsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-blue-50/50 rounded-2xl border border-blue-100 min-h-[280px]">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
        <p className="text-gray-800 font-semibold text-sm">Memuat model pengenalan wajah...</p>
        <p className="text-gray-500 text-xs mt-1">Harap tunggu beberapa detik saat sistem menginisialisasi AI camera.</p>
      </div>
    );
  }

  // Models failed to load
  if (modelsError) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
        <svg className="w-10 h-10 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-700 font-semibold text-sm">{modelsError}</p>
        <p className="text-red-600 text-xs mt-1">Pastikan berkas model ada pada lokasi folder <code>/public/models/</code></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Webcam Stream */}
      <WebcamCapture
        ref={webcamRef}
        disabled={!modelsLoaded || embeddingsLoading}
        showButton={false}
      />

      {/* Auto-scan indicator */}
      {scanning && (
        <div className="max-w-sm mx-auto w-full text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-semibold text-blue-700">Auto-scan aktif (refresh 5s)</span>
          </div>
        </div>
      )}

      {/* Feedback Alerts */}
      {result?.type === 'match' && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-start gap-3 max-w-sm mx-auto w-full">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-green-800 font-semibold text-sm">Wajah Teridentifikasi!</p>
            <p className="text-green-700 text-xs mt-0.5">
              <span className="font-semibold">{result.data.name}</span>
              {result.data.company ? ` (${result.data.company})` : ''}
            </p>
          </div>
        </div>
      )}

      {result?.type === 'no_match' && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 max-w-sm mx-auto w-full">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <p className="text-amber-800 font-semibold text-sm">Wajah Belum Terdaftar</p>
            <p className="text-amber-700 text-xs mt-0.5">Silakan lengkapi formulir registrasi untuk mendaftarkan tamu baru.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceScanner;
