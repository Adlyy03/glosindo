import { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { ScanLine } from 'lucide-react';
import Button from './ui/Button';
import CameraPermissionAlert from './CameraPermissionAlert';

const WebcamCapture = forwardRef(({ onDescriptorCapture, disabled, showButton = true, silentMode = false, fullscreen = false, scanState = 'idle' }, ref) => {
  const webcamRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [isVideoLive, setIsVideoLive] = useState(false);
  const [constraintLevel, setConstraintLevel] = useState(0); // 0: 720p universal, 1: 720p, 2: 480p, 3: basic

  /**
   * Exposed to parent via ref — ZERO LOGIC CHANGES
   */
  useImperativeHandle(ref, () => ({
    captureDescriptor,
    getVideoElement: () => webcamRef.current?.video || null,
    getScreenshot: () => webcamRef.current?.getScreenshot() || null,
    isCameraReady: () => {
      const video = webcamRef.current?.video;
      return !!(isVideoLive && video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0);
    },
  }));

  // Resolusi 640x480 ideal: inisialisasi webcam super cepat (<300ms) & rendah beban CPU/GPU
  const getVideoConstraints = () => {
    switch (constraintLevel) {
      case 0:
        return { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } };
      case 1:
        return { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } };
      case 2:
        return { facingMode: 'user', width: 480, height: 360 };
      default:
        return { facingMode: 'user' };
    }
  };

  /**
   * Cek dukungan mediaDevices & perizinan saat inisialisasi
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Auto-redirect to HTTPS on camera view if accessed via insecure HTTP
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (window.location.protocol === 'http:' && !window.isSecureContext && !isLocal) {
      window.location.href = window.location.href.replace('http:', 'https:');
      return;
    }

    // 2. Cek ketersediaan mediaDevices
    const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    if (!hasMedia && !window.isSecureContext && !isLocal) {
      setError({
        type: 'insecure_origin',
        title: 'Koneksi Aman (HTTPS) Diperlukan',
        message: 'Browser memblokir kamera jika website dibuka melalui koneksi HTTP biasa. Harap beralih ke HTTPS agar kamera langsung aktif.',
        guide: [
          'Klik tombol "Buka via HTTPS (Kamera Langsung Aktif)" di bawah ini.',
          'Jika muncul peringatan sertifikat browser, klik "Lanjutan" (Advanced) lalu klik "Lanjutkan ke 103.134.221.200 (Proceed)".',
          'Klik "Izinkan" (Allow) pada popup permintaan izin kamera.'
        ]
      });
      return;
    }

    // 2. Query status perizinan kamera jika didukung
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' })
        .then((perm) => {
          if (perm.state === 'denied') {
            setError({
              type: 'permission_denied',
              title: 'Izin Akses Kamera Ditolak',
              message: 'Browser Anda memblokir akses kamera untuk situs ini. Mohon berikan izin di pengaturan browser.',
              guide: [
                'Klik ikon Gembok / Setelan Situs (🔒) di sebelah kiri bilah URL browser Anda.',
                'Ubah perizinan Kamera menjadi "Izinkan" (Allow).',
                'Klik tombol "Minta Izin Kamera Ulang" di bawah atau muat ulang halaman.'
              ]
            });
          }
          perm.onchange = () => {
            if (perm.state === 'granted') {
              setError(null);
            } else if (perm.state === 'denied') {
              setError({
                type: 'permission_denied',
                title: 'Izin Akses Kamera Ditolak',
                message: 'Akses kamera ditolak oleh pengaturan browser.',
                guide: [
                  'Klik ikon Gembok (🔒) di bilah URL browser, lalu ubah Kamera ke "Izinkan".'
                ]
              });
            }
          };
        })
        .catch(() => {
          // Permissions API { name: 'camera' } opsional / tidak didukung di sebagian browser
        });
    }
  }, []);

  /**
   * Handle error dari Webcam stream
   */
  const handleUserMediaError = useCallback((err) => {
    console.error('Webcam error:', err);
    const errName = err?.name || '';
    const errMsg = err?.message || String(err);

    if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
      setError({
        type: 'permission_denied',
        title: 'Akses Kamera Ditolak Browser',
        message: 'Akses kamera ditolak oleh browser. Silakan izinkan perizinan kamera pada browser Anda.',
        guide: [
          'Klik ikon Gembok / Pengaturan Situs (🔒) di sebelah kiri URL browser.',
          'Pilih opsi "Izinkan" (Allow) pada perizinan Kamera.',
          'Klik tombol "Minta Izin Kamera Ulang" atau segarkan halaman.'
        ]
      });
    } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
      setError({
        type: 'not_found',
        title: 'Kamera Tidak Ditemukan',
        message: 'Perangkat webcam tidak terdeteksi. Pastikan perangkat webcam terhubung dengan benar dan driver aktif.',
      });
    } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
      setError({
        type: 'in_use',
        title: 'Kamera Sedang Digunakan',
        message: 'Kamera sedang dipakai oleh aplikasi lain (seperti Zoom, Google Meet, Teams, atau tab browser lain). Harap tutup aplikasi tersebut lalu coba lagi.',
      });
    } else if (errName === 'OverconstrainedError') {
      // Otomatis turunkan constraint resolusi jika tidak didukung webcam
      setConstraintLevel((prev) => (prev < 3 ? prev + 1 : prev));
      setError(null);
    } else if (errMsg.includes('secure') || errMsg.includes('getUserMedia') || errMsg.includes('undefined')) {
      setError({
        type: 'insecure_origin',
        title: 'Akses Kamera Dibatasi (Koneksi HTTP)',
        message: 'Browser memblokir kamera karena website diakses via HTTP non-SSL.',
        guide: [
          'Buka tab baru: chrome://flags/#unsafely-treat-insecure-origin-as-secure',
          `Tambahkan URL: ${window.location.origin}`,
          'Ubah ke "Enabled" lalu klik "Relaunch" browser.'
        ]
      });
    } else {
      setError({
        type: 'general',
        title: 'Gagal Mengakses Kamera',
        message: 'Gagal mengakses kamera: ' + errMsg,
      });
    }
  }, []);

  /**
   * Permintaan izin kamera langsung dengan interaksi user
   */
  const handleRequestPermission = useCallback(async () => {
    setError(null);
    if (typeof window !== 'undefined' && window.location.protocol === 'http:' && !window.isSecureContext) {
      window.location.href = window.location.href.replace('http:', 'https:');
      return;
    }
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        // Lepas stream sementara agar react-webcam dapat mengambil alih
        stream.getTracks().forEach((track) => track.stop());
        setError(null);
      }
    } catch (err) {
      handleUserMediaError(err);
    }
  }, [handleUserMediaError]);

  /**
   * Cek timeout inisialisasi kamera (mencegah infinite loading)
   */
  useEffect(() => {
    if (isVideoLive || error) return;
    const timeout = setTimeout(() => {
      if (!isVideoLive && !error) {
        setError({
          type: 'timeout',
          title: 'Kamera Membutuhkan Waktu Terlalu Lama',
          message: 'Kamera belum aktif dalam 8 detik. Pastikan izin kamera telah diberikan dan webcam tidak sedang digunakan oleh aplikasi lain.',
          guide: [
            'Pastikan webcam terhubung dan tidak sedang dipakai Zoom/Meet.',
            'Klik tombol "Minta Izin Kamera Ulang" di bawah ini.',
          ],
        });
      }
    }, 8500);

    return () => clearTimeout(timeout);
  }, [isVideoLive, error]);

  /**
   * Pembersihan media stream saat unmount
   */
  useEffect(() => {
    return () => {
      try {
        const stream = webcamRef.current?.video?.srcObject;
        if (stream && stream.getTracks) {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch {
        // silent cleanup
      }
    };
  }, []);

  /**
   * Detect face on current video frame and return descriptor — High-Performance Mobile Biometrics
   */
  const captureDescriptor = async () => {
    const isAutoScan = silentMode || !showButton;
    if (!isAutoScan) setError(null);

    const video = webcamRef.current?.video;
    // Guard: video harus ready dan memiliki dimensi sebelum deteksi (tanpa spam error di auto-scan)
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      if (!isAutoScan && !video) {
        setError({
          type: 'general',
          title: 'Kamera Belum Siap',
          message: 'Kamera sedang dimuat, silakan tunggu sebentar lalu coba lagi.',
        });
      }
      return null;
    }

    if (!isAutoScan) {
      setScanning(true);
    }

    try {
      // Pastikan video aktif
      if (video.paused) {
        await video.play().catch(() => {});
      }

      // Direct video input with TinyFaceDetector: no intermediate 2D canvas copy overhead
      const tinyOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.35 });

      const result = await faceapi
        .detectSingleFace(video, tinyOptions)
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!result || !result.descriptor) {
        if (!isAutoScan) {
          setError({
            type: 'general',
            title: 'Wajah Belum Terdeteksi',
            message: 'Posisikan wajah tepat di tengah lingkaran dan pastikan pencahayaan cukup terang.',
          });
        }
        return null;
      }

      const descriptor = result.descriptor; // Float32Array[128]

      if (onDescriptorCapture) {
        onDescriptorCapture(descriptor);
      }

      return descriptor;
    } catch (err) {
      console.error('Face detection error:', err);
      if (!isAutoScan) {
        setError({
          type: 'general',
          title: 'Gagal Memindai Wajah',
          message: err.message,
        });
      }
      return null;
    } finally {
      if (!isAutoScan) {
        setScanning(false);
      }
    }
  };

  const selectPrimaryFace = (detections, video) => {
    if (!detections || detections.length === 0) return null;
    return detections[0]?.detection || detections[0];
  };

  const isRingActive = scanning || scanState === 'verifying' || scanState === 'matched';
  const isRingStandby = scanState === 'standby';

  return (
    <div className={`flex flex-col items-center w-full ${fullscreen ? 'h-full justify-center' : 'gap-4'}`}>
      {error ? (
        <CameraPermissionAlert
          error={error}
          onRetry={handleRequestPermission}
          fullscreen={fullscreen}
          className={fullscreen ? 'm-4' : 'w-full max-w-md'}
        />
      ) : (
        <div className={`relative overflow-hidden bg-slate-950 shadow-2xl group select-none ${
          fullscreen 
            ? 'w-full h-full border-0 rounded-none flex-1 min-h-0' 
            : 'rounded-3xl border-2 border-slate-800 bg-slate-950 w-full max-w-md aspect-4/3'
        }`}>
          {/* Live Video Feed */}
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={getVideoConstraints()}
            onUserMedia={() => {
              setIsVideoLive(true);
              setError(null);
            }}
            onPlaying={() => {
              setIsVideoLive(true);
              setError(null);
            }}
            onUserMediaError={handleUserMediaError}
            mirrored={true}
            className="w-full h-full object-cover"
          />

          {/* Camera Connecting Loading Screen */}
          {!isVideoLive && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-white z-10 gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-white/20 border-t-cyan-400 animate-spin" />
              <span className="text-xs font-semibold text-slate-300 tracking-wide">Menghubungkan Kamera...</span>
            </div>
          )}

          {/* Biometric Face Guide Overlay */}
          <div className={`absolute inset-0 pointer-events-none flex items-center justify-center ${
            fullscreen ? 'px-4 pt-16 pb-28 sm:pt-20 sm:pb-32' : 'p-4'
          }`}>
            {/* Dynamic Sized Face Guide: larger and proportional on desktop viewports */}
            <div
              className={`relative transition-all duration-300 flex items-center justify-center aspect-square ${
                fullscreen
                  ? 'w-[min(82vw,54vh,340px)] sm:w-[min(70vw,60vh,460px)] md:w-[min(62vw,64vh,520px)] lg:w-[min(56vw,66vh,580px)] xl:w-[min(52vw,68vh,600px)]'
                  : 'w-[min(65%,240px)]'
              }`}
            >
              {/* Solid Thin Elegant White Circle */}
              <div
                className={`absolute inset-0 rounded-full border-2 lg:border-[3px] transition-all duration-300 ${
                  isRingActive
                    ? 'border-cyan-400 shadow-[0_0_28px_rgba(6,182,212,0.6)] ring-4 ring-cyan-400/25 scale-[1.01]'
                    : isRingStandby
                    ? 'border-white/50 shadow-[0_0_14px_rgba(255,255,255,0.1)]'
                    : 'border-white/85 shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-pulse'
                }`}
              />

              {/* 4 Minimalist Rounded Framing Corners Outside Circle */}
              <div className={`absolute -top-3.5 -left-3.5 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-t-2 border-l-2 lg:border-t-[3px] lg:border-l-[3px] rounded-tl-xl transition-colors duration-300 ${
                isRingActive ? 'border-cyan-400/90' : isRingStandby ? 'border-white/35' : 'border-white/60'
              }`} />
              <div className={`absolute -top-3.5 -right-3.5 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-t-2 border-r-2 lg:border-t-[3px] lg:border-r-[3px] rounded-tr-xl transition-colors duration-300 ${
                isRingActive ? 'border-cyan-400/90' : isRingStandby ? 'border-white/35' : 'border-white/60'
              }`} />
              <div className={`absolute -bottom-3.5 -left-3.5 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-b-2 border-l-2 lg:border-b-[3px] lg:border-l-[3px] rounded-bl-xl transition-colors duration-300 ${
                isRingActive ? 'border-cyan-400/90' : isRingStandby ? 'border-white/35' : 'border-white/60'
              }`} />
              <div className={`absolute -bottom-3.5 -right-3.5 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-b-2 border-r-2 lg:border-b-[3px] lg:border-r-[3px] rounded-br-xl transition-colors duration-300 ${
                isRingActive ? 'border-cyan-400/90' : isRingStandby ? 'border-white/35' : 'border-white/60'
              }`} />
            </div>

            {/* Top Status Tag (Standard Non-Fullscreen Only) */}
            {!fullscreen && (
              <div className="absolute top-3 sm:top-4 inset-x-0 flex justify-center pt-[env(safe-area-inset-top,0px)] pointer-events-none">
                <div className="px-3 py-0.5 sm:py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live AI Biometric Kiosk</span>
                </div>
              </div>
            )}

            {/* Bottom Guidance Tag (Standard Non-Fullscreen Only) */}
            {!fullscreen && (
              <div className="absolute bottom-2.5 sm:bottom-3 inset-x-0 flex justify-center pb-[env(safe-area-inset-bottom,0px)] pointer-events-none">
                <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white/95 text-[10px] sm:text-xs font-medium tracking-wide shadow-md border border-white/10">
                  Posisikan wajah di dalam lingkaran
                </div>
              </div>
            )}
          </div>

          {/* Scanning Overlay Spinner (Manual click mode only) */}
          {scanning && showButton && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-10 transition-opacity">
              <div className="bg-white/95 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-2xl border border-slate-100">
                <div className="w-5 h-5 rounded-full border-2 border-brand-navy border-t-cyan-500 animate-spin" />
                <span className="text-xs font-bold text-slate-800 tracking-wide">Analisis Biometrik...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {showButton && !error && (
        <Button
          onClick={captureDescriptor}
          disabled={disabled || scanning}
          loading={scanning}
          variant="primary"
          size="lg"
          fullWidth
          className="max-w-md"
          icon={ScanLine}
        >
          {scanning ? 'Memindai Biometrik...' : 'Scan Wajah Tamu'}
        </Button>
      )}
    </div>
  );
});

WebcamCapture.displayName = 'WebcamCapture';

export default WebcamCapture;
