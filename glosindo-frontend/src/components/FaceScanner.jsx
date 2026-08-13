import { useEffect, useRef, useState } from 'react';
import { Cpu, AlertCircle, CheckCircle2, UserX, Scan, RefreshCw } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import useFaceModels from '../hooks/useFaceModels';
import useFaceMatcher from '../hooks/useFaceMatcher';
import { descriptorToArray } from '../utils/faceUtils';
import Badge from './ui/Badge';

/**
 * FaceScanner — orchestrates face detection + matching
 * Props:
 *   onMatchFound(visitor)   — called when face matches existing visitor
 *   onNoMatch(descriptor)   — called when no match (new visitor), passes descriptor
 *   silentMode              — if true, no error alerts shown (for auto-scan mode)
 */
const FaceScanner = ({ onMatchFound, onNoMatch, reloadSignal, silentMode = false }) => {
  const webcamRef = useRef(null);
  const { modelsLoaded, loading: modelsLoading, error: modelsError } = useFaceModels();
  const { loading: embeddingsLoading, matchFace, reload } = useFaceMatcher();
  const [result, setResult] = useState(null); // { type: 'match'|'no_match', data }
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (typeof reloadSignal === 'number' && reloadSignal > 0) {
      reload();
    }
  }, [reloadSignal, reload]);

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

  // Auto-scan every 5 seconds — LOGIC PRESERVED 100%
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
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50/80 rounded-3xl border border-slate-200 min-h-[320px] text-center shadow-xs">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center text-brand-navy">
            <Cpu className="w-8 h-8 animate-pulse text-brand-cyan" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-cyan border-2 border-white animate-ping" />
        </div>
        <h3 className="text-slate-900 font-bold text-base mb-1">Inisialisasi Model AI Biometrik...</h3>
        <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
          Mengunggah bobot deteksi wajah face-api.js. Harap tunggu beberapa detik.
        </p>
      </div>
    );
  }

  // Models failed to load
  if (modelsError) {
    return (
      <div className="rounded-3xl bg-rose-50 border border-rose-200 p-6 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-rose-900 font-bold text-base mb-1">Gagal Memuat Model Biometrik</h3>
        <p className="text-rose-700 text-xs max-w-md mx-auto mb-3 leading-relaxed">{modelsError}</p>
        <p className="text-[11px] text-rose-500 bg-white/80 py-1.5 px-3 rounded-lg inline-block border border-rose-200">
          Pastikan berkas model tersedia di folder <code>/public/models/</code>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Webcam Stream */}
      <WebcamCapture
        ref={webcamRef}
        disabled={!modelsLoaded || embeddingsLoading}
        showButton={false}
        silentMode={silentMode}
      />

      {/* Auto-scan status indicator */}
      {scanning && (
        <div className="max-w-md mx-auto w-full text-center">
          <Badge variant="cyan" dot className="shadow-xs py-1.5 px-4">
            Auto-Scan Aktif (Refresh 5s)
          </Badge>
        </div>
      )}

      {/* Feedback Alerts */}
      {result?.type === 'match' && (
        <div className="rounded-2xl bg-emerald-50/90 border border-emerald-200 p-4 flex items-start gap-3.5 max-w-md mx-auto w-full shadow-md animate-scaleIn">
          <div className="p-2 rounded-xl bg-emerald-500 text-white flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Teridentifikasi
            </span>
            <h4 className="text-emerald-950 font-bold text-base mt-1 leading-tight">
              {result.data.name}
            </h4>
            <p className="text-emerald-700 text-xs font-medium mt-0.5">
              {result.data.company ? `Instansi: ${result.data.company}` : 'Tamu Terdaftar'}
            </p>
          </div>
        </div>
      )}

      {result?.type === 'no_match' && (
        <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-4 flex items-start gap-3.5 max-w-md mx-auto w-full shadow-md animate-scaleIn">
          <div className="p-2 rounded-xl bg-amber-500 text-white flex-shrink-0 mt-0.5">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              Belum Terdaftar
            </span>
            <h4 className="text-amber-950 font-bold text-sm mt-1 leading-tight">
              Wajah Tidak Dikenali Sistem
            </h4>
            <p className="text-amber-700 text-xs mt-0.5">
              Silakan mendaftar via formulir registrasi tamu baru.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceScanner;
