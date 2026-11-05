import { useEffect, useRef, useState, useCallback } from 'react';
import { Cpu, AlertCircle, CheckCircle2, UserX, Scan, RefreshCw, Loader2 } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import useFaceModels from '../hooks/useFaceModels';
import useFaceMatcher from '../hooks/useFaceMatcher';
import { descriptorToArray } from '../utils/faceUtils';
import Badge from './ui/Badge';

/**
 * FaceScanner — orchestrates high-performance face detection + matching
 * Props:
 *   onMatchFound(visitor)   — called when face matches existing visitor
 *   onNoMatch(descriptor)   — called when no match (new visitor), passes descriptor
 *   silentMode              — if true, no error alerts shown (for auto-scan mode)
 *   paused                  — if true, stop auto-scan (prevent spam during processing)
 *   fullscreen              — if true, full viewport mode (hide badges/alerts)
 */
const FaceScanner = ({ onMatchFound, onNoMatch, reloadSignal, silentMode = false, paused = false, fullscreen = false }) => {
  const webcamRef = useRef(null);
  const { modelsLoaded, loading: modelsLoading, error: modelsError } = useFaceModels();
  const { loading: embeddingsLoading, error: embeddingsError, matchFace, reload } = useFaceMatcher();
  const [result, setResult] = useState(null); // { type: 'match'|'no_match', data }
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // 'idle' | 'verifying' | 'matched' | 'no_match'

  const scanInProgress = useRef(false);
  const lastMatchedId = useRef(null);
  const lastMatchedTime = useRef(0);
  const noMatchStreak = useRef(0);

  useEffect(() => {
    if (typeof reloadSignal === 'number' && reloadSignal > 0) {
      reload();
    }
  }, [reloadSignal, reload]);

  const handleScan = useCallback(async () => {
    if (scanInProgress.current || paused || (typeof document !== 'undefined' && document.hidden)) {
      return;
    }

    scanInProgress.current = true;
    try {
      const descriptor = await webcamRef.current?.captureDescriptor();
      if (!descriptor) {
        // No face currently detected in front of the lens
        noMatchStreak.current = 0;
        setScanStatus('idle');
        return;
      }

      setScanStatus('verifying');
      const matched = await matchFace(descriptor);

      if (matched) {
        noMatchStreak.current = 0;
        const matchedId = matched.id || matched.visitor_id;
        const now = Date.now();

        // Hindari eksekusi berulang pada wajah & orang yang sama dalam rentang 3 detik
        if (lastMatchedId.current === matchedId && now - lastMatchedTime.current < 3000) {
          return;
        }

        lastMatchedId.current = matchedId;
        lastMatchedTime.current = now;
        setScanStatus('matched');
        setResult({ type: 'match', data: matched });
        const photo = webcamRef.current?.getScreenshot?.() || null;
        onMatchFound?.(matched, photo);
      } else {
        noMatchStreak.current += 1;
        // Stabilisasi konfirmasi: butuh minimal 2 frame berturut-turut untuk menyatakan 'Belum Terdaftar'
        // Ini mencegah salah deteksi akibat kedipan atau pergerakan wajah sementara
        if (noMatchStreak.current >= 2) {
          setScanStatus('no_match');
          setResult({ type: 'no_match' });
          const photo = webcamRef.current?.getScreenshot?.() || null;
          onNoMatch?.(descriptorToArray(descriptor), photo);
          noMatchStreak.current = 0;
        }
      }
    } catch (err) {
      console.warn('Face scan execution error:', err);
    } finally {
      scanInProgress.current = false;
    }
  }, [matchFace, onMatchFound, onNoMatch, paused]);

  // Auto-scan adaptif & hemat baterai (loop 300ms) — Pause saat tab tidak aktif
  useEffect(() => {
    if (!modelsLoaded || embeddingsLoading || paused) {
      setScanning(false);
      setScanStatus('idle');
      return;
    }

    setScanning(true);
    let isMounted = true;
    let timerId = null;

    const runScanLoop = async () => {
      if (!isMounted || paused || document.hidden) return;
      await handleScan();
      if (isMounted && !paused && !document.hidden) {
        timerId = setTimeout(runScanLoop, 300);
      }
    };

    // Deteksi pergantian tab browser (Page Visibility API)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timerId) clearTimeout(timerId);
      } else if (isMounted && !paused) {
        timerId = setTimeout(runScanLoop, 150);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Mulai scan pertama segera setelah stream siap
    timerId = setTimeout(runScanLoop, 200);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerId) clearTimeout(timerId);
      setScanning(false);
    };
  }, [modelsLoaded, embeddingsLoading, paused, handleScan]);

  // Models loading state
  if (modelsLoading) {
    if (fullscreen) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center select-none">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-8 h-8 animate-pulse text-cyan-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 animate-ping" />
          </div>
          <h3 className="text-white font-bold text-base mb-1">Inisialisasi Model AI Biometrik...</h3>
          <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
            Menyiapkan sistem pengenalan wajah. Kamera akan segera aktif.
          </p>
        </div>
      );
    }
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
    if (fullscreen) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center select-none">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-white font-bold text-base mb-1">Gagal Memuat Model Biometrik</h3>
          <p className="text-rose-300 text-xs max-w-sm mx-auto mb-3 leading-relaxed">{modelsError}</p>
        </div>
      );
    }
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
    <div className={`flex flex-col w-full ${fullscreen ? 'h-full min-h-0 relative' : 'gap-5'}`}>
      {/* Floating Status Indicator on Fullscreen Kiosk */}
      {fullscreen && scanStatus === 'verifying' && (
        <div className="absolute top-20 inset-x-0 z-40 flex justify-center pointer-events-none animate-fadeIn">
          <div className="px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/50 backdrop-blur-md flex items-center gap-2 shadow-xl">
            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span className="text-xs font-bold text-cyan-300 tracking-wide">Menganalisis Biometrik...</span>
          </div>
        </div>
      )}

      {/* Webcam Stream */}
      <div className={fullscreen ? 'flex-1 w-full h-full min-h-0' : ''}>
        <WebcamCapture
          ref={webcamRef}
          disabled={!modelsLoaded || embeddingsLoading}
          showButton={false}
          silentMode={silentMode}
          fullscreen={fullscreen}
        />
      </div>

      {/* Badges/alerts in non-fullscreen mode */}
      {!fullscreen && (
        <>
          {/* Embeddings Error Warning */}
          {embeddingsError && (
            <div className="max-w-md mx-auto w-full p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{embeddingsError}</span>
              </div>
              <button
                type="button"
                onClick={reload}
                className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold text-[11px] flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Muat Ulang
              </button>
            </div>
          )}

          {/* Auto-scan status indicator */}
          {scanning && (
            <div className="max-w-md mx-auto w-full text-center">
              <Badge variant={scanStatus === 'verifying' ? 'cyan' : 'gray'} dot className="shadow-xs py-1.5 px-4 transition-all">
                {scanStatus === 'verifying' ? 'Memverifikasi Wajah...' : 'Auto-Scan Aktif'}
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
        </>
      )}
    </div>
  );
};

export default FaceScanner;
