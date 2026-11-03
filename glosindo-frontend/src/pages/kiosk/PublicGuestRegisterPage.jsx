import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CheckCircle2,
  Lock,
  RefreshCw,
  Upload,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import publicRegistrationService from '../../services/publicRegistrationService';
import { LOGO, APP_NAME } from '../../constants';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import CameraPermissionAlert from '../../components/CameraPermissionAlert';

const PublicGuestRegisterPage = () => {
  // Page states
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [purpose, setPurpose] = useState('');
  const [meetTo, setMeetTo] = useState('');

  // Photo & Face states
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [faceVector, setFaceVector] = useState(null);
  const [faceScanSuccess, setFaceScanSuccess] = useState(false);
  const [scanningFace, setScanningFace] = useState(false);

  // Submission & Success states
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const webcamRef = useRef(null);

  // 1. Check if public registration is enabled
  const fetchStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await publicRegistrationService.getStatus();
      setIsEnabled(res.enabled);
      setStatusMessage(res.message || '');
    } catch (err) {
      console.error('Failed to get public registration status:', err);
      // Fallback
      setIsEnabled(false);
      setStatusMessage('Gagal menghubungi server untuk memverifikasi status pendaftaran.');
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Handle Photo file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setFaceScanSuccess(false);
      setFaceVector(null);
    }
  };

  const handleUserMediaError = (err) => {
    console.error('Webcam error:', err);
    const errName = err?.name || '';
    if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
      setCameraError({
        type: 'permission_denied',
        title: 'Izin Kamera Ditolak Browser',
        message: 'Mohon izinkan perizinan kamera pada browser Anda agar dapat mengambil selfie.',
        guide: [
          'Klik ikon Gembok / Setelan Situs (🔒) di sebelah kiri URL browser.',
          'Ubah opsi "Kamera" menjadi "Izinkan" (Allow).',
          'Klik tombol "Minta Izin Kamera Ulang" di bawah atau muat ulang halaman.'
        ]
      });
    } else if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setCameraError({
        type: 'insecure_origin',
        title: 'Koneksi Aman (HTTPS) Diperlukan',
        message: 'Browser memblokir kamera jika website dibuka via HTTP biasa. Harap beralih ke HTTPS agar kamera langsung aktif.',
        guide: [
          'Klik tombol "Buka via HTTPS (Kamera Langsung Aktif)" di bawah ini.',
          'Jika muncul peringatan sertifikat browser, klik "Lanjutan" (Advanced) lalu klik "Lanjutkan ke 103.134.221.200 (Proceed)".',
          'Klik "Izinkan" (Allow) pada popup permintaan izin kamera.'
        ]
      });
    } else {
      setCameraError({
        type: 'general',
        title: 'Kendala Membuka Kamera',
        message: err.message || 'Kamera tidak dapat diakses. Anda dapat mengunggah foto secara manual.',
      });
    }
  };

  const handleRequestCamera = async () => {
    setCameraError(null);
    if (typeof window !== 'undefined' && window.location.protocol === 'http:' && !window.isSecureContext) {
      window.location.href = window.location.href.replace('http:', 'https:');
      return;
    }
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        stream.getTracks().forEach((track) => track.stop());
        setCameraError(null);
      }
    } catch (err) {
      handleUserMediaError(err);
    }
  };

  // Capture Photo and Face Descriptor from live webcam
  const handleCaptureSnapshot = async () => {
    if (!webcamRef.current) return;
    setScanningFace(true);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error('Gagal mengambil gambar dari kamera.');
      }

      setPhotoPreview(imageSrc);
      setPhotoFile(imageSrc); // Base64 data URL

      // Attempt AI face detection if face-api models are available
      try {
        const video = webcamRef.current?.video;
        const isModelReady = faceapi.nets.tinyFaceDetector?.isLoaded || faceapi.nets.ssdMobilenetv1?.isLoaded;
        if (video && isModelReady) {
          // Snapshot 2D canvas dengan downscaling ke max 480px untuk akselerasi instan
          let inputSource = video;
          try {
            const offscreenCanvas = document.createElement('canvas');
            const maxDim = 480;
            const scale = Math.min(1, maxDim / Math.max(video.videoWidth || 640, video.videoHeight || 480));
            offscreenCanvas.width = Math.round((video.videoWidth || 640) * scale);
            offscreenCanvas.height = Math.round((video.videoHeight || 480) * scale);
            const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
              inputSource = offscreenCanvas;
            }
          } catch (canvasErr) {
            inputSource = video;
          }

          let detection = null;
          if (faceapi.nets.tinyFaceDetector?.isLoaded) {
            detection = await faceapi
              .detectSingleFace(inputSource, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.28 }))
              .withFaceLandmarks(true)
              .withFaceDescriptor();
            if (!detection) {
              detection = await faceapi
                .detectSingleFace(inputSource, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.22 }))
                .withFaceLandmarks(true)
                .withFaceDescriptor();
            }
          } else {
            detection = await faceapi
              .detectSingleFace(inputSource)
              .withFaceLandmarks()
              .withFaceDescriptor();
          }

          if (detection && detection.descriptor) {
            const vectorArray = Array.from(detection.descriptor);
            setFaceVector(vectorArray);
            setFaceScanSuccess(true);
            toast.success('Wajah terdeteksi & foto berhasil diambil!');
          } else {
            toast('Foto tersimpan (wajah tidak otomatis teranalisis, tetap valid).', { icon: '📸' });
          }
        } else {
          toast.success('Foto berhasil diambil!');
        }
      } catch (faceErr) {
        console.warn('Face detection optional fallback:', faceErr);
        toast.success('Foto selfie berhasil diambil!');
      }

      setShowCamera(false);
    } catch (err) {
      console.error('Capture error:', err);
      toast.error('Gagal mengambil foto: ' + err.message);
    } finally {
      setScanningFace(false);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    if (!phone.trim()) {
      toast.error('Nomor WhatsApp / telepon wajib diisi');
      return;
    }
    if (!purpose.trim()) {
      toast.error('Tujuan / keperluan kunjungan wajib diisi');
      return;
    }
    if (!meetTo.trim()) {
      toast.error('Pihak / staf yang ingin ditemui wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      if (email.trim()) formData.append('email', email.trim());
      if (company.trim()) formData.append('company', company.trim());
      formData.append('purpose', purpose.trim());
      formData.append('meet_to', meetTo.trim());

      // Photo upload (File or Base64)
      if (photoFile instanceof File) {
        formData.append('photo', photoFile);
      } else if (typeof photoFile === 'string' && photoFile.startsWith('data:image')) {
        formData.append('photo', photoFile);
      }

      // Biometric face vector
      if (faceVector && Array.isArray(faceVector) && faceVector.length === 128) {
        formData.append('face_vector', JSON.stringify(faceVector));
      }

      const response = await publicRegistrationService.register(formData);

      if (response.success) {
        setSuccessData({
          visitor: response.data?.visitor || { name, phone, company, email },
          visit: response.data?.visit || { purpose, meet_to: meetTo, check_in: new Date().toISOString() },
          registeredAt: new Date().toLocaleString('id-ID', {
            dateStyle: 'full',
            timeStyle: 'short',
          }),
        });
        setIsSuccess(true);
        toast.success('Pendaftaran tamu berhasil!', { duration: 5000, icon: '🎉' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.name?.[0] ||
        err.response?.data?.errors?.phone?.[0] ||
        'Gagal melakukan pendaftaran. Silakan periksa data Anda.';
      toast.error(msg, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form for next registration
  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setCompany('');
    setPurpose('');
    setMeetTo('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setFaceVector(null);
    setFaceScanSuccess(false);
    setShowCamera(false);
    setIsSuccess(false);
    setSuccessData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Bar */}
      <header className="w-full border-b border-gray-200 bg-white px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center p-1 border border-gray-200 shadow-xs flex-shrink-0">
            <img src={LOGO} alt={APP_NAME} className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm sm:text-base">PT GLOSINDO</span>
            <p className="text-[11px] sm:text-xs text-gray-500">Pendaftaran Tamu</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {checkingStatus ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-600">Memuat...</p>
          </div>
        ) : !isEnabled ? (
          /* When Registration is DISABLED */
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Lock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Pendaftaran Sedang Nonaktif
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Fitur registrasi mandiri sedang dinonaktifkan. Silakan datang langsung ke resepsionis.
            </p>
            <Button
              variant="outline"
              size="md"
              onClick={fetchStatus}
              icon={RefreshCw}
              className="text-gray-700"
            >
              Muat Ulang
            </Button>
          </div>
        ) : isSuccess && successData ? (
          /* SUCCESS CONFIRMATION */
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="text-center pb-6 border-b border-gray-100">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Pendaftaran Berhasil
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Data kunjungan Anda telah disimpan
              </p>
            </div>

            {/* Visitor Card */}
            <div className="my-6 p-5 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {successData.visitor.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {successData.visitor.company || 'Pribadi'}
                  </p>
                  <p className="text-sm text-gray-500">{successData.visitor.phone}</p>
                </div>

                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Foto"
                    className="w-16 h-16 rounded object-cover border border-gray-300"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 text-sm">
                <div>
                  <span className="text-gray-500">Bertemu:</span>
                  <span className="text-gray-900 font-medium block">{successData.visit.meet_to}</span>
                </div>
                <div>
                  <span className="text-gray-500">Keperluan:</span>
                  <span className="text-gray-900 font-medium block">{successData.visit.purpose}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Waktu:</span>
                  <span className="text-gray-900 block">{successData.registeredAt}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={handleReset}
                className="text-gray-700"
              >
                Daftar Lagi
              </Button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM (Enabled State) */
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            {/* Form Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Formulir Pendaftaran Tamu
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Silakan isi formulir di bawah ini sebelum berkunjung
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Data Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
                  Data Identitas
                </h3>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Phone & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor WhatsApp / HP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (Opsional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@domain.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instansi / Perusahaan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="PT Mitra Sejahtera / Pribadi"
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Visit Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
                  Rincian Kunjungan
                </h3>

                {/* Meet To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bertemu Dengan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={meetTo}
                    onChange={(e) => setMeetTo(e.target.value)}
                    placeholder="Nama staf / divisi"
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tujuan Kunjungan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Interview, meeting, pengantaran dokumen, dll"
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Photo Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
                  Foto (Opsional)
                </h3>

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                  {photoPreview && (
                    <div className="flex items-center gap-3">
                      <img
                        src={photoPreview}
                        alt="Foto"
                        className="w-16 h-16 rounded object-cover border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                          setFaceVector(null);
                          setFaceScanSuccess(false);
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      Unggah Foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowCamera(!showCamera)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Camera className="w-4 h-4" />
                      {showCamera ? 'Tutup Kamera' : 'Ambil Selfie'}
                    </button>
                  </div>

                  {/* Live Camera Feed */}
                  {showCamera && (
                    <div className="space-y-3">
                      {cameraError ? (
                        <CameraPermissionAlert
                          error={cameraError}
                          onRetry={handleRequestCamera}
                          className="max-w-sm mx-auto"
                        />
                      ) : (
                        <>
                          <div className="relative max-w-sm mx-auto rounded-lg overflow-hidden border border-gray-300 aspect-4/3 bg-black">
                            <Webcam
                              ref={webcamRef}
                              audio={false}
                              screenshotFormat="image/jpeg"
                              videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                              onUserMedia={() => setCameraError(null)}
                              onUserMediaError={handleUserMediaError}
                              className="w-full h-full object-cover"
                            />
                            {/* Responsive Modern Solid Circle Face Guide Overlay */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-3">
                              <div className="relative w-[min(65%,220px)] aspect-square flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-2 border-white/85 shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-pulse" />
                                <div className="absolute -top-3 -left-3 w-5 h-5 border-t-2 border-l-2 border-white/60 rounded-tl-xl" />
                                <div className="absolute -top-3 -right-3 w-5 h-5 border-t-2 border-r-2 border-white/60 rounded-tr-xl" />
                                <div className="absolute -bottom-3 -left-3 w-5 h-5 border-b-2 border-l-2 border-white/60 rounded-bl-xl" />
                                <div className="absolute -bottom-3 -right-3 w-5 h-5 border-b-2 border-r-2 border-white/60 rounded-br-xl" />
                              </div>
                            </div>
                            <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none">
                              <span className="px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-[10px] font-medium text-white/95 shadow-sm border border-white/15">
                                Posisikan wajah di dalam lingkaran
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={handleCaptureSnapshot}
                            loading={scanningFace}
                            icon={Camera}
                            className="mx-auto"
                          >
                            {scanningFace ? 'Memproses...' : 'Ambil Foto'}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={submitting}
                  icon={CheckCircle2}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer Bar */}
      <footer className="w-full border-t border-gray-200 bg-white px-6 py-3 text-center text-xs text-gray-500">
        <div className="max-w-3xl mx-auto">
          &copy; {new Date().getFullYear()} PT GLOSINDO
        </div>
      </footer>
    </div>
  );
};

export default PublicGuestRegisterPage;
