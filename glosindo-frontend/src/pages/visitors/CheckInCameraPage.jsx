import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  Info,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Clock,
  Sparkles,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import FaceScanner from '../../components/FaceScanner';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import reservationService from '../../services/reservationService';

const CheckInCameraPage = () => {
  const [matchedVisitor, setMatchedVisitor] = useState(null);
  const [noMatchDetected, setNoMatchDetected] = useState(false);
  const [reloadSignal, setReloadSignal] = useState(0);
  const [checkingReservation, setCheckingReservation] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const navigate = useNavigate();
  const resetTimerRef = useRef(null);

  const handleMatchFound = async (visitor) => {
    const normalizedVisitor = {
      ...visitor,
      id: visitor.id || visitor.visitor_id,
    };

    setNoMatchDetected(false);
    setDuplicateWarning(null);

    // 1. If currently showing reservation success, ignore subsequent scans
    if (reservationSuccess || checkingReservation) {
      return;
    }

    setCheckingReservation(true);
    try {
      // 2. Query auto check-in for active pre-registration
      const res = await reservationService.autoCheckIn({ visitor_id: normalizedVisitor.id });

      if (res.success && res.checked_in) {
        // Active reservation found and auto check-in confirmed!
        setReservationSuccess(res.data);
        setMatchedVisitor(normalizedVisitor);
        toast.success(`Check-In Reservasi Berhasil! Selamat datang, ${res.data.visitor?.name || normalizedVisitor.name}.`, {
          duration: 5000,
          icon: '✅',
        });

        // Auto reset kiosk after 6 seconds for the next visitor
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => {
          handleDismissSuccess();
        }, 6000);
        return;
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.already_checked_in) {
        // Prevent double check-in
        setDuplicateWarning(data.message || 'Tamu ini sudah melakukan check-in hari ini.');
        toast.error(data.message || 'Check-in ganda ditolak.', { duration: 5000 });
        return;
      } else if (data?.is_expired) {
        toast('Reservasi telah kedaluwarsa. Mengarahkan ke form manual...', { icon: '⚠️' });
        navigate('/check-in/manual', { state: { visitor: normalizedVisitor } });
        return;
      } else {
        // No active reservation found: fallback to regular manual check-in form
        setMatchedVisitor(normalizedVisitor);
        navigate('/check-in/manual', { state: { visitor: normalizedVisitor } });
        return;
      }
    } finally {
      setCheckingReservation(false);
    }
  };

  const handleNoMatch = () => {
    setMatchedVisitor(null);
    setNoMatchDetected(true);
  };

  const handleDismissSuccess = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setReservationSuccess(null);
    setMatchedVisitor(null);
    setReloadSignal((prev) => prev + 1);
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fadeIn w-full max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Biometric Face Check-In
            </h1>
            <Badge variant="cyan" dot>Live Kiosk</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Scan wajah tamu menggunakan AI camera untuk verifikasi otomatis dan mempercepat proses masuk.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to="/check-in/manual" className="w-full sm:w-auto">
            <Button variant="outline" size="md" icon={UserPlus} className="w-full sm:w-auto">
              Check-In Manual / Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Kiosk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Camera Scanner Container */}
        <Card className="lg:col-span-7 xl:col-span-8 p-6 md:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-navy text-white shadow-xs">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Live Camera Kiosk</h2>
                <p className="text-xs text-slate-500 font-medium">Arahkan wajah ke kamera depan</p>
              </div>
            </div>
            <Badge variant="navy">Auto Scan</Badge>
          </div>

          <FaceScanner
            onMatchFound={handleMatchFound}
            onNoMatch={handleNoMatch}
            reloadSignal={reloadSignal}
            paused={!!reservationSuccess || checkingReservation}
          />
        </Card>

        {/* Right Info & Status Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Reservation Auto-CheckIn Success Card */}
          {reservationSuccess ? (
            <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-xl space-y-4 animate-scaleIn border border-emerald-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    Check-In Berhasil
                  </span>
                </div>
                <span className="text-[11px] bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded-full font-mono">
                  {reservationSuccess.reservation?.reservation_code}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black leading-tight">
                  {reservationSuccess.visitor?.name || matchedVisitor?.name}
                </h3>
                <p className="text-sm text-emerald-100 mt-1 font-medium">
                  {reservationSuccess.visitor?.company || matchedVisitor?.company || 'Tamu Kunjungan'}
                </p>
              </div>

              <div className="bg-emerald-700/60 rounded-2xl p-3.5 text-xs text-emerald-50 space-y-1.5 border border-emerald-500/40">
                <div className="flex justify-between">
                  <span className="text-emerald-200">Keperluan:</span>
                  <span className="font-semibold text-right">{reservationSuccess.reservation?.purpose || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Menemui:</span>
                  <span className="font-semibold text-right">{reservationSuccess.reservation?.meet_to || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Waktu Masuk:</span>
                  <span className="font-semibold text-right">
                    {new Date(reservationSuccess.visit?.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={handleDismissSuccess}
                  className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold border-0"
                >
                  Selesai
                </Button>
              </div>
            </div>
          ) : duplicateWarning ? (
            <div className="bg-amber-500 text-white rounded-3xl p-6 shadow-xl space-y-3 animate-scaleIn">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                  Check-In Ganda Ditolak
                </span>
              </div>
              <p className="text-sm font-medium text-amber-50 leading-relaxed">
                {duplicateWarning}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDuplicateWarning(null)}
                className="bg-white/90 text-amber-900 font-bold hover:bg-white text-xs mt-2"
              >
                Pindai Ulang
              </Button>
            </div>
          ) : noMatchDetected ? (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-md space-y-4 animate-scaleIn">
              <div className="flex items-center gap-2.5 text-amber-800">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Wajah Belum Terdaftar
                </span>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed font-medium">
                Wajah tidak ditemukan di database. Lanjutkan ke pendaftaran tamu baru.
              </p>
              <Link to="/check-in/manual" className="block">
                <Button variant="secondary" size="lg" fullWidth icon={UserPlus}>
                  Daftar Tamu Baru
                </Button>
              </Link>
            </div>
          ) : (
            <Card className="bg-slate-50/70 border-dashed border-slate-300 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white text-brand-navy border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Camera className="w-6 h-6 text-brand-cyan" />
              </div>
              <h3 className="text-slate-900 font-bold text-base mb-1">Menunggu Pemindaian</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Posisikan wajah di tengah lingkaran bingkai kamera untuk verifikasi dan auto check-in.
              </p>
            </Card>
          )}

          {/* Guidelines Card */}
          <Card padding="p-6">
            <CardHeader className="flex items-center gap-2 pb-3 mb-3">
              <Info className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Petunjuk Pemindaian
              </h3>
            </CardHeader>
            <ul className="space-y-3 text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-navy/10 text-brand-navy text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Pastikan pencahayaan ruangan cukup terang.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-navy/10 text-brand-navy text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>Tamu dengan reservasi online otomatis check-in instan tanpa perlu isi form.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-navy/10 text-brand-navy text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Sistem secara otomatis memindai setiap 5 detik.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckInCameraPage;
