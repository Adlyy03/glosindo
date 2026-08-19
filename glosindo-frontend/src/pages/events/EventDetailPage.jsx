import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  CalendarRange, Clock, MapPin, User, Users, CheckCircle2,
  LogOut, LogIn, Hourglass, Building2, ArrowLeft, Pencil, RefreshCw,
  Camera, Zap, AlertCircle, ArrowRight
} from 'lucide-react';
import eventService from '../../services/eventService';
import visitService from '../../services/visitService';
import useAuthStore from '../../store/authStore';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import FaceScanner from '../../components/FaceScanner';
import SplashOverlay from '../../components/SplashOverlay';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',      variant: 'neutral' },
  scheduled: { label: 'Terjadwal',  variant: 'navy' },
  ongoing:   { label: 'Berlangsung',variant: 'emerald', dot: true },
  finished:  { label: 'Selesai',    variant: 'neutral' },
  cancelled: { label: 'Dibatalkan', variant: 'danger' },
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisor = user?.role === 'supervisor';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('participants');

  // Quick scan state
  const [processing, setProcessing] = useState(false);
  const [splashOpen, setSplashOpen] = useState(false);
  const [splashType, setSplashType] = useState('checkin');
  const [visitorName, setVisitorName] = useState('');
  const [reloadSignal, setReloadSignal] = useState(0);
  const [noMatchModal, setNoMatchModal] = useState(false);
  const [earlyCheckoutModal, setEarlyCheckoutModal] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const noMatchShown = useRef(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventService.getById(id);
      setData(res.data?.data);
    } catch {
      toast.error('Gagal memuat detail event');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  // ─── Quick Scan handlers ────────────────────────────────────────────────
  const handleMatchFound = useCallback(async (visitor) => {
    if (processing) return;
    setProcessing(true);
    try {
      const activeVisitsRes = await visitService.getActive();
      const visitorId = visitor.id || visitor.visitor_id;
      const activeVisit = activeVisitsRes.data?.find(v => v.visitor_id === visitorId);

      if (activeVisit) {
        const durationMinutes = (Date.now() - new Date(activeVisit.check_in)) / 60000;
        if (durationMinutes < 60) {
          setPendingCheckout({ visitor, visitId: activeVisit.id, durationMinutes });
          setEarlyCheckoutModal(true);
          setProcessing(false);
          return;
        }
        await visitService.checkOut(activeVisit.id);
        setVisitorName(visitor.name);
        setSplashType('checkout');
        setSplashOpen(true);
        toast.success(`Check-Out Berhasil! ${visitor.name}`, { icon: '👋', id: 'quick-toast' });
      } else {
        await visitService.checkIn({
          visitor_id: visitorId,
          purpose: `Check-In Event: ${data?.event?.name || id}`,
          meet_to: '-',
          event_id: Number(id),
        });
        setVisitorName(visitor.name);
        setSplashType('checkin');
        setSplashOpen(true);
        toast.success(`Check-In Berhasil! ${visitor.name}`, { icon: '✅', id: 'quick-toast' });
      }
      setTimeout(() => {
        setReloadSignal(prev => prev + 1);
        loadDetail();
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses', { duration: 5000, id: 'quick-toast' });
    } finally {
      setProcessing(false);
    }
  }, [processing, id, data]);

  const handleNoMatch = useCallback(() => {
    if (noMatchShown.current) return;
    noMatchShown.current = true;
    setNoMatchModal(true);
  }, []);

  const handleStayChoice = () => {
    noMatchShown.current = false;
    setNoMatchModal(false);
    setTimeout(() => setReloadSignal(prev => prev + 1), 500);
  };

  const handleConfirmEarlyCheckout = async () => {
    if (!pendingCheckout) return;
    setEarlyCheckoutModal(false);
    setProcessing(true);
    try {
      await visitService.checkOut(pendingCheckout.visitId);
      setVisitorName(pendingCheckout.visitor.name);
      setSplashType('checkout');
      setSplashOpen(true);
      toast.success(`Check-Out Berhasil! ${pendingCheckout.visitor.name}`, { icon: '👋', id: 'quick-toast' });
      setTimeout(() => { setReloadSignal(prev => prev + 1); loadDetail(); }, 3000);
    } catch (err) {
      toast.error('Gagal check-out', { duration: 5000 });
    } finally {
      setPendingCheckout(null);
      setProcessing(false);
    }
  };

  const handleCancelEarlyCheckout = () => {
    setEarlyCheckoutModal(false);
    setPendingCheckout(null);
    setProcessing(false);
    setTimeout(() => setReloadSignal(prev => prev + 1), 500);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-xs font-semibold">Memuat data detail event...</p>
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-700 font-bold">Event tidak ditemukan.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/events')}>
          Kembali ke Daftar Event
        </Button>
      </div>
    );
  }

  const { event, statistics, participants = [] } = data;
  const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/events')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{event.name}</h1>
              <Badge variant={statusCfg.variant} dot={statusCfg.dot}>{statusCfg.label}</Badge>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              {event.description || 'Tidak ada deskripsi event.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <Button variant="outline" size="md" icon={RefreshCw} onClick={loadDetail}>
            Refresh
          </Button>
          {!isSupervisor && (
            <Button variant="primary" size="md" icon={Pencil} onClick={() => navigate(`/events/${event.id}/edit`)}>
              Edit Event
            </Button>
          )}
        </div>
      </div>

      {/* Info Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-50 text-brand-navy">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Tanggal</p>
            <p className="text-sm font-bold text-slate-800">{dayjs(event.event_date).format('DD MMMM YYYY')}</p>
          </div>
        </Card>

        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Waktu</p>
            <p className="text-sm font-bold text-slate-800">{event.start_time?.slice(0,5)} - {event.end_time?.slice(0,5)} WIB</p>
          </div>
        </Card>

        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Lokasi</p>
            <p className="text-sm font-bold text-slate-800">{event.location || '-'}</p>
          </div>
        </Card>

        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Pembuat Event</p>
            <p className="text-sm font-bold text-slate-800">{event.creator?.name || '-'}</p>
          </div>
        </Card>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card padding="p-4" className="text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Peserta</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{statistics?.total_visitors || 0}</p>
        </Card>
        <Card padding="p-4" className="text-center bg-emerald-50/50 border-emerald-100">
          <p className="text-[11px] font-bold text-emerald-600 uppercase">Check-In</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{statistics?.checked_in || 0}</p>
        </Card>
        <Card padding="p-4" className="text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Check-Out</p>
          <p className="text-2xl font-extrabold text-slate-700 mt-1">{statistics?.checked_out || 0}</p>
        </Card>
        <Card padding="p-4" className="text-center bg-blue-50/50 border-blue-100">
          <p className="text-[11px] font-bold text-brand-navy uppercase">Masih di Lokasi</p>
          <p className="text-2xl font-extrabold text-brand-navy mt-1">{statistics?.still_inside || 0}</p>
        </Card>
        <Card padding="p-4" className="text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Rata-rata Durasi</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">
            {statistics?.avg_duration ? `${statistics.avg_duration} m` : '-'}
          </p>
        </Card>
        <Card padding="p-4" className="text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Perusahaan</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{statistics?.companies_count || 0}</p>
        </Card>
      </div>

      {/* Splash overlay untuk quick scan */}
      <SplashOverlay
        open={splashOpen}
        type={splashType}
        visitorName={visitorName}
        onClose={() => setSplashOpen(false)}
      />

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs w-fit">
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'participants'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Daftar Peserta
        </button>
        {!useAuthStore.getState().isFeatureDisabled('quick_checkin') && (
          <button
            onClick={() => setActiveTab('quickscan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'quickscan'
                ? 'bg-brand-cyan text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Camera className="w-4 h-4" />
            Quick Scan
            <Badge variant="cyan" className="text-[10px] px-1.5 py-0.5">Express</Badge>
          </button>
        )}
      </div>

      {/* ── Tab: Daftar Peserta ── */}
      {activeTab === 'participants' && (
      <Card padding="p-0" className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-navy" />
            <h2 className="text-base font-bold text-slate-900">Daftar Tamu / Peserta Event</h2>
          </div>
          <Badge variant="neutral">{participants.length} Tamu Terdaftar</Badge>
        </div>

        {participants.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-600">Belum ada tamu yang check-in untuk event ini.</p>
            <p className="text-xs mt-1">Gunakan Quick Scan atau menu Check-In Tamu dan pilih event ini saat tamu hadir.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Nama Tamu</th>
                  <th className="px-6 py-4">Perusahaan</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4 text-center">Durasi</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{item.visitor?.name || '-'}</p>
                      {item.visitor?.phone && <p className="text-xs text-slate-400">{item.visitor.phone}</p>}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {item.visitor?.company || 'Pribadi'}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {dayjs(item.check_in).format('DD/MM/YY HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {item.check_out ? dayjs(item.check_out).format('DD/MM/YY HH:mm') : '—'}
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-700">
                      {item.duration !== null ? `${item.duration} mnt` : '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.status === 'IN' ? (
                        <Badge variant="emerald" dot>Di Lokasi</Badge>
                      ) : (
                        <Badge variant="neutral">Selesai</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      )}

      {/* ── Tab: Quick Scan ── */}
      {activeTab === 'quickscan' && !useAuthStore.getState().isFeatureDisabled('quick_checkin') && (
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
                  <p className="text-xs text-slate-500 font-medium">Check-in/out tamu event via wajah</p>
                </div>
              </div>
              <Badge variant="cyan">Event: {event.name}</Badge>
            </div>

            <div className={splashOpen ? 'hidden' : ''}>
              <FaceScanner
                onMatchFound={handleMatchFound}
                onNoMatch={handleNoMatch}
                reloadSignal={reloadSignal}
                silentMode={true}
                paused={processing || splashOpen || noMatchModal || earlyCheckoutModal || activeTab !== 'quickscan'}
              />
            </div>

            {splashOpen && (
              <div className="flex items-center justify-center min-h-[380px] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center">
                <div>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-base">Proses Berhasil</h3>
                  <p className="text-slate-500 text-xs mt-1">Memuat ulang data event...</p>
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

          {/* Info Panel */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">
            <Card padding="p-6">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <Zap className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Alur Quick Scan</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-600 font-medium">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0"><Camera className="w-4 h-4" /></div>
                  <div>
                    <p className="font-bold text-slate-900">1. Arahkan Wajah</p>
                    <p className="text-slate-500 mt-0.5">Berdiri di depan kamera.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 flex-shrink-0"><LogIn className="w-4 h-4" /></div>
                  <div>
                    <p className="font-bold text-slate-900">2. Belum Check-In → Auto IN</p>
                    <p className="text-slate-500 mt-0.5">Check-in otomatis ke event ini.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-800 flex-shrink-0"><LogOut className="w-4 h-4" /></div>
                  <div>
                    <p className="font-bold text-slate-900">3. Sudah Check-In → Auto OUT</p>
                    <p className="text-slate-500 mt-0.5">Check-out otomatis.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="p-5" className="bg-brand-navy/5 border-brand-navy/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-brand-navy" />
                <p className="text-xs font-bold text-brand-navy">Event Aktif</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Semua check-in via scanner ini akan otomatis tercatat ke event <strong>{event.name}</strong>.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Modal: Wajah tidak terdaftar */}
      {noMatchModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/30">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Wajah Belum Terdaftar</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-600 text-center mb-6">Wajah tidak ditemukan dalam sistem.</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { noMatchShown.current = false; setNoMatchModal(false); navigate('/check-in/manual'); }}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-navy to-blue-700 text-white font-bold"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Daftar Jadi Tamu</span>
                </button>
                <button onClick={handleStayChoice} className="w-full px-6 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">
                  Tetap di Sini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Early checkout */}
      {earlyCheckoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/30">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Durasi Kunjungan Singkat</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-600 text-center mb-2">Baru saja check-in <strong className="text-red-600">kurang dari 1 jam</strong>.</p>
              {pendingCheckout?.durationMinutes !== undefined && (
                <p className="text-slate-500 text-sm text-center mb-4">
                  Durasi: <strong>{Math.floor(pendingCheckout.durationMinutes)} menit</strong>
                </p>
              )}
              <p className="text-slate-700 text-center mb-6 font-semibold">Yakin ingin check-out sekarang?</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleConfirmEarlyCheckout} className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold">
                  <LogOut className="w-5 h-5" />
                  <span>Ya, Check-Out Sekarang</span>
                </button>
                <button onClick={handleCancelEarlyCheckout} className="w-full px-6 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">
                  Tetap di Sini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;