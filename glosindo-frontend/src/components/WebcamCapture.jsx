import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCw, AlertTriangle, ScanLine } from 'lucide-react';
import Button from './ui/Button';

const WebcamCapture = forwardRef(({ onDescriptorCapture, disabled, showButton = true, silentMode = false }, ref) => {
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Exposed to parent via ref — ZERO LOGIC CHANGES
   */
  useImperativeHandle(ref, () => ({
    captureDescriptor,
  }));

  /**
   * Detect face on current video frame and return descriptor — PRESERVED 100%
   */
  const captureDescriptor = async () => {
    if (!silentMode) setError(null);
    setScanning(true);

    try {
      const video = webcamRef.current?.video;
      if (!video) throw new Error('Kamera tidak siap / belum aktif');

      // Guard: video harus ready sebelum deteksi
      if (video.readyState < 2) {
        return null;
      }

      // Timeout 8 detik — cegah spinner hang selamanya
      const detectionPromise = faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceDescriptors();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Detection timeout')), 8000)
      );

      const detections = await Promise.race([detectionPromise, timeoutPromise]);

      if (!detections || detections.length === 0) {
        if (!silentMode) {
          setError('Wajah tidak terdeteksi. Posisikan wajah di tengah bingkai dan pastikan cahaya cukup.');
        }
        return null;
      }

      const selected = detections.length === 1 ? detections[0] : selectPrimaryFace(detections, video);
      const descriptor = selected.descriptor; // Float32Array[128]

      if (onDescriptorCapture) {
        onDescriptorCapture(descriptor);
      }

      return descriptor;
    } catch (err) {
      console.error('Face detection error:', err);
      if (!silentMode) {
        setError('Gagal memindai wajah: ' + err.message);
      }
      return null;
    } finally {
      setScanning(false);
    }
  };

  const handleUserMediaError = (err) => {
    console.error('Webcam error:', err);
    if (err.name === 'NotAllowedError') {
      setError('Akses kamera ditolak. Silakan izinkan perizinan kamera pada browser Anda.');
    } else if (err.name === 'NotFoundError') {
      setError('Kamera tidak ditemukan. Pastikan perangkat webcam terhubung dengan benar.');
    } else {
      setError('Gagal mengakses kamera: ' + err.message);
    }
  };

  const selectPrimaryFace = (detections, video) => {
    if (!detections || detections.length === 0) return null;

    const centerX = video.videoWidth / 2;
    const centerY = video.videoHeight / 2;

    return detections
      .map((detection) => {
        const box = detection.detection.box;
        const faceCenterX = box.x + box.width / 2;
        const faceCenterY = box.y + box.height / 2;
        const distanceToCenter = Math.hypot(faceCenterX - centerX, faceCenterY - centerY);
        const area = box.width * box.height;
        const score = distanceToCenter / Math.sqrt(area + 1);

        return { detection, score };
      })
      .sort((a, b) => a.score - b.score)[0]?.detection || detections[0];
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {error ? (
        <div className="w-full rounded-2xl bg-rose-50/90 border border-rose-200 p-6 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-rose-900 font-bold text-sm mb-1">Akses Kamera Bermasalah</p>
          <p className="text-rose-700 text-xs max-w-md mx-auto mb-4 leading-relaxed">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setError(null)}
            icon={RefreshCw}
          >
            Coba Kamera Lagi
          </Button>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-95 shadow-2xl w-full max-w-md aspect-4/3 group select-none">
          {/* Live Video Feed */}
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
            onUserMediaError={handleUserMediaError}
            mirrored={false}
            className="w-full h-full object-cover"
          />

          {/* Biometric Scanning Beam Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* HUD Corner Reticles */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-brand-cyan rounded-tl-lg shadow-sm" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-brand-cyan rounded-tr-lg shadow-sm" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-brand-cyan rounded-bl-lg shadow-sm" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-brand-cyan rounded-br-lg shadow-sm" />

            {/* Oval Face Guide Frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-44 h-56 border-2 border-dashed rounded-[50%] transition-colors duration-300 ${
                  scanning
                    ? 'border-brand-cyan shadow-[0_0_20px_rgba(14,165,233,0.5)]'
                    : 'border-white/60 shadow-inner'
                }`}
              />
            </div>

            {/* Animated Laser Scanning Line */}
            {scanning && (
              <div className="absolute left-8 right-8 h-1 bg-gradient-to-r from-transparent via-brand-cyan to-transparent animate-scan shadow-[0_0_12px_#0ea5e9]" />
            )}

            {/* Top Status Tag */}
            <div className="absolute top-4 inset-x-0 flex justify-center">
              <div className="px-3.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live AI Biometric Kiosk</span>
              </div>
            </div>
          </div>

          {/* Scanning Overlay Spinner */}
          {scanning && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-10 transition-opacity">
              <div className="bg-white/95 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-2xl border border-slate-100">
                <div className="w-5 h-5 rounded-full border-2 border-brand-navy border-t-brand-cyan animate-spin" />
                <span className="text-xs font-bold text-slate-800 tracking-wide">Analisis Biometrik...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {showButton && (
        <Button
          onClick={captureDescriptor}
          disabled={disabled || scanning || !!error}
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
