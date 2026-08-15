import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  Building,
  FileText,
  UserCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Lock,
  ChevronRight,
  ArrowRight,
  Upload,
  Calendar,
  XCircle,
  HelpCircle,
  Copy,
  Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import publicRegistrationService from '../services/publicRegistrationService';
import { LOGO, APP_NAME } from '../constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

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
        const video = webcamRef.current.video;
        if (video && faceapi.nets.ssdMobilenetv1.isLoaded) {
          const detection = await faceapi
            .detectSingleFace(video)
            .withFaceLandmarks()
            .withFaceDescriptor();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 text-slate-100 flex flex-col justify-between selection:bg-brand-cyan selection:text-white">
      {/* Background Glow Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-3.5 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-md border border-slate-200 flex-shrink-0">
              <img src={LOGO} alt={APP_NAME} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base md:text-lg">
                  GLOSINDO
                </span>
                <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Guest Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Pendaftaran Kunjungan Mandiri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Portal Resmi Tamu</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        {checkingStatus ? (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-10 text-center shadow-2xl max-w-md mx-auto w-full">
            <div className="w-14 h-14 rounded-2xl bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center mx-auto mb-4 animate-pulse">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Memeriksa Status Layanan...</h2>
            <p className="text-xs text-slate-400">Menghubungkan ke sistem resepsionis GLOSINDO</p>
          </div>
        ) : !isEnabled ? (
          /* When Registration is DISABLED by Admin/Receptionist */
          <div className="bg-slate-800/90 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-8 sm:p-10 text-center shadow-2xl max-w-lg mx-auto w-full animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              Pendaftaran Ditutup
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Pendaftaran Mandiri Sedang Nonaktif
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
              Mohon maaf, saat ini fitur registrasi tamu dari luar / rumah sedang dinonaktifkan oleh petugas resepsionis atau administrator.
            </p>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/80 text-left space-y-2 mb-6">
              <p className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                Petunjuk Bagi Pengunjung:
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Silakan datang langsung ke gedung kantor PT GLOSINDO.</li>
                <li>Lakukan pendaftaran on-the-spot di meja resepsionis / kiosk resepsionis.</li>
                <li>Petugas kami siap membantu proses check-in Anda.</li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={fetchStatus}
              icon={RefreshCw}
              className="border-slate-700 hover:bg-slate-700 text-slate-200"
            >
              Muat Ulang Status
            </Button>
          </div>
        ) : isSuccess && successData ? (
          /* SUCCESS CONFIRMATION PASS SCREEN */
          <div className="bg-slate-800/90 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-xl mx-auto w-full animate-fadeIn">
            <div className="text-center pb-6 border-b border-slate-700/80">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="text-[11px] px-3 py-1 font-extrabold uppercase tracking-widest rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Registrasi Berhasil
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                Konfirmasi Pendaftaran Tamu
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Data pra-kunjungan Anda telah berhasil disimpan di sistem GLOSINDO.
              </p>
            </div>

            {/* Digital Visitor Pass Card */}
            <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Nama Pengunjung
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    {successData.visitor.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {successData.visitor.company || 'Pribadi / Umum'} • {successData.visitor.phone}
                  </p>
                </div>

                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Foto Tamu"
                    className="w-14 h-14 rounded-2xl object-cover border border-cyan-400 shadow-md flex-shrink-0"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Bertemu Dengan:</span>
                  <span className="text-white font-bold">{successData.visit.meet_to}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Keperluan:</span>
                  <span className="text-white font-bold truncate block">{successData.visit.purpose}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-semibold block">Waktu Registrasi:</span>
                  <span className="text-cyan-300 font-medium">{successData.registeredAt}</span>
                </div>
              </div>
            </div>

            {/* Next Steps Guide */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/80 mb-6 space-y-2">
              <p className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Langkah Selanjutnya Saat Tiba:
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tiba di lobi kantor PT GLOSINDO dan sebutkan nama lengkap atau nomor telepon Anda ke petugas resepsionis untuk konfirmasi kedatangan.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => window.print()}
                icon={Printer}
              >
                Cetak / Simpan Bukti
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleReset}
                className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Daftar Tamu Lain
              </Button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM (Enabled State) */
          <div className="bg-slate-800/85 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl">
            {/* Form Title */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Self Registration Online
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Pendaftaran Dibuka
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Formulir Pendaftaran Kunjungan Tamu
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Silakan isi formulir di bawah ini dari rumah atau ponsel Anda sebelum berkunjung ke PT GLOSINDO.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Data Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 pb-1 border-b border-slate-700/80 flex items-center gap-2">
                  <User className="w-4 h-4" /> 1. Data Identitas Tamu
                </h3>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nama Lengkap <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda..."
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                    />
                  </div>
                </div>

                {/* Phone & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Nomor WhatsApp / HP <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Alamat Email (Opsional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@domain.com"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Instansi / Perusahaan / Asal (Opsional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Contoh: PT Mitra Sejahtera / Pribadi"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Visit Details Section */}
              <div className="space-y-4 pt-4 border-t border-slate-700/80">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 pb-1 border-b border-slate-700/80 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> 2. Rincian Kunjungan
                </h3>

                {/* Meet To */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Bertemu Dengan Siapa (Staf / Divisi) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={meetTo}
                      onChange={(e) => setMeetTo(e.target.value)}
                      placeholder="Contoh: Ibu Rina (HRD) / Bpk. Budi (Operasional)"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Keperluan / Tujuan Kunjungan <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Contoh: Interview kerja / Meeting koordinasi vendor / Pengantaran dokumen resmi"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Photo & Face Biometrics (Optional) */}
              <div className="space-y-4 pt-4 border-t border-slate-700/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Camera className="w-4 h-4" /> 3. Foto Tamu / Wajah (Opsional)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Bisa unggah atau selfie</span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-700/80 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {photoPreview ? (
                      <div className="relative group">
                        <img
                          src={photoPreview}
                          alt="Foto Tamu"
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview(null);
                            setFaceVector(null);
                            setFaceScanSuccess(false);
                          }}
                          className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition-colors"
                          title="Hapus foto"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold">
                        <Camera className="w-6 h-6 mb-1 text-slate-500" />
                        Tanpa Foto
                      </div>
                    )}

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <p className="text-xs text-slate-300 font-medium">
                        Melampirkan foto wajah memudahkan verifikasi identitas di resepsionis.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-600 cursor-pointer transition-colors shadow-xs">
                          <Upload className="w-4 h-4 text-cyan-400" />
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-xs font-bold text-cyan-300 border border-cyan-500/40 transition-colors"
                        >
                          <Camera className="w-4 h-4 text-cyan-400" />
                          {showCamera ? 'Tutup Kamera' : 'Ambil Selfie'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Camera Feed */}
                  {showCamera && (
                    <div className="pt-4 border-t border-slate-800 text-center space-y-3">
                      <div className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-cyan-500/60 aspect-4/3 bg-black shadow-lg">
                        <Webcam
                          ref={webcamRef}
                          audio={false}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleCaptureSnapshot}
                        loading={scanningFace}
                        icon={Camera}
                      >
                        {scanningFace ? 'Memproses...' : 'Ambil Jepretan Wajah'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="kiosk"
                  fullWidth
                  loading={submitting}
                  icon={CheckCircle2}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/20 font-bold py-4 text-base rounded-2xl"
                >
                  {submitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran Kunjungan'}
                </Button>

                <p className="text-center text-[11px] text-slate-500 mt-3 font-medium">
                  Dengan mengirim formulir ini, Anda menyetujui data kunjungan Anda dicatat sesuai SOP keamanan PT GLOSINDO.
                </p>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-3 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} PT GLOSINDO Jaya • Digital Guestbook System</span>
          <span className="text-[11px] text-slate-600">Secure Guest Self-Service Portal</span>
        </div>
      </footer>
    </div>
  );
};

export default PublicGuestRegisterPage;
