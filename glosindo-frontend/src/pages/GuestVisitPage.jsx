import { useState, useEffect, useCallback } from 'react';
import {
  Camera,
  ArrowLeft,
  CheckCircle2,
  User,
  Phone,
  Building,
  Briefcase,
  RotateCcw,
} from 'lucide-react';
import FaceScanner from '../components/FaceScanner';
import Button from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import glosindoLogo from './logo-glosindo.webp';

// Opsi keperluan singkat & umum untuk tamu
const PURPOSE_OPTIONS = ['Meeting', 'Kunjungan Vendor', 'Pengiriman Barang', 'Interview', 'Lainnya'];

const GuestVisitPage = () => {
  const [step, setStep] = useState('idle'); // idle | scanning | form-new | form-existing | success
  const [visitor, setVisitor] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [formData, setFormData] = useState({
    purpose: '',
    name: '',
    phone: '',
    meet_person: '',
  });

  // Jam digital
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer reset otomatis di layar sukses
  useEffect(() => {
    let timer;
    if (step === 'success') {
      setCountdown(5);
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

  const handleReset = useCallback(() => {
    setStep('idle');
    setVisitor(null);
    setFaceDescriptor(null);
    setSubmitting(false);
    setFormData({ purpose: '', name: '', phone: '', meet_person: '' });
  }, []);

  const handleStartScan = () => {
    setStep('scanning');
  };

  const handleMatchFound = (matchedVisitor) => {
    setVisitor(matchedVisitor);
    setFaceDescriptor(null);
    setStep('form-existing');
  };

  const handleNoMatch = (descriptor) => {
    setVisitor(null);
    setFaceDescriptor(descriptor);
    setStep('form-new');
  };

  const handleSelectPurpose = (item) => {
    setFormData((prev) => ({ ...prev, purpose: item }));
  };

  // Submit tamu baru
  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.purpose.trim()) {
      toast.error('Mohon lengkapi data yang wajib diisi');
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

      if (faceDescriptor && response.data?.data?.visitor) {
        const visitorId = response.data.data.visitor.id;
        try {
          await api.post(`/visitors/${visitorId}/face-embedding`, {
            face_vector: faceDescriptor,
          });
        } catch (embError) {
          console.error('Face embedding error:', embError);
        }
      }

      setStep('success');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit tamu lama
  const handleSubmitExisting = async (e) => {
    e.preventDefault();
    if (!formData.purpose.trim()) {
      toast.error('Keperluan kunjungan wajib diisi');
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal melakukan check-in');
    } finally {
      setSubmitting(false);
    }
  };

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

  // ==========================================
  // 1. BERANDA (CLEAN & SIMPLE KIOSK)
  // ==========================================
  if (step === 'idle') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white relative overflow-hidden font-sans">
        {/* Latar belakang bersih dengan glow halus */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Header minimalis: Logo & Jam */}
        <header className="relative z-10 w-full px-6 sm:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center">
              <img src={glosindoLogo} alt="Logo Glosindo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">PT GLOSINDO</span>
              <p className="text-xs text-slate-400">Buku Tamu Digital</p>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            <span className="hidden sm:inline">{formattedDate} • </span>
            <span className="text-white font-semibold">{formattedTime} WIB</span>
          </div>
        </header>

        {/* Konten Utama Terpusat */}
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

            {/* Judul & Penjelasan Singkat */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Selamat Datang
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Silakan sentuh tombol di bawah untuk mulai check-in kunjungan Anda.
              </p>
            </div>

            {/* Tombol Aksi Utama yang Sangat Jelas */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartScan}
                className="w-full py-5 px-8 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
                <span>Mulai Check-In</span>
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
  // 2. PEMINDAIAN KAMERA
  // ==========================================
  if (step === 'scanning') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col overflow-hidden z-50 font-sans">
        {/* Top bar pemindaian */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white p-1 flex items-center justify-center">
              <img src={glosindoLogo} alt="Glosindo" className="h-full w-full object-contain" />
            </div>
            <span className="text-white font-semibold text-sm">Pindai Wajah</span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Batal</span>
          </button>
        </div>

        {/* Kamera */}
        <div className="flex-1 w-full h-full relative">
          <FaceScanner
            onMatchFound={handleMatchFound}
            onNoMatch={handleNoMatch}
            silentMode={false}
            fullscreen={true}
          />
        </div>

        {/* Petunjuk mudah */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 px-6 py-2.5 rounded-full bg-slate-900/90 border border-slate-700 backdrop-blur-md shadow-lg text-center">
          <p className="text-xs sm:text-sm text-slate-200 font-medium">
            Arahkan wajah Anda ke kamera
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. FORM TAMU BARU
  // ==========================================
  if (step === 'form-new') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-y-auto font-sans">
        {/* Header Ringkas */}
        <div className="max-w-lg w-full mx-auto flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white p-1 flex items-center justify-center">
              <img src={glosindoLogo} alt="Glosindo" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-white text-sm">PT GLOSINDO</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{formattedTime} WIB</span>
        </div>

        {/* Kartu Form */}
        <div className="w-full max-w-lg mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-bold text-white">Data Pengunjung</h2>
            <p className="text-xs text-slate-400 mt-1">
              Wajah berhasil diambil. Silakan lengkapi data kunjungan Anda:
            </p>
          </div>

          <form onSubmit={handleSubmitNew} className="space-y-4">
            {/* Nama */}
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
                  autoFocus
                  placeholder="Nama Anda"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Nomor HP */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nomor HP / WhatsApp <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Keperluan */}
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
                  placeholder="Contoh: Bertemu Bapak Joko / Kirim Paket"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              {/* Opsi Pilihan Cepat */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PURPOSE_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectPurpose(item)}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Bertemu Siapa */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bertemu Siapa <span className="text-slate-500 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Nama staf atau divisi"
                  value={formData.meet_person}
                  onChange={(e) => setFormData({ ...formData, meet_person: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Tombol Form */}
            <div className="pt-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={submitting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Simpan & Masuk
              </Button>
            </div>
          </form>
        </div>

        <div className="py-2 text-center text-xs text-slate-600">
          PT Glosindo Digital Guestbook
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. FORM TAMU LAMA (SUDAH DIKENALI)
  // ==========================================
  if (step === 'form-existing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-y-auto font-sans">
        {/* Header Ringkas */}
        <div className="max-w-lg w-full mx-auto flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white p-1 flex items-center justify-center">
              <img src={glosindoLogo} alt="Glosindo" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-white text-sm">PT GLOSINDO</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{formattedTime} WIB</span>
        </div>

        {/* Kartu Form */}
        <div className="w-full max-w-lg mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-medium mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Wajah Dikenali</span>
            </div>
            <h2 className="text-xl text-slate-300 font-normal">Selamat Datang Kembali,</h2>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {visitor?.name}
            </p>
          </div>

          <form onSubmit={handleSubmitExisting} className="space-y-4">
            {/* Keperluan */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Keperluan Kunjungan Hari Ini <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Contoh: Meeting Proyek / Bertemu HRD"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              {/* Opsi Pilihan Cepat */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PURPOSE_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectPurpose(item)}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Bertemu Siapa */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bertemu Siapa <span className="text-slate-500 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Nama staf atau divisi"
                  value={formData.meet_person}
                  onChange={(e) => setFormData({ ...formData, meet_person: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Tombol Form */}
            <div className="pt-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={submitting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Konfirmasi Masuk
              </Button>
            </div>
          </form>
        </div>

        <div className="py-2 text-center text-xs text-slate-600">
          PT Glosindo Digital Guestbook
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. SUKSES CHECK-IN
  // ==========================================
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative font-sans">
        {/* Header Ringkas */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white p-1 flex items-center justify-center">
              <img src={glosindoLogo} alt="Glosindo" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-white text-sm">PT GLOSINDO</span>
          </div>
        </div>

        {/* Kartu Konfirmasi Bersih */}
        <div className="w-full max-w-md mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-white">
              Check-In Berhasil!
            </h2>
            <p className="text-xl font-bold text-cyan-400">
              {visitor ? visitor.name : formData.name}
            </p>
            <p className="text-xs text-slate-400 pt-2">
              Silakan masuk dan temui staf atau resepsionis.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={RotateCcw}
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            >
              Selesai ({countdown}s)
            </Button>
          </div>
        </div>

        <div className="py-2 text-center text-xs text-slate-600">
          Terima kasih atas kunjungan Anda
        </div>
      </div>
    );
  }

  return null;
};

export default GuestVisitPage;
