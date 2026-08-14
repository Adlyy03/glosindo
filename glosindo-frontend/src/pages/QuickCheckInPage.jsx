import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Camera, CheckCircle2, LogOut, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import FaceScanner from '../components/FaceScanner';
import SplashOverlay from '../components/SplashOverlay';
import ConfirmModal from '../components/ConfirmModal';
import visitService from '../services/visitService';
import toast from 'react-hot-toast';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const QuickCheckInPage = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [splashOpen, setSplashOpen] = useState(false);
  const [splashType, setSplashType] = useState('checkin');
  const [visitorName, setVisitorName] = useState('');
  const [reloadSignal, setReloadSignal] = useState(0);
<<<<<<< HEAD
  const [showNoMatchModal, setShowNoMatchModal] = useState(false);
=======
  const [noMatchModal, setNoMatchModal] = useState(false);
>>>>>>> d24414d (push)

  const handleMatchFound = async (visitor) => {
    if (processing) return;
    
    setProcessing(true);
    try {
      // Cek dulu apakah visitor punya active visit
      const activeVisitsRes = await visitService.getActive();
      
      const visitorId = visitor.id || visitor.visitor_id;
      const activeVisit = activeVisitsRes.data?.find(v => v.visitor_id === visitorId);
      
      if (activeVisit) {
        // Ada active visit, lakukan check-out
        await visitService.checkOut(activeVisit.id);
        
        setVisitorName(visitor.name);
        setSplashType('checkout');
        setSplashOpen(true);
        toast.success(`Check-Out Berhasil! ${visitor.name}`, { icon: '👋', id: 'quick-toast' });
      } else {
        // Tidak ada active visit, lakukan check-in
        const checkInData = {
          visitor_id: visitorId,
          purpose: 'Quick Check-In',
          meet_to: '-',
        };
        
        const result = await visitService.checkIn(checkInData);
        
        setVisitorName(visitor.name);
        setSplashType('checkin');
        setSplashOpen(true);
        toast.success(`Check-In Berhasil! ${visitor.name}`, { icon: '✅', id: 'quick-toast' });
      }
      
      // Reload scanner setelah 3 detik
      setTimeout(() => {
        setReloadSignal(prev => prev + 1);
      }, 3000);
      
    } catch (err) {
      console.error('Quick process error:', err);
      const msg = err.response?.data?.message || 'Gagal memproses';
      toast.error(msg, { duration: 5000, id: 'quick-toast' });
    } finally {
      setProcessing(false);
    }
  };

  const handleNoMatch = () => {
<<<<<<< HEAD
    setShowNoMatchModal(true);
  };

  const handleGoToRegister = () => {
    setShowNoMatchModal(false);
    navigate('/check-in/manual');
  };

  const handleStayOnPage = () => {
    setShowNoMatchModal(false);
    setReloadSignal((prev) => prev + 1);
=======
    setNoMatchModal(true);
  };

  const handleRegisterChoice = () => {
    setNoMatchModal(false);
    toast.success('Menuju halaman registrasi tamu...', { icon: '📝' });
    navigate('/check-in/manual');
  };

  const handleStayChoice = () => {
    setNoMatchModal(false);
    toast('Scanner akan dimuat ulang...', { icon: '🔄' });
    setTimeout(() => {
      setReloadSignal(prev => prev + 1);
    }, 500);
>>>>>>> d24414d (push)
  };

  const handleSplashClose = () => {
    setSplashOpen(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <SplashOverlay
        open={splashOpen}
        type={splashType}
        visitorName={visitorName}
        onClose={handleSplashClose}
      />

      <ConfirmModal
        isOpen={showNoMatchModal}
        onClose={handleStayOnPage}
        onConfirm={handleGoToRegister}
        title="Wajah Belum Terdaftar"
        message="Wajah Anda tidak ditemukan di sistem database. Pilih opsi untuk mendaftar tamu baru atau tetap berada di halaman ini."
        confirmText="Ke Halaman Tamu Baru"
        cancelText="Tetap di Halaman Ini"
        type="warning"
      />

      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Express Quick Check-In / Out
            </h1>
            <Badge variant="cyan" dot>Express Mode</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Scan wajah langsung untuk check-in atau check-out otomatis serba cepat tanpa perlu pengisian form.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 rounded-2xl bg-brand-navy/10 px-4 py-2.5 text-xs font-bold text-brand-navy border border-brand-navy/20 self-start md:self-center">
          <Zap className="w-4 h-4 text-brand-cyan" />
          <span>Sistem Serba Otomatis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scanner Card */}
        <Card className="lg:col-span-7 xl:col-span-8 p-6 md:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-cyan text-white shadow-xs">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Camera Express Scan</h2>
                <p className="text-xs text-slate-500 font-medium">Verifikasi wajah otomatis</p>
              </div>
            </div>
            <Badge variant="cyan">Auto Mode</Badge>
          </div>
          
          {!splashOpen && (
            <FaceScanner
              onMatchFound={handleMatchFound}
              onNoMatch={handleNoMatch}
              reloadSignal={reloadSignal}
              silentMode={true}
              paused={processing || splashOpen || showNoMatchModal}
            />
          )}
          
          {splashOpen && (
            <div className="flex items-center justify-center min-h-[380px] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center">
              <div>
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-slate-900 font-bold text-base">Proses Berhasil</h3>
                <p className="text-slate-500 text-xs mt-1">Kamera sementara dinonaktifkan saat modal terbuka.</p>
              </div>
            </div>
          )}
          
          {processing && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-navy text-white text-xs font-bold shadow-lg animate-pulse">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Memproses Data Kunjungan...</span>
              </div>
            </div>
          )}
        </Card>

        {/* Info Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          <Card padding="p-6">
            <CardHeader className="flex items-center gap-2 pb-3 mb-3">
              <Zap className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Alur Kerja Express
              </h3>
            </CardHeader>
            <div className="space-y-4 text-xs md:text-sm text-slate-600 font-medium">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-800 flex-shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">1. Arahkan Wajah</p>
                  <p className="text-slate-500 text-xs mt-0.5">Berdiri tegak di depan kamera kiosk.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 flex-shrink-0">
                  <LogIn className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">2. Belum Check-In → Auto IN</p>
                  <p className="text-slate-500 text-xs mt-0.5">Sistem otomatis melakukan check-in instan.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-800 flex-shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">3. Sudah Check-In → Auto OUT</p>
                  <p className="text-slate-500 text-xs mt-0.5">Sistem merubah status kunjungan menjadi selesai.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="p-6" className="bg-slate-900 text-white border-none shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-brand-cyan text-white flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Catatan Penting Kiosk</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Untuk mendaftarkan tamu baru atau memasukkan keperluan khusus secara spesifik, gunakan menu <strong>Check-In Tamu</strong>.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Wajah Tidak Terdaftar */}
      {noMatchModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale transform transition-all duration-200">
            {/* Header dengan icon */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center ring-4 ring-white/30">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Wajah Belum Terdaftar
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-slate-600 text-center mb-6 leading-relaxed">
                Wajah Anda tidak ditemukan dalam sistem. Apakah Anda ingin mendaftar sebagai tamu baru?
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRegisterChoice}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-navy to-blue-700 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Daftar Jadi Tamu</span>
                </button>

                <button
                  onClick={handleStayChoice}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-base hover:bg-slate-200 active:bg-slate-300 transition-all duration-200"
                >
                  <Camera className="w-5 h-5" />
                  <span>Tetap di Sini</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickCheckInPage;
