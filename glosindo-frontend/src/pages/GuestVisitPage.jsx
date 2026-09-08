import { useState, useEffect, useCallback } from 'react';
import {
  Camera,
  ArrowLeft,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Building,
  Briefcase,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import FaceScanner from '../components/FaceScanner';
import Button from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import glosindoLogo from './logo-glosindo.webp';

// Quick purpose tags for industrial kiosk
const PURPOSE_SUGGESTIONS = [
  'Meeting Bisnis',
  'Kunjungan Vendor',
  'Pengiriman / Logistik',
  'Maintenance / Teknisi',
  'Wawancara Kerja',
  'Konsultasi',
];

const GuestVisitPage = () => {
  const [searchParams] = useSearchParams();
  const isKioskMode = searchParams.get('kiosk') === 'true';

  const [step, setStep] = useState('idle'); // idle | scanning | form-new | form-existing | success
  const [visitor, setVisitor] = useState(null); // matched visitor or null for new
  const [faceDescriptor, setFaceDescriptor] = useState(null); // Store face descriptor for new visitor
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [formData, setFormData] = useState({
    purpose: '',
    name: '',
    phone: '',
    meet_person: '',
  });

  // Digital clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-reset timer on success step
  useEffect(() => {
    let timer;
    if (step === 'success') {
      setCountdown(8);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleReset();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step]);

  // Reset scanner after success or cancel
  const handleReset = useCallback(() => {
    setStep('idle');
    setVisitor(null);
    setFaceDescriptor(null);
    setSubmitting(false);
    setFormData({ purpose: '', name: '', phone: '', meet_person: '' });
  }, []);

  // Start scanning when button clicked
  const handleStartScan = () => {
    setStep('scanning');
  };

  // Face matched = existing visitor
  const handleMatchFound = (matchedVisitor) => {
    setVisitor(matchedVisitor);
    setFaceDescriptor(null);
    setStep('form-existing');
    toast.success(`Wajah terverifikasi: ${matchedVisitor.name}`);
  };

  // No match = new visitor, store descriptor
  const handleNoMatch = (descriptor) => {
    setVisitor(null);
    setFaceDescriptor(descriptor);
    setStep('form-new');
  };

  // Quick select purpose helper
  const handleSelectPurpose = (item) => {
    setFormData((prev) => ({ ...prev, purpose: item }));
  };

  // Submit new visitor
  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.purpose.trim()) {
      toast.error('Harap lengkapi semua bidang bertanda bintang (*)');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/public/guest-visit', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        purpose: formData.purpose.trim(),
        meet_to: formData.meet_person?.trim() || null,
        face_descriptor: faceDescriptor,
      });

      // Save face embedding if returned
      if (faceDescriptor && response.data?.data?.visitor) {
        const visitorId = response.data.data.visitor.id;
        try {
          await api.post(`/visitors/${visitorId}/face-embedding`, {
            face_vector: faceDescriptor,
          });
        } catch (embError) {
          console.error('Face embedding save failed:', embError);
        }
      }

      setStep('success');
      toast.success('Pendaftaran dan check-in berhasil!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data kunjungan');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit existing visitor check-in
  const handleSubmitExisting = async (e) => {
    e.preventDefault();
    if (!formData.purpose.trim()) {
      toast.error('Tujuan kunjungan wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/public/guest-visit', {
        visitor_id: visitor.id || visitor.visitor_id,
        purpose: formData.purpose.trim(),
        meet_to: formData.meet_person?.trim() || null,
      });
      setStep('success');
      toast.success('Check-in berhasil!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal melakukan check-in');
    } finally {
      setSubmitting(false);
    }
  };

  // Format time & date (Indonesian locale)
  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // ==========================================
  // STEP 1: IDLE - INDUSTRIAL KIOSK HERO SCREEN
  // ==========================================
  if (step === 'idle') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white relative overflow-hidden font-sans">
        {/* Subtle Industrial Grid Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Industrial Header Bar */}
        <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center border border-slate-200/20">
                <img
                  src={glosindoLogo}
                  alt="PT Glosindo Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                    PT GLOSINDO
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                    Industrial Access
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium hidden sm:block">
                  Sistem Penerimaan & Verifikasi Tamu Digital
                </p>
              </div>
            </div>

            {/* Live Clock & Terminal Status */}
            <div className="flex items-center gap-4 text-right font-mono">
              <div className="hidden sm:block text-xs">
                <p className="text-slate-400 font-sans">{formattedDate}</p>
                <p className="text-white font-bold text-sm tracking-wider">{formattedTime} WIB</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 font-semibold tracking-wide">ONLINE</span>
              </div>
            </div>
          </div>
        </header>

        {/* Centerpiece Hero Card */}
        <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl text-center space-y-8 relative overflow-hidden">
            {/* Top decorative badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>TERMINAL KUNJUNGAN MANDIRI RESMI</span>
            </div>

            {/* Industrial Big Brand Emblem */}
            <div className="flex justify-center">
              <div className="p-4 bg-white/95 rounded-2xl shadow-xl ring-1 ring-white/20 hover:scale-105 transition-transform duration-300">
                <img
                  src={glosindoLogo}
                  alt="PT Glosindo"
                  className="h-16 sm:h-20 w-auto object-contain"
                />
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Selamat Datang di PT Glosindo
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Silakan tekan tombol di bawah untuk verifikasi wajah otomatis dan pendaftaran kunjungan cepat tanpa antre.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartScan}
                className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-cyan-950/50 hover:shadow-cyan-500/20 active:scale-[0.98] transition-all duration-200 cursor-pointer border border-cyan-400/30"
              >
                <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span>Mulai Check-In / Pindai Wajah</span>
                <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Industrial Feature Chips */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-semibold text-slate-200">Biometrik Cepat</h2>
                  <p className="text-[11px] text-slate-400 leading-tight">Pengenalan instan AI</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-semibold text-slate-200">Check-In Otomatis</h2>
                  <p className="text-[11px] text-slate-400 leading-tight">Tanpa antrean kertas</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-semibold text-slate-200">Standar Industri</h2>
                  <p className="text-[11px] text-slate-400 leading-tight">Data aman & terenkripsi</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Industrial Footer */}
        <footer className="relative z-10 w-full border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-500 font-mono flex flex-wrap justify-between items-center max-w-7xl mx-auto">
          <span>&copy; {currentTime.getFullYear()} PT GLOBAL MEDIA PRATAMA SOLUSINDO. ALL RIGHTS RESERVED.</span>
          <span>TERMINAL ID: GLOSINDO-K01 • KIOSK MODE</span>
        </footer>
      </div>
    );
  }

  // ==========================================
  // STEP 2: SCANNING - PROFESSIONAL HUD CAMERA
  // ==========================================
  if (step === 'scanning') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col overflow-hidden animate-fadeIn z-50 font-sans">
        {/* Top Industrial Header HUD */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white p-1 shadow flex items-center justify-center">
              <img src={glosindoLogo} alt="Glosindo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm tracking-wide">PEMINDAIAN BIOMETRIK</span>
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-300 font-mono">Posisikan wajah tepat di depan kamera</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 text-sm font-semibold backdrop-blur-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Batalkan</span>
          </button>
        </div>

        {/* Camera FaceScanner Container */}
        <div className="flex-1 w-full h-full relative">
          <FaceScanner
            onMatchFound={handleMatchFound}
            onNoMatch={handleNoMatch}
            silentMode={false}
            fullscreen={true}
          />
        </div>

        {/* Bottom Guidance HUD */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-md w-[90%] px-5 py-3 rounded-2xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-2xl text-center">
          <p className="text-xs text-slate-200 font-medium">
            💡 Sistem sedang menganalisis wajah Anda secara otomatis. Harap tunggu sebentar.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 3: FORM NEW VISITOR
  // ==========================================
  if (step === 'form-new') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-y-auto font-sans">
        {/* Industrial Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Top Bar */}
        <div className="relative z-10 max-w-xl w-full mx-auto flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white p-1.5 shadow flex items-center justify-center">
              <img src={glosindoLogo} alt="Glosindo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-white text-base">PT GLOSINDO</span>
              <p className="text-xs text-slate-400 font-mono">Form Tamu Baru</p>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            {formattedTime} WIB
          </div>
        </div>

        {/* Form Card */}
        <div className="relative z-10 w-full max-w-xl mx-auto my-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-mono mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>WAJAH BARU TERDETEKSI</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Pendaftaran Tamu Baru
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Data wajah Anda telah direkam. Lengkapi informasi di bawah untuk check-in.
            </p>
          </div>

          <form onSubmit={handleSubmitNew} className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Nama Lengkap <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap Anda"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* No. Telepon */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Nomor Telepon / WA <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Tujuan Kunjungan */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Tujuan Kunjungan <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Keperluan kunjungan Anda"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
                />
              </div>
              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PURPOSE_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectPurpose(item)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Menemui Siapa */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Menemui Siapa / Divisi <span className="text-slate-500 font-normal lowercase">(opsional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Nama staf atau departemen yang dituju"
                  value={formData.meet_person}
                  onChange={(e) => setFormData({ ...formData, meet_person: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={submitting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 font-bold"
              >
                Simpan & Check-In
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="relative z-10 py-2 text-center text-xs text-slate-600 font-mono">
          PT GLOSINDO • INDUSTRIAL SECURITY PROTOCOL
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 4: FORM EXISTING VISITOR
  // ==========================================
  if (step === 'form-existing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-y-auto font-sans">
        {/* Industrial Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Top Bar */}
        <div className="relative z-10 max-w-xl w-full mx-auto flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white p-1.5 shadow flex items-center justify-center">
              <img src={glosindoLogo} alt="Glosindo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-white text-base">PT GLOSINDO</span>
              <p className="text-xs text-slate-400 font-mono">Check-In Terverifikasi</p>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            {formattedTime} WIB
          </div>
        </div>

        {/* Form Card */}
        <div className="relative z-10 w-full max-w-xl mx-auto my-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Verified Header */}
          <div className="border-b border-slate-800 pb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-mono mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>IDENTITAS TERVERIFIKASI</span>
            </div>
            <h2 className="text-xl text-slate-300 font-medium">Selamat Datang Kembali,</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 mt-1">
              {visitor?.name}
            </p>
            {visitor?.phone && (
              <p className="text-xs font-mono text-slate-400 mt-1">
                No. Telp: {visitor.phone}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmitExisting} className="space-y-4">
            {/* Tujuan Kunjungan */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Tujuan Kunjungan Hari Ini <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Keperluan kunjungan Anda"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
                />
              </div>
              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PURPOSE_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectPurpose(item)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Menemui Siapa */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Menemui Siapa / Divisi <span className="text-slate-500 font-normal lowercase">(opsional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Nama staf atau departemen yang dituju"
                  value={formData.meet_person}
                  onChange={(e) => setFormData({ ...formData, meet_person: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={submitting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 font-bold"
              >
                Konfirmasi Check-In
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="relative z-10 py-2 text-center text-xs text-slate-600 font-mono">
          PT GLOSINDO • INDUSTRIAL SECURITY PROTOCOL
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 5: SUCCESS - CONFIRMATION TERMINAL
  // ==========================================
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top brand */}
        <div className="relative z-10 max-w-lg w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white p-1.5 shadow flex items-center justify-center">
              <img src={glosindoLogo} alt="Glosindo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-white text-base">PT GLOSINDO</span>
              <p className="text-xs text-slate-400 font-mono">Konfirmasi Akses Kunjungan</p>
            </div>
          </div>
        </div>

        {/* Confirmation Card */}
        <div className="relative z-10 w-full max-w-lg mx-auto my-auto bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
          {/* Animated Success Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800/80 text-emerald-400 text-xs font-mono">
              <span>CHECK-IN BERHASIL TERVERIFIKASI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Selamat Datang!
            </h2>
            <p className="text-xl sm:text-2xl font-bold text-cyan-400">
              {visitor ? visitor.name : formData.name}
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Data kunjungan Anda telah tercatat di sistem PT Glosindo. Silakan masuk atau hubungi resepsionis.
            </p>
          </div>

          {/* Visitor Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left font-mono text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400">Waktu Masuk:</span>
              <span className="text-white font-bold">{formattedTime} WIB</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-400">Keperluan:</span>
              <span className="text-cyan-300 font-medium truncate max-w-[200px]">
                {formData.purpose}
              </span>
            </div>
            {formData.meet_person && (
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">Menemui:</span>
                <span className="text-slate-200">{formData.meet_person}</span>
              </div>
            )}
            <div className="flex justify-between pt-0.5">
              <span className="text-slate-400">Status Akses:</span>
              <span className="text-emerald-400 font-bold">AKTIF</span>
            </div>
          </div>

          {/* Auto reset counter and manual button */}
          <div className="pt-2 space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={RotateCcw}
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            >
              Selesai / Kembali ke Awal ({countdown}s)
            </Button>
            <p className="text-[11px] text-slate-500 font-mono">
              Layar akan otomatis kembali dalam {countdown} detik
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 py-2 text-center text-xs text-slate-600 font-mono">
          PT GLOSINDO • TERIMA KASIH ATAS KUNJUNGAN ANDA
        </div>
      </div>
    );
  }

  return null;
};

export default GuestVisitPage;
