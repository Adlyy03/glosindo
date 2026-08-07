import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const WebcamCapture = forwardRef(({ onDescriptorCapture, disabled, showButton = true }, ref) => {
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Exposed to parent via ref
   */
  useImperativeHandle(ref, () => ({
    captureDescriptor,
  }));

  /**
   * Detect face on current video frame and return descriptor
   */
  const captureDescriptor = async () => {
    setError(null);
    setScanning(true);

    try {
      const video = webcamRef.current?.video;
      if (!video) throw new Error('Webcam tidak tersedia');

      const detection = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('Wajah tidak terdeteksi. Pastikan wajah berada di tengah dan pencahayaan cukup.');
        return null;
      }

      const descriptor = detection.descriptor; // Float32Array[128]

      if (onDescriptorCapture) {
        onDescriptorCapture(descriptor);
      }

      return descriptor;
    } catch (err) {
      console.error('Face detection error:', err);
      setError('Gagal mendeteksi wajah: ' + err.message);
      return null;
    } finally {
      setScanning(false);
    }
  };

  const handleUserMediaError = (err) => {
    console.error('Webcam error:', err);
    if (err.name === 'NotAllowedError') {
      setError('Akses kamera ditolak. Silakan izinkan akses kamera di browser Anda.');
    } else if (err.name === 'NotFoundError') {
      setError('Kamera tidak ditemukan. Pastikan perangkat kamera terhubung.');
    } else {
      setError('Gagal mengakses kamera: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {error ? (
        <div className="w-full rounded-xl bg-red-50 border border-red-200 p-4 text-center">
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline font-semibold"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border-2 border-blue-100 bg-gray-900 shadow-md w-full max-w-sm aspect-video">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
            onUserMediaError={handleUserMediaError}
            className="w-full h-full object-cover"
          />

          {/* Scanning overlay */}
          {scanning && (
            <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-xs flex items-center justify-center">
              <div className="bg-white/95 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
                <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm font-semibold text-blue-800">Mendeteksi wajah...</span>
              </div>
            </div>
          )}

          {/* Face guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-36 h-44 border-2 border-dashed border-white/70 rounded-full shadow-inner" />
          </div>
        </div>
      )}

      {showButton && (
        <button
          onClick={captureDescriptor}
          disabled={disabled || scanning || !!error}
          className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
            text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {scanning ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memindai...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Scan Wajah
            </>
          )}
        </button>
      )}
    </div>
  );
});

WebcamCapture.displayName = 'WebcamCapture';

export default WebcamCapture;
