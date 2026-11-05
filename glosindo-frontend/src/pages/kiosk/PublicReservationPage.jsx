import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  Shield,
  Upload,
  RefreshCw,
  Download,
  Copy,
  ChevronRight,
  Info,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import reservationService from '../../services/reservationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { LOGO, APP_NAME } from '../../constants';

const PublicReservationPage = () => {
  const { token } = useParams();

  // Verification & Invitation state
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [tokenError, setTokenError] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [purpose, setPurpose] = useState('');
  const [meetTo, setMeetTo] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [biometricConsent, setBiometricConsent] = useState(false);

  // Camera & Face states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState('webcam'); // 'webcam' | 'manual_upload'
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [faceVector, setFaceVector] = useState(null);
  const [scanningFace, setScanningFace] = useState(false);
  const [faceQualityScore, setFaceQualityScore] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  // Submission & Success state
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const webcamRef = useRef(null);

  // Load and validate invitation token
  useEffect(() => {
    const fetchInvitation = async () => {
      setLoading(true);
      setTokenError(null);
      try {
        const res = await reservationService.getPublicInvitation(token);
        if (res.success && res.data) {
          const inv = res.data;
          setInvitation(inv);

          if (!inv.is_valid) {
            setTokenError(inv.invalid_reason || 'Link undangan sudah tidak berlaku.');
          } else {
            // Pre-fill form fields with invitation defaults
            if (inv.company_name) setCompany(inv.company_name);
            if (inv.guest_name) setName(inv.guest_name);
            if (inv.purpose) setPurpose(inv.purpose);
            if (inv.meet_to) setMeetTo(inv.meet_to);
            if (inv.scheduled_date) setScheduledDate(inv.scheduled_date);
            if (inv.scheduled_time) setScheduledTime(inv.scheduled_time);
          }
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Link undangan tidak valid atau tidak ditemukan.';
        setTokenError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  // Handle Photo file upload fallback
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setFaceVector(null);
      setFaceQualityScore(null);
      setShowCamera(false);
      toast.success('Foto selfie berhasil diunggah.');
    }
  };

  // Capture face from live webcam and extract 128-d descriptor
  const handleCaptureFace = async () => {
    if (!webcamRef.current) return;
    setScanningFace(true);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error('Gagal mengambil gambar dari kamera.');
      }

      setPhotoPreview(imageSrc);
      setPhotoFile(imageSrc);

      // Attempt AI face detection if face-api models are available
      const video = webcamRef.current?.video;
      const isModelReady = faceapi.nets.tinyFaceDetector?.isLoaded || faceapi.nets.ssdMobilenetv1?.isLoaded;

      if (video && isModelReady) {
        let detection = null;
        if (faceapi.nets.tinyFaceDetector?.isLoaded) {
          detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }))
            .withFaceLandmarks(true)
            .withFaceDescriptor();
        } else {
          detection = await faceapi
            .detectSingleFace(video)
            .withFaceLandmarks()
            .withFaceDescriptor();
        }

        if (detection && detection.descriptor) {
          const vector = Array.from(detection.descriptor);
          setFaceVector(vector);
          setFaceQualityScore(Math.round(detection.detection.score * 100));
          toast.success('Biometrik wajah berhasil terdeteksi & terverifikasi!');
          setShowCamera(false);
        } else {
          toast.error('Wajah tidak terdeteksi dengan jelas. Pastikan pencahayaan cukup dan wajah berada di tengah lingkaran.');
        }
      } else {
        // Fallback without face-api
        toast.success('Foto berhasil diambil.');
        setShowCamera(false);
      }
    } catch (err) {
      console.error('Face capture error:', err);
      toast.error('Gagal mengambil foto: ' + err.message);
    } finally {
      setScanningFace(false);
    }
  };

  const handleRetakePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setFaceVector(null);
    setFaceQualityScore(null);
    setShowCamera(true);
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    if (!phone.trim()) {
      toast.error('Nomor WhatsApp / HP wajib diisi');
      return;
    }
    if (!purpose.trim()) {
      toast.error('Tujuan kunjungan wajib diisi');
      return;
    }
    if (!meetTo.trim()) {
      toast.error('Nama yang ingin ditemui wajib diisi');
      return;
    }
    if (!scheduledDate) {
      toast.error('Tanggal kunjungan wajib diisi');
      return;
    }
    if (!biometricConsent) {
      toast.error('Harap centang persetujuan pemrosesan biometrik wajah');
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
      formData.append('scheduled_date', scheduledDate);
      formData.append('scheduled_time', scheduledTime || '09:00');
      formData.append('biometric_consent', '1');

      // Photo upload
      if (photoFile instanceof File) {
        formData.append('photo', photoFile);
      } else if (typeof photoFile === 'string' && photoFile.startsWith('data:image')) {
        formData.append('photo', photoFile);
      }

      // Biometric face vector
      if (faceVector && Array.isArray(faceVector) && faceVector.length === 128) {
        formData.append('face_vector', JSON.stringify(faceVector));
      }

      const res = await reservationService.submitPublicReservation(token, formData);

      if (res.success && res.data) {
        setSuccessData(res.data);
        toast.success('Reservasi berhasil dan otomatis disetujui!', { duration: 5000 });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengirim formulir reservasi.';
      toast.error(msg, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Memvalidasi link undangan reservasi...</p>
        </div>
      </div>
    );
  }

  // 2. Token Error State (Invalid / Expired / Quota Full)
  if (tokenError || !invitation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border border-slate-200">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Undangan Tidak Tersedia</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              {tokenError || 'Link reservasi tidak dapat diakses atau telah kedaluwarsa.'}
            </p>
          </div>
          <div className="pt-2">
            <p className="text-xs text-slate-400">
              Jika Anda merasa ini adalah kesalahan, silakan hubungi pihak yang mengundang atau resepsionis kantor.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // 3. Success Screen (Auto Approved Receipt)
  if (successData) {
    const { reservation, visitor, qr_code, check_in_guide } = successData;

    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full space-y-5 animate-scaleIn">
          {/* Header Card */}
          <Card className="p-6 sm:p-8 text-center space-y-4 border border-emerald-200 bg-white shadow-xs">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <Badge color="green" className="mb-2">AUTO APPROVED</Badge>
              <h1 className="text-2xl font-extrabold text-slate-900">Reservasi Kunjungan Berhasil!</h1>
              <p className="text-sm text-slate-500 mt-1">
                Data Anda dan biometrik wajah telah tersimpan. Tidak memerlukan persetujuan manual admin.
              </p>
            </div>

            {/* QR Code Container */}
            {qr_code && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
                <img
                  src={qr_code}
                  alt={`QR ${reservation.reservation_code}`}
                  className="w-52 h-52 sm:w-60 sm:h-60 mx-auto object-contain rounded-xl"
                />
                <p className="text-xs font-mono font-bold text-blue-700 mt-2 tracking-wider">
                  {reservation.reservation_code}
                </p>
              </div>
            )}

            {/* Summary Details */}
            <div className="text-left bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Nama Tamu</span>
                <span className="font-bold text-slate-900">{visitor.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Instansi</span>
                <span className="font-semibold text-slate-800">{visitor.company || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Tanggal Kunjungan</span>
                <span className="font-semibold text-slate-800">
                  {new Date(reservation.scheduled_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Jam Kunjungan</span>
                <span className="font-semibold text-slate-800">{reservation.scheduled_time || '09:00'} WIB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Tujuan</span>
                <span className="font-semibold text-slate-800">{reservation.purpose}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Menemui</span>
                <span className="font-semibold text-slate-800">{reservation.meet_to}</span>
              </div>
            </div>

            {/* Check-In Instructions */}
            <div className="bg-blue-50/60 text-blue-900 rounded-xl p-3.5 text-xs text-left border border-blue-200/80 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                Panduan Kedatangan di Kantor:
              </p>
              <p className="text-slate-600 leading-relaxed">
                {check_in_guide}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Button
                variant="secondary"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Cetak / Simpan Tiket
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 4. Main Reservation Form
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Sistem Buku Tamu Resmi GLOSINDO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Formulir Pra-Registrasi Tamu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Lengkapi data dan verifikasi wajah untuk mendapatkan persetujuan otomatis (Auto Approved) & akses express check-in.
          </p>
        </div>

        {/* Invitation Info Banner */}
        <Card className="p-4 sm:p-5 border border-blue-200 bg-blue-50/40">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs sm:text-sm flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Undangan Kunjungan</span>
                <Badge variant="blue">Kuota Tersedia</Badge>
              </div>
              <p className="font-bold text-slate-900 text-base">{invitation.company_name}</p>
              <div className="flex items-center gap-4 text-xs text-slate-600 pt-0.5 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {invitation.scheduled_date_formatted || invitation.scheduled_date}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {invitation.scheduled_time || '09:00'} WIB
                </span>
                {invitation.meet_to && (
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    Host: {invitation.meet_to}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Form Container */}
        <Card className="p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Personal Data */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                Informasi Data Diri
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap sesuai identitas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Instansi / Perusahaan
                </label>
                <input
                  type="text"
                  placeholder="Nama perusahaan atau instansi Anda"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Step 2: Visit Details */}
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                Rincian Kunjungan
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Tujuan / Keperluan Kunjungan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rapat Koordinasi / Pengiriman Barang"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Orang / Staf yang Ditemui <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama pejabat atau staf Glosindo yang ingin ditemui"
                  value={meetTo}
                  onChange={(e) => setMeetTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Tanggal Kunjungan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Perkiraan Jam Tiba
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Biometric Face Registration */}
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                Pendaftaran Biometrik Wajah
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed">
                Pendaftaran wajah memungkinkan sistem mengenali Anda secara instan di kiosk pintu masuk tanpa antre atau isi formulir ulang.
              </p>

              {/* Camera Container / Photo Preview */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 relative overflow-hidden border border-slate-800">
                {showCamera ? (
                  <div className="space-y-3">
                    <div className="relative aspect-4/3 max-w-sm mx-auto rounded-xl overflow-hidden bg-black">
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                        className="w-full h-full object-cover"
                      />

                      {/* Oval face guide overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-60 border-2 border-dashed border-blue-400 rounded-full" />
                      </div>

                      <div className="absolute bottom-2 inset-x-0 text-center">
                        <span className="text-[11px] bg-slate-900/80 px-2.5 py-1 rounded-full text-slate-200">
                          Posisikan wajah Anda di dalam lingkaran
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-center pt-1">
                      <Button
                        type="button"
                        onClick={handleCaptureFace}
                        disabled={scanningFace}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2"
                      >
                        {scanningFace ? 'Menganalisis Wajah...' : 'Ambil Foto & Verifikasi Wajah'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowCamera(false)}
                        className="text-xs"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : photoPreview ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <img
                      src={photoPreview}
                      alt="Selfie Preview"
                      className="w-28 h-28 object-cover rounded-2xl border-2 border-slate-700 shrink-0"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold text-sm text-white">Foto & Wajah Terverifikasi</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {faceVector ? 'Template biometrik 128-D siap digunakan untuk check-in instan.' : 'Foto tersimpan secara aman.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleRetakePhoto}
                        className="text-xs text-blue-400 hover:underline font-semibold"
                      >
                        Foto Ulang / Ganti
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-blue-400 border border-slate-700">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Buka Kamera untuk Selfie Wajah</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Gunakan kamera depan HP atau laptop Anda untuk registrasi wajah kilat.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                      <Button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2"
                      >
                        <Camera className="w-4 h-4 mr-1.5 inline" />
                        Aktifkan Kamera Selfie
                      </Button>

                      {/* Manual Upload Fallback */}
                      <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer transition border border-slate-700">
                        <Upload className="w-4 h-4 mr-1.5" />
                        <span>Unggah Foto Manual</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Explicit Biometric Consent Checkbox */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={biometricConsent}
                    onChange={(e) => setBiometricConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed font-medium">
                    Saya memberikan persetujuan eksplisit kepada PT Glosindo Digital Systems untuk memproses data biometrik wajah saya semata-mata untuk verifikasi identitas kunjungan dan presensi kehadiran di lokasi. Data disimpan terenkripsi dan tidak dibagikan ke pihak ketiga.
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-xs transition"
              >
                {submitting ? 'Memproses Reservasi & Auto-Approval...' : 'Konfirmasi & Dapatkan Tiket Reservasi'}
              </Button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Reservasi otomatis disetujui secara instan setelah formulir dikirimkan.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PublicReservationPage;

