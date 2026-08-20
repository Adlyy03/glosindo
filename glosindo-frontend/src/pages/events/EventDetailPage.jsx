import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  CalendarRange, Clock, MapPin, User, Users, CheckCircle2,
  LogOut, LogIn, Hourglass, Building2, ArrowLeft, Pencil, RefreshCw,
  Camera, Zap, AlertCircle, ArrowRight, Copy, Check, ExternalLink,
  Search, UserPlus, Filter, ShieldCheck, Tag, Trash2, Mail, Phone, Briefcase
} from 'lucide-react';
import eventService from '../../services/eventService';
import visitService from '../../services/visitService';
import useAuthStore from '../../store/authStore';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import FaceScanner from '../../components/FaceScanner';
import SplashOverlay from '../../components/SplashOverlay';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',       variant: 'neutral' },
  scheduled: { label: 'Terjadwal',   variant: 'navy' },
  ongoing:   { label: 'Berlangsung', variant: 'emerald', dot: true },
  active:    { label: 'Aktif',       variant: 'emerald', dot: true },
  finished:  { label: 'Selesai',     variant: 'neutral' },
  cancelled: { label: 'Dibatalkan',  variant: 'danger' },
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisor = user?.role === 'supervisor';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('participants');

  // Search & filter participants
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantStatusFilter, setParticipantStatusFilter] = useState('');

  // Copy link state
  const [copiedLink, setCopiedLink] = useState(false);

  // Manual participant add modal
  const [addModal, setAddModal] = useState(false);
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [partForm, setPartForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    position: '',
  });

  // Action loading for specific participant check-in/out
  const [actionLoadingId, setActionLoadingId] = useState(null);

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

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleCopyLink = () => {
    if (!data?.event) return;
    const code = data.event.code || data.event.id;
    const url = `${window.location.origin}/event/${code}/register`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      toast.success('Link registrasi publik disalin!', { icon: '🔗' });
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      toast.error('Gagal menyalin link');
    });
  };

  // ─── Participant Actions (Check-In & Check-Out) ──────────────────────────
  const handleCheckInParticipant = async (participantId) => {
    setActionLoadingId(participantId);
    try {
      await eventService.checkInParticipant(id, participantId);
      toast.success('Peserta berhasil check-in!', { icon: '✅' });
      loadDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal check-in peserta');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckOutParticipant = async (participantId) => {
    setActionLoadingId(participantId);
    try {
      await eventService.checkOutParticipant(id, participantId);
      toast.success('Peserta berhasil check-out!', { icon: '👋' });
      loadDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal check-out peserta');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteParticipant = async (participantId) => {
    if (!window.confirm('Yakin ingin menghapus peserta ini dari event?')) return;
    try {
      await eventService.deleteParticipant(id, participantId);
      toast.success('Peserta berhasil dihapus dari event');
      loadDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus peserta');
    }
  };

  const handleAddParticipantSubmit = async (e) => {
    e.preventDefault();
    if (!partForm.name.trim() || !partForm.phone.trim()) {
      toast.error('Nama dan nomor HP wajib diisi');
      return;
    }

    setAddingParticipant(true);
    try {
      await eventService.storeParticipant(id, partForm);
      toast.success('Peserta berhasil ditambahkan');
      setAddModal(false);
      setPartForm({ name: '', phone: '', email: '', company: '', position: '' });
      loadDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan peserta');
    } finally {
      setAddingParticipant(false);
    }
  };

  // ─── Quick Scan handlers ────────────────────────────────────────────────
  const handleMatchFound = useCallback(async (visitor) => {
    if (processing) return;
    setProcessing(true);
    try {
      const activeVisitsRes = await visitService.getActive();
      const visitorId = visitor.id || visitor.visitor_id;
      const activeVisit = activeVisitsRes.data?.find((v) => v.visitor_id === visitorId);

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
          purpose: `Event: ${data?.event?.name || id}`,
          meet_to: `Event: ${data?.event?.name || id}`,
          event_id: Number(data?.event?.id || id),
        });
        setVisitorName(visitor.name);
        setSplashType('checkin');
        setSplashOpen(true);
        toast.success(`Check-In Berhasil! ${visitor.name}`, { icon: '✅', id: 'quick-toast' });
      }
      setTimeout(() => {
        setReloadSignal((prev) => prev + 1);
        loadDetail();
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses', { duration: 5000, id: 'quick-toast' });
    } finally {
      setProcessing(false);
    }
  }, [processing, id, data, loadDetail]);

  const handleNoMatch = useCallback(() => {
    if (noMatchShown.current) return;
    noMatchShown.current = true;
    setNoMatchModal(true);
  }, []);

  const handleStayChoice = () => {
    noMatchShown.current = false;
    setNoMatchModal(false);
    setTimeout(() => setReloadSignal((prev) => prev + 1), 500);
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
      setTimeout(() => {
        setReloadSignal((prev) => prev + 1);
        loadDetail();
      }, 3000);
    } catch {
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
    setTimeout(() => setReloadSignal((prev) => prev + 1), 500);
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
  const startDate = event.start_date || event.event_date;
  const endDate = event.end_date || startDate;
  const publicRegUrl = `${window.location.origin}/event/${event.code || event.id}/register`;

  // Filter participants in frontend
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      !participantSearch ||
      p.name?.toLowerCase().includes(participantSearch.toLowerCase()) ||
      p.phone?.includes(participantSearch) ||
      p.email?.toLowerCase().includes(participantSearch.toLowerCase()) ||
      p.company?.toLowerCase().includes(participantSearch.toLowerCase()) ||
      p.position?.toLowerCase().includes(participantSearch.toLowerCase());

    const matchesStatus =
      !participantStatusFilter || p.status === participantStatusFilter;

    return matchesSearch && matchesStatus;
  });

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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{event.name}</h1>
              <Badge variant={statusCfg.variant} dot={statusCfg.dot}>{statusCfg.label}</Badge>
              {event.code && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {event.code}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              {event.description || 'Tidak ada deskripsi event.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
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

      {/* Public Registration Link Banner Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-brand-navy rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Tag className="w-4 h-4" />
            <span>Tautan Registrasi Publik Mandiri</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">
            Bagikan tautan ini kepada calon tamu/peserta untuk melakukan pra-pendaftaran mandiri secara online.
          </p>
          <p className="text-xs text-cyan-200 font-mono break-all pt-1 select-all">
            {publicRegUrl}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="outline"
            size="md"
            icon={copiedLink ? Check : Copy}
            onClick={handleCopyLink}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            {copiedLink ? 'Link Tersalin!' : 'Copy Link Registrasi'}
          </Button>
          <a
            href={publicRegUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            title="Buka Halaman Registrasi"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Info Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-50 text-brand-navy">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Tanggal Pelaksanaan</p>
            <p className="text-sm font-bold text-slate-800">
              {dayjs(startDate).format('DD MMM YYYY')}
              {endDate && endDate !== startDate && ` - ${dayjs(endDate).format('DD MMM YYYY')}`}
            </p>
          </div>
        </Card>

        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Waktu Kegiatan</p>
            <p className="text-sm font-bold text-slate-800">
              {event.start_time?.slice(0, 5)} - {event.end_time?.slice(0, 5)} WIB
            </p>
          </div>
        </Card>

        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Lokasi Ruangan</p>
            <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">
              {event.location || '-'}
            </p>
          </div>
        </Card>

        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Dibuat Oleh</p>
            <p className="text-sm font-bold text-slate-800">{event.creator?.name || 'Admin'}</p>
          </div>
        </Card>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card padding="p-4" className="text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Terdaftar</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {statistics?.total_participants || participants.length || 0}
          </p>
        </Card>
        <Card padding="p-4" className="text-center bg-emerald-50/50 border-emerald-100">
          <p className="text-[11px] font-bold text-emerald-600 uppercase">Sudah Check-In</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{statistics?.checked_in || 0}</p>
        </Card>
        <Card padding="p-4" className="text-center bg-amber-50/50 border-amber-100">
          <p className="text-[11px] font-bold text-amber-600 uppercase">Belum Check-In</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">
            {statistics?.registered_only !== undefined ? statistics.registered_only : Math.max(0, (statistics?.total_participants || 0) - (statistics?.checked_in || 0))}
          </p>
        </Card>
        <Card padding="p-4" className="text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Check-Out</p>
          <p className="text-2xl font-extrabold text-slate-700 mt-1">{statistics?.checked_out || 0}</p>
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
          Daftar Peserta Event ({participants.length})
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
            Express Face Scan
            <Badge variant="cyan" className="text-[10px] px-1.5 py-0.5">Express</Badge>
          </button>
        )}
      </div>

      {/* ── Tab: Daftar Peserta ── */}
      {activeTab === 'participants' && (
        <div className="space-y-4">
          {/* Search & Action Bar */}
          <Card padding="p-4 md:p-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
                <div className="relative w-full sm:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Cari peserta, HP, email, instansi..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
                  />
                </div>

                <select
                  value={participantStatusFilter}
                  onChange={(e) => setParticipantStatusFilter(e.target.value)}
                  className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
                >
                  <option value="">Semua Status</option>
                  <option value="registered">Belum Check-In (Terdaftar)</option>
                  <option value="checked_in">Sudah Check-In (Di Lokasi)</option>
                  <option value="checked_out">Selesai (Check-Out)</option>
                </select>
              </div>

              {!isSupervisor && (
                <Button
                  variant="primary"
                  size="md"
                  icon={UserPlus}
                  onClick={() => setAddModal(true)}
                  className="w-full md:w-auto"
                >
                  Tambah Peserta Manual
                </Button>
              )}
            </div>
          </Card>

          {/* Participants Table */}
          <Card padding="p-0" className="overflow-hidden">
            {filteredParticipants.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto opacity-50 text-slate-400" />
                <p className="text-sm font-semibold text-slate-600">Belum ada peserta yang sesuai filter.</p>
                <p className="text-xs">
                  Bagikan tautan pendaftaran atau gunakan tombol &quot;Tambah Peserta Manual&quot;.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                      <th className="px-6 py-4">No</th>
                      <th className="px-6 py-4">Nama Peserta</th>
                      <th className="px-6 py-4">Kontak</th>
                      <th className="px-6 py-4">Instansi & Jabatan</th>
                      <th className="px-6 py-4 text-center">Waktu Pendaftaran</th>
                      <th className="px-6 py-4 text-center">Status Kehadiran</th>
                      {!isSupervisor && <th className="px-6 py-4 text-center">Aksi Kehadiran</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredParticipants.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-400 font-bold">{idx + 1}</td>

                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          {item.visitor?.photo && (
                            <span className="text-[10px] text-brand-navy font-semibold">Foto terdaftar</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 space-y-0.5">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {item.phone}
                          </div>
                          {item.email && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {item.email}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                          <p className="text-slate-800">{item.company || 'Pribadi / Umum'}</p>
                          {item.position && (
                            <p className="text-[11px] text-slate-400 font-normal">{item.position}</p>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center text-xs text-slate-500 whitespace-nowrap">
                          {item.registered_at ? dayjs(item.registered_at).format('DD/MM/YY HH:mm') : '-'}
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {item.status === 'checked_in' && (
                            <Badge variant="emerald" dot>Di Lokasi</Badge>
                          )}
                          {item.status === 'checked_out' && (
                            <Badge variant="neutral">Selesai</Badge>
                          )}
                          {item.status === 'registered' && (
                            <Badge variant="amber">Belum Hadir</Badge>
                          )}
                        </td>

                        {!isSupervisor && (
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {item.status === 'registered' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={LogIn}
                                  loading={actionLoadingId === item.id}
                                  onClick={() => handleCheckInParticipant(item.id)}
                                  className="text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700"
                                >
                                  Check-In
                                </Button>
                              )}

                              {item.status === 'checked_in' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={LogOut}
                                  loading={actionLoadingId === item.id}
                                  onClick={() => handleCheckOutParticipant(item.id)}
                                  className="text-xs py-1.5 px-3 text-blue-700 border-blue-200 hover:bg-blue-50"
                                >
                                  Check-Out
                                </Button>
                              )}

                              {item.status === 'checked_out' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={LogIn}
                                  loading={actionLoadingId === item.id}
                                  onClick={() => handleCheckInParticipant(item.id)}
                                  className="text-xs py-1 px-2.5 text-slate-600 border-slate-200"
                                  title="Check-in Ulang"
                                >
                                  Re-In
                                </Button>
                              )}

                              <button
                                onClick={() => handleDeleteParticipant(item.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Peserta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Tab: Quick Scan ── */}
      {activeTab === 'quickscan' && !useAuthStore.getState().isFeatureDisabled('quick_checkin') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <Card className="lg:col-span-7 xl:col-span-8 p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-cyan text-white shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">Camera Express Scan</h2>
                  <p className="text-xs text-slate-500 font-medium">Check-in / Check-out otomatis via wajah</p>
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

          <div className="lg:col-span-5 xl:col-span-4 space-y-5">
            <Card padding="p-6">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <Zap className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Alur Quick Scan Event</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-600 font-medium">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0"><Camera className="w-4 h-4" /></div>
                  <div>
                    <p className="font-bold text-slate-900">1. Arahkan Wajah</p>
                    <p className="text-slate-500 mt-0.5">Tamu/peserta berdiri di depan kamera.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 flex-shrink-0"><LogIn className="w-4 h-4" /></div>
                  <div>
                    <p className="font-bold text-slate-900">2. Belum Check-In → Auto IN</p>
                    <p className="text-slate-500 mt-0.5">Tercatat hadir pada event ini.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-800 flex-shrink-0"><LogOut className="w-4 h-4" /></div>
                  <div>
                    <p className="font-bold text-slate-900">3. Sudah Check-In → Auto OUT</p>
                    <p className="text-slate-500 mt-0.5">Check-out kepulangan otomatis.</p>
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
                Semua check-in via scanner ini akan otomatis tercatat ke event <strong>{event.name}</strong> dengan format &quot;Event: {event.name}&quot;.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Modal: Tambah Peserta Manual */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Tambah Peserta Manual">
        <form onSubmit={handleAddParticipantSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={partForm.name}
              onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nomor WhatsApp / HP <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={partForm.phone}
              onChange={(e) => setPartForm({ ...partForm, phone: e.target.value })}
              placeholder="Contoh: 08123456789"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email (Opsional)
            </label>
            <input
              type="email"
              value={partForm.email}
              onChange={(e) => setPartForm({ ...partForm, email: e.target.value })}
              placeholder="Contoh: budi@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Perusahaan / Instansi
              </label>
              <input
                type="text"
                value={partForm.company}
                onChange={(e) => setPartForm({ ...partForm, company: e.target.value })}
                placeholder="Contoh: PT ABC"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Jabatan / Posisi
              </label>
              <input
                type="text"
                value={partForm.position}
                onChange={(e) => setPartForm({ ...partForm, position: e.target.value })}
                placeholder="Contoh: Staff IT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" fullWidth onClick={() => setAddModal(false)} disabled={addingParticipant}>
              Batal
            </Button>
            <Button type="submit" variant="primary" fullWidth loading={addingParticipant}>
              Simpan Peserta
            </Button>
          </div>
        </form>
      </Modal>

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