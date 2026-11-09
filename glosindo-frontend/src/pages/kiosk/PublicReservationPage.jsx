import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Camera,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Mail,
  Building,
  Briefcase,
  Calendar,
  Clock,
  Shield,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import FaceScanner from '../../components/FaceScanner';
import Button from '../../components/ui/Button';
import useFaceModels from '../../hooks/useFaceModels';
import useFaceMatcher from '../../hooks/useFaceMatcher';
import reservationService from '../../services/reservationService';
import toast from 'react-hot-toast';
import { LOGO as glosindoLogo } from '../../constants';

// Opsi keperluan singkat & umum
const PURPOSE_OPTIONS = ['Meeting', 'Kunjungan Vendor', 'Pengiriman Barang', 'Interview', 'Urusan Bisnis'];

const PublicReservationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // Preload face models in background on idle screen
  useFaceModels();
  useFaceMatcher();

  // Step state: 'loading' | 'idle' | 'scanning' | 'form' | 'success' | 'invalid'
  const [step, setStep] = useState('loading');
  const [invitation, setInvitation] = useState(null);
  const [invalidReason, setInvalidReason] = useState(null);

  // Biometrics & Photo state
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [purpose, setPurpose] = useState('');
  const [meetTo, setMeetTo] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [biometricConsent, setBiometricConsent] = useState(true);

  // Submitting & Success
  const [submitting, setSubmitting] = useState(false);
  const [reservationResult, setReservationResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Digital clock interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch & validate invitation token on load
  useEffect(() => {
    const fetchInvitation = async () => {
      setStep('loading');
      try {
        const res = await reservationService.getPublicInvitation(token);
        if (res && res.success && res.data) {
          const inv = res.data;
          setInvitation(inv);

          if (!inv.is_valid) {
            setInvalidReason(inv.invalid_reason || 'Link undangan sudah tidak berlaku.');
            setStep('invalid');
          } else {
            // Pre-fill form fields from invitation defaults
            if (inv.company_name) setCompany(inv.company_name);
            if (inv.guest_name) setName(inv.guest_name);
            if (inv.purpose) setPurpose(inv.purpose);
            if (inv.meet_to) setMeetTo(inv.meet_to);
            if (inv.scheduled_date) setScheduledDate(inv.scheduled_date);
            if (inv.scheduled_time) setScheduledTime(inv.scheduled_time);

            // Default to today if no scheduled date set in invitation
            if (!inv.scheduled_date) {
              const todayStr = new Date().toISOString().split('T')[0];
              setScheduledDate(todayStr);
            }

            setStep('idle');
          }
        } else {
          setInvalidReason('Link undangan tidak ditemukan.');
          setStep('invalid');
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Link undangan tidak valid atau tidak ditemukan.';
        setInvalidReason(msg);
        setStep('invalid');
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  // Format date and time
  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Reset to idle
  const handleReset = useCallback(() => {
    setStep('idle');
  }, []);

  // Handler when face is matched or captured
  const handleMatchFound = (matchedVisitor, photo, descriptor) => {
    if (descriptor) {
      setFaceDescriptor(descriptor);
    }
    if (photo) {
      setPhotoPreview(photo);
      setPhotoFile(photo);
    }
    // Auto fill if matched visitor details are present
    if (matchedVisitor) {
      if (matchedVisitor.name && !name) setName(matchedVisitor.name);
      if (matchedVisitor.phone && !phone) setPhone(matchedVisitor.phone);
      if (matchedVisitor.company && !company) setCompany(matchedVisitor.company);
    }
    toast.success('Wajah berhasil dipindai!');
    setStep('form');
  };

  const handleNoMatch = (descriptor, photo) => {
    if (descriptor) {
      setFaceDescriptor(descriptor);
    }
    if (photo) {
      setPhotoPreview(photo);
      setPhotoFile(photo);
    }
    toast.success('Wajah berhasil dipindai!');
    setStep('form');
  };

  // Submit reservation form
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
      toast.error('Pihak yang ingin ditemui wajib diisi');
      return;
    }
    if (!scheduledDate) {
      toast.error('Tanggal kunjungan wajib diisi');
      return;
    }
    if (!biometricConsent) {
      toast.error('Persetujuan pemrosesan biometrik wajah wajib dicentang');
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
      if (scheduledTime) formData.append('scheduled_time', scheduledTime);
      formData.append('biometric_consent', '1');

      if (faceDescriptor && Array.isArray(faceDescriptor)) {
        formData.append('face_vector', JSON.stringify(faceDescriptor));
      }

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await reservationService.submitPublicReservation(token, formData);
      if (res && res.success) {
        setReservationResult(res.data);
        setStep('success');
        toast.success('Reservasi berhasil & otomatis disetujui!');
      } else {
        toast.error(res?.message || 'Gagal memproses reservasi.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirimkan reservasi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Copy code helper
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Kode reservasi berhasil disalin!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // ==========================================
  // 0. LOADING SCREEN
  // ==========================================
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Memverifikasi undangan reservasi...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // INVALID TOKEN SCREEN
  // ==========================================
  if (step === 'invalid') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white relative overflow-hidden font-sans">
        <header className="relative z-10 w-full px-4 sm:px-10 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white p-1 sm:p-1.5 shadow-sm flex items-center justify-center flex-shrink-0">
              <img src={glosindoLogo} alt="Logo Glosindo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-white text-sm sm:text-base tracking-tight block leading-tight">GLIDE GUESTBOOK</span>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">GLOSINDO Buku Tamu Digital</p>
            </div>
          </div>
          <div className="text-right text-[11px] sm:text-xs font-mono text-slate-400">
            <span className="text-white font-semibold">{formattedTime} WIB</span>
          </div>
        </header>

        <main className="relative z-10 flex-1 max-w-xl w-full mx-auto px-6 flex flex-col items-center justify-center text-center">
          <div className="w-full bg-slate-900/70 border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Undangan Tidak Berlaku
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">
                {invalidReason || 'Link undangan ini tidak dapat digunakan atau sudah kedaluwarsa.'}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Silakan hubungi staf atau admin yang mengundang Anda untuk mendapatkan link baru.
            </p>
          </div>
        </main>

        <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-500">
          PT Global Media Pratama Solusindo
        </footer>
      </div>
    );
  }

  // ==========================================
  // 1. BERANDA (IDENTIK DENGAN KIOSK CHECK-IN)
  // ==========================================
  if (step === 'idle') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white relative overflow-hidden font-sans">
        {/* Glow halus */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Header minimalis identik Kiosk: Tombol Kembali, Logo & Jam */}
        <header className="relative z-10 w-full px-4 sm:px-10 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Kembali"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-4 h-4 text-slate-300 flex-shrink-0" />
              <span className="hidden sm:inline">Kembali</span>
            </button>

            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white p-1 sm:p-1.5 shadow-sm flex items-center justify-center flex-shrink-0">
              <img src={glosindoLogo} alt="Logo Glosindo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-white text-sm sm:text-base tracking-tight block leading-tight">GLIDE GUESTBOOK</span>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">GLOSINDO Buku Tamu Digital</p>
            </div>
          </div>

          <div className="text-right text-[11px] sm:text-xs font-mono text-slate-400">
            <span className="hidden sm:inline">{formattedDate} • </span>
            <span className="text-white font-semibold">{formattedTime} WIB</span>
          </div>
        </header>

        {/* Konten Utama Terpusat (SAMA PERSIS DENGAN KIOSK) */}
        <main className="relative z-10 flex-1 max-w-xl w-full mx-auto px-6 flex flex-col items-center justify-center text-center">
          <div className="w-full bg-slate-900/70 border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md space-y-8">
            {/* Logo Utama */}
            <div className="flex justify-center">
              <div className="p-3.5 bg-white rounded-2xl shadow-md">
                <img
                  src={glosindoLogo}
                  alt="Logo Glosindo"
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              </div>
            </div>

            {/* Judul & Penjelasan */}
            <div className="space-y-2">
              {invitation && (invitation.company_name || invitation.guest_name) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/50 text-blue-300 text-xs font-medium mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Undangan: {invitation.company_name || invitation.guest_name}</span>
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Selamat Datang
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Silakan klik tombol di bawah untuk mulai registrasi reservasi kunjungan Anda.
              </p>
            </div>

            {/* Tombol Aksi Utama yang Identik */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep('scanning')}
                className="w-full py-5 px-8 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
                <span>Mulai Registrasi</span>
              </button>
              <p className="text-xs text-slate-400 mt-3">
                Kamera akan memindai wajah Anda secara otomatis
              </p>
            </div>
          </div>
        </main>

        {/* Footer ringkas */}
        <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-500">
          PT Global Media Pratama Solusindo
        </footer>
      </div>
    );
  }

  // ==========================================
  // 2. PEMINDAIAN KAMERA (IDENTIK DENGAN KIOSK)
  // ==========================================
  if (step === 'scanning') {
    return (
      <div className="fixed inset-0 h-[100dvh] w-full bg-slate-950 flex flex-col overflow-hidden z-50 font-sans select-none">
        {/* Top bar pemindaian */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/85 via-black/45 to-transparent px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between pt-[max(14px,env(safe-area-inset-top,14px))] pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white p-1 flex items-center justify-center shadow-md">
              <img src={glosindoLogo} alt="Glosindo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight block">Pindai Wajah Tamu</span>
              <span className="text-[10px] text-cyan-400 font-medium block">Pendaftaran Biometrik Reservasi</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 backdrop-blur-md text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Batal</span>
          </button>
        </div>

        {/* Kamera Preview Area */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <FaceScanner
            onMatchFound={handleMatchFound}
            onNoMatch={handleNoMatch}
            silentMode={false}
            fullscreen={true}
          />
        </div>

        {/* Petunjuk Bawah */}
        <div className="absolute bottom-6 sm:bottom-8 inset-x-0 z-30 flex flex-col items-center gap-2.5 px-4 pb-[env(safe-area-inset-bottom,0px)] pointer-events-auto">
          <div className="px-5 py-2.5 rounded-2xl bg-slate-950/80 border border-white/15 backdrop-blur-md shadow-2xl text-center max-w-[90vw] sm:max-w-md pointer-events-none">
            <p className="text-xs sm:text-sm text-white/95 font-medium tracking-wide">
              Posisikan wajah Anda di dalam lingkaran
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Wajah akan didaftarkan untuk auto check-in saat Anda tiba di kantor
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStep('form')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium py-1 px-3 rounded-lg bg-slate-900/60 border border-cyan-400/30 backdrop-blur-md transition-all cursor-pointer active:scale-95"
          >
            Atau lewati & isi formulir secara manual →
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. FORM RESERVASI TAMU (DARK KIOSK THEME)
  // ==========================================
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-y-auto font-sans">
        {/* Header Ringkas */}
        <div className="max-w-xl w-full mx-auto flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 w-7 h-7 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 mr-1"
              title="Batal dan kembali ke awal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <div className="h-8 w-8 rounded-lg bg-white p-1 flex items-center justify-center">
              <img src={glosindoLogo} alt="Glosindo" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-white text-sm">GLIDE GUESTBOOK</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{formattedTime} WIB</span>
        </div>

        {/* Kartu Form */}
        <div className="w-full max-w-xl mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Formulir Reservasi</h2>
              <p className="text-xs text-slate-400 mt-1">
                Lengkapi formulir untuk persetujuan otomatis (Auto Approved):
              </p>
            </div>

            {/* Status Wajah */}
            {faceDescriptor || photoPreview ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Wajah Siap</span>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                  />
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setStep('scanning')}
                className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg"
              >
                + Pindai Wajah
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Lengkap <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Baris No HP & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nomor WhatsApp / HP <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email <span className="text-slate-500 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Instansi / Perusahaan */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Instansi / Perusahaan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Nama instansi / PT / perorangan"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Keperluan Kunjungan */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Keperluan Kunjungan <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Meeting Proyek / Kunjungan Kerja"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PURPOSE_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPurpose(item)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Bertemu Siapa */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Orang Yang Ingin Ditemui <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nama staf atau pejabat yang dituju"
                  value={meetTo}
                  onChange={(e) => setMeetTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Jadwal: Tanggal & Jam */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tanggal Kunjungan <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Perkiraan Jam Kunjungan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Persetujuan Biometrik */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={biometricConsent}
                  onChange={(e) => setBiometricConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  Saya menyetujui pemrosesan data biometrik wajah untuk keperluan identifikasi dan verifikasi check-in otomatis di Kiosk Glosindo. Data disimpan secara aman dan terenkripsi.
                </span>
              </label>
            </div>

            {/* Tombol Form */}
            <div className="pt-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setStep('scanning')}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              >
                Pindai Ulang
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Konfirmasi Reservasi
              </Button>
            </div>
          </form>
        </div>

        <div className="py-2 text-center text-xs text-slate-600">
          PT Global Media Pratama Solusindo
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. SUKSES RESERVASI (AUTO APPROVED)
  // ==========================================
  if (step === 'success') {
    const resData = reservationResult?.reservation || {};
    const qrImage = reservationResult?.qr_code_base64;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative font-sans">
        {/* Header Ringkas */}
        <div className="max-w-xl w-full mx-auto flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white p-1 flex items-center justify-center">
              <img src={glosindoLogo} alt="Glosindo" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-white text-sm">GLIDE GUESTBOOK</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{formattedTime} WIB</span>
        </div>

        {/* Kartu Sukses Bersih */}
        <div className="w-full max-w-xl mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Otomatis Disetujui (Auto Approved)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
              Reservasi Anda Berhasil!
            </h2>
            <p className="text-lg font-bold text-cyan-400">
              Selamat Datang, {name}
            </p>
          </div>

          {/* Kartu Detail Tiket */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Kode Reservasi</span>
                <span className="font-mono text-lg font-bold text-cyan-300">
                  {resData.reservation_code || 'RSV-CONFIRMED'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(resData.reservation_code)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Disalin' : 'Salin'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Jadwal Kunjungan</span>
                <span className="text-slate-200 font-semibold">{scheduledDate} • {scheduledTime} WIB</span>
              </div>
              <div>
                <span className="text-slate-400 block">Pihak Dituju</span>
                <span className="text-slate-200 font-semibold">{meetTo}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Keperluan</span>
                <span className="text-slate-200 font-semibold">{purpose}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Status Registrasi Wajah</span>
                <span className="text-emerald-400 font-semibold">✓ Terdaftar</span>
              </div>
            </div>

            {/* QR Code jika ada */}
            {qrImage && (
              <div className="pt-3 border-t border-slate-800/80 flex flex-col items-center gap-2">
                <img
                  src={qrImage}
                  alt="QR Tiket"
                  className="w-36 h-36 bg-white p-2 rounded-xl shadow-md"
                />
                <a
                  href={qrImage}
                  download={`tiket-reservasi-${resData.reservation_code || 'glosindo'}.png`}
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Gambar Tiket QR</span>
                </a>
              </div>
            )}
          </div>

          {/* Panduan Kunjungan (Penting Sesuai Flow User) */}
          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/50 text-left text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Shield className="w-4 h-4" />
              <span>Panduan Kedatangan di Kantor Glosindo:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Saat Anda tiba di kantor Glosindo pada tanggal kunjungan, Anda <strong>TIDAK PERLU</strong> mengisi formulir lagi. Cukup dekati <strong>Kiosk Tamu</strong> di lobi dan klik <strong>Mulai Check-In</strong>. Sistem kamera akan langsung mengenali wajah Anda dan melakukan check-in seketika!
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/')}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>

        <div className="py-2 text-center text-xs text-slate-600">
          PT Global Media Pratama Solusindo
        </div>
      </div>
    );
  }

  return null;
};

export default PublicReservationPage;
