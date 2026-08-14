import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { UserCheck, RefreshCw, LogOut, Camera, ShieldCheck, Clock, User, X } from 'lucide-react';
import FaceScanner from '../components/FaceScanner';
import SuccessScreen from '../components/SplashOverlay';
import visitService from '../services/visitService';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Jakarta');

const ActiveVisitorPage = () => {
  const [activeVisits, setActiveVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOutId, setCheckingOutId] = useState(null);
  const [verificationVisit, setVerificationVisit] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [splashOpen, setSplashOpen] = useState(false);
  const [splashVisitorName, setSplashVisitorName] = useState('');
  const [splashMeta, setSplashMeta] = useState({});

  const fetchActive = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await visitService.getActive();
      setActiveVisits(res.data || []);
    } catch (err) {
      if (!isSilent) toast.error('Gagal memuat daftar tamu aktif');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();

    // Polling interval every 15 seconds — PRESERVED LOGIC
    const interval = setInterval(() => {
      fetchActive(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchActive]);

  const handleScanMatch = async (visitor) => {
    if (checkingOutId || splashOpen) return;

    if (!verificationVisit) {
      setVerificationMessage(`Tamu ${visitor.name} teridentifikasi, tetapi tidak ada sesi checkout aktif.`);
      return;
    }

    const expectedVisitorId = verificationVisit.visitor?.id || verificationVisit.visitor_id;
    if (visitor.visitor_id !== expectedVisitorId) {
      setVerificationError('Wajah tidak cocok dengan tamu yang dipilih untuk checkout. Coba lagi.');
      return;
    }

    setCheckingOutId(verificationVisit.id);
    try {
      await visitService.checkOut(verificationVisit.id);
      toast.success(`Check-Out Berhasil! ${verificationVisit.visitor?.name} telah keluar.`, {
        icon: '👋',
        id: 'visit-checkout-toast',
      });
      setSplashVisitorName(verificationVisit.visitor?.name || 'Tamu');
      setSplashMeta({ checkOutTime: new Date() });
      setSplashOpen(true);
      setVerificationMessage(`Checkout ${verificationVisit.visitor?.name} selesai.`);
      setVerificationVisit(null);
      setVerificationError('');
      fetchActive();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal melakukan check-out', {
        id: 'visit-checkout-toast',
      });
    } finally {
      setCheckingOutId(null);
    }
  };

  const handleScanNoMatch = () => {
    setVerificationError('Wajah tidak terdaftar. Pastikan wajah jelas saat scan.');
  };

  const handleCheckout = (visit) => {
    setVerificationVisit(visit);
    setVerificationMessage(`Scan wajah ${visit.visitor?.name || 'tamu'} untuk verifikasi checkout.`);
    setVerificationError('');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tamu Aktif Di Lokasi
            </h1>
            <Badge variant="emerald" dot>Realtime Live</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Daftar pengunjung yang sedang berada di dalam gedung (Status: IN). Sinkronisasi otomatis 15 detik.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          loading={loading}
          onClick={() => fetchActive()}
          icon={RefreshCw}
        >
          Refresh Data
        </Button>
      </div>

      {/* Verification Scanner Modal Overlay if activated */}
      {verificationVisit && (
        <Card padding="p-6 md:p-8" className="border-2 border-brand-cyan shadow-2xl bg-cyan-50/30 animate-scaleIn">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-cyan-200">
            <div className="flex items-center gap-2 text-brand-navy">
              <Camera className="w-5 h-5 text-brand-cyan" />
              <h2 className="text-base font-bold">Verifikasi Face Biometric Check-Out</h2>
            </div>
            <button
              onClick={() => setVerificationVisit(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7">
              <FaceScanner
                onMatchFound={handleScanMatch}
                onNoMatch={handleScanNoMatch}
                paused={checkingOutId !== null || splashOpen}
              />
            </div>
            <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Target Checkout
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {verificationVisit.visitor?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {verificationVisit.visitor?.company || 'Pribadi'} • Bertemu: {verificationVisit.meet_to}
                </p>
              </div>

              {verificationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {verificationError}
                </div>
              )}

              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => setVerificationVisit(null)}
              >
                Batal Verifikasi
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Active Visitors Card */}
      <Card padding="p-0" className="overflow-hidden">
        <SuccessScreen
          open={splashOpen}
          type="checkout"
          visitorName={splashVisitorName}
          meta={splashMeta}
          onClose={() => setSplashOpen(false)}
        />

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-xs font-semibold">Memuat daftar tamu aktif...</p>
          </div>
        ) : activeVisits.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-xs">
              <UserCheck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Tidak Ada Tamu Aktif</h3>
            <p className="text-xs text-slate-400 mt-1">Saat ini seluruh pengunjung gedung telah melakukan check-out.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                    <th className="px-6 py-4">Nama Tamu</th>
                    <th className="px-6 py-4">Bertemu Dengan</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Maksud Keperluan</th>
                    <th className="px-6 py-4">Waktu Masuk (IN)</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                            {visit.visitor?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{visit.visitor?.name}</p>
                            <p className="text-xs text-slate-400">{visit.visitor?.company || 'Pribadi'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-800">
                        {visit.meet_to}
                      </td>

                      <td className="px-6 py-4 text-slate-600 max-w-xs hidden lg:table-cell">
                        <p className="truncate text-xs font-medium">{visit.purpose}</p>
                      </td>

                      <td className="px-6 py-4 text-xs font-bold text-brand-navy">
                        <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                          {dayjs(visit.check_in).format('HH:mm — D MMM')}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          loading={checkingOutId === visit.id}
                          onClick={() => handleCheckout(visit)}
                          icon={LogOut}
                        >
                          Check-Out
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {activeVisits.map((visit) => (
                <div key={visit.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                        {visit.visitor?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{visit.visitor?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{visit.visitor?.company || 'Pribadi'}</p>
                      </div>
                    </div>
                    <Badge variant="emerald" dot>IN</Badge>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bertemu:</span>
                      <span className="font-bold text-slate-900">{visit.meet_to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Keperluan:</span>
                      <span className="text-slate-700 truncate max-w-[60%]">{visit.purpose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Masuk:</span>
                      <span className="font-bold text-brand-navy">{dayjs(visit.check_in).format('HH:mm — D MMM')}</span>
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    size="md"
                    fullWidth
                    loading={checkingOutId === visit.id}
                    onClick={() => handleCheckout(visit)}
                    icon={LogOut}
                  >
                    Check-Out (OUT)
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ActiveVisitorPage;
