import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  UserPlus, Search, UserCheck, CheckCircle, X, HelpCircle,
  Zap, CalendarRange, Users, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuccessScreen from '../components/SplashOverlay';
import VisitorFormPage from './VisitorFormPage';
import visitService from '../services/visitService';
import visitorService from '../services/visitorService';
import eventService from '../services/eventService';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const CheckInPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [splashOpen, setSplashOpen] = useState(false);
  const [splashType, setSplashType] = useState('checkin');
  const [splashMeta, setSplashMeta] = useState({});

  // Visit Type: 'regular' | 'event'
  const [visitType, setVisitType] = useState('regular');
  const [eventId, setEventId] = useState('');
  const [activeEvents, setActiveEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [purpose, setPurpose] = useState('');
  const [meetTo, setMeetTo] = useState('');
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!selectedVisitor && location.state?.visitor) {
      setSelectedVisitor(location.state.visitor);
    }
  }, [location.state, selectedVisitor]);

  // Load active events for dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const res = await eventService.getActive();
        setActiveEvents(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load active events', err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await visitorService.getAll({ search: searchQuery });
      setSearchResults(res.data?.data || []);
    } catch (err) {
      toast.error('Gagal mencari tamu');
    } finally {
      setSearching(false);
    }
  };

  const handleRegisterSuccess = (newVisitor) => {
    setSelectedVisitor(newVisitor);
    setShowRegisterForm(false);
    setSplashType('newvisitor');
    setSplashMeta({});
    setSplashOpen(true);
    toast.success('Pendaftaran tamu berhasil! Lanjutkan mengisi rincian kunjungan.');
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisitor?.id) {
      toast.error('Pilih tamu terlebih dahulu');
      return;
    }

    if (!purpose.trim()) {
      toast.error('Keperluan kunjungan wajib diisi');
      return;
    }

    if (visitType === 'regular' && !meetTo.trim()) {
      toast.error('Pihak yang ditemui wajib diisi untuk kunjungan biasa');
      return;
    }

    if (visitType === 'event' && !eventId) {
      toast.error('Pilih event yang diikuti');
      return;
    }

    setSubmittingCheckIn(true);
    try {
      const payload = {
        visitor_id: selectedVisitor.id,
        purpose,
        meet_to: visitType === 'event' ? (meetTo.trim() || '-') : meetTo,
        event_id: visitType === 'event' ? eventId : null,
      };

      await visitService.checkIn(payload);

      setSplashType('checkin');
      setSplashMeta({
        meetTo: payload.meet_to,
        purpose: payload.purpose,
        eventName: visitType === 'event' ? activeEvents.find(e => e.id == eventId)?.name : null
      });
      setSplashOpen(true);

      toast.success(`Check-In Berhasil! ${selectedVisitor.name}`, {
        duration: 4000,
        icon: '🎉',
      });

      setTimeout(() => {
        setSelectedVisitor(null);
        setPurpose('');
        setMeetTo('');
        setVisitType('regular');
        setEventId('');
        setShowRegisterForm(false);
      }, 5000);
    } catch (err) {
      console.error('Check-in error:', err);
      const msg = err.response?.data?.message || 'Gagal melakukan check-in';
      toast.error(msg);
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Self-Service Check-In Desk
            </h1>
            <Badge variant="navy">Kiosk Portal</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Daftarkan tamu baru atau cari data tamu terdaftar untuk konfirmasi kunjungan biasa maupun event.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={Zap}
            onClick={() => navigate('/quick-check-in')}
          >
            Quick Check-In
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Interactive Form Area */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {showRegisterForm ? (
            <VisitorFormPage
              faceVectorPreset={null}
              onSuccess={handleRegisterSuccess}
              onCancel={() => setShowRegisterForm(false)}
            />
          ) : selectedVisitor ? (
            <>
              <SuccessScreen
                open={splashOpen}
                type={splashType}
                visitorName={selectedVisitor?.name}
                meta={splashMeta}
                onClose={() => setSplashOpen(false)}
              />
              <Card padding="p-6 md:p-8" className="border-2 border-brand-cyan/40 shadow-xl">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-brand-cyan" />
                    <h2 className="text-lg font-bold text-slate-900">Konfirmasi Kunjungan Tamu</h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedVisitor(null);
                      setSearchResults([]);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Batal
                  </button>
                </div>

                {/* Selected Visitor Details Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-navy to-slate-800 text-white flex items-center gap-4 shadow-md mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-brand-cyan-light font-extrabold flex items-center justify-center text-2xl border border-white/20 flex-shrink-0">
                    {selectedVisitor.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full">
                      Tamu Terpilih
                    </span>
                    <h3 className="text-xl font-bold text-white truncate mt-0.5">{selectedVisitor.name}</h3>
                    <p className="text-xs text-slate-300 truncate mt-0.5">
                      {selectedVisitor.company || 'Instansi tidak diisi'} • {selectedVisitor.phone || 'Tanpa telepon'}
                    </p>
                  </div>
                </div>

                {/* Form Check-In Details */}
                <form onSubmit={handleCheckInSubmit} className="space-y-5">
                  {/* Pilihan Jenis Kunjungan */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Jenis Kunjungan <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setVisitType('regular')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          visitType === 'regular'
                            ? 'border-brand-navy bg-blue-50/60 ring-2 ring-brand-navy/20 font-bold text-brand-navy'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <p className="text-sm font-extrabold">Kunjungan Biasa</p>
                        <p className="text-xs text-slate-400 font-normal mt-0.5">Bertemu karyawan / keperluan umum</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisitType('event')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          visitType === 'event'
                            ? 'border-brand-cyan bg-cyan-50/60 ring-2 ring-brand-cyan/20 font-bold text-brand-cyan-dark'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <CalendarRange className="w-4 h-4 text-brand-cyan" />
                          <p className="text-sm font-extrabold">Kunjungan Event</p>
                        </div>
                        <p className="text-xs text-slate-400 font-normal mt-0.5">Mengikuti meeting / seminar / training</p>
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Event jika Jenis = Event */}
                  {visitType === 'event' && (
                    <div className="p-4 rounded-2xl bg-cyan-50/40 border border-cyan-100 space-y-3 animate-fadeIn">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Pilih Event Yang Diikuti <span className="text-rose-500">*</span>
                      </label>
                      {loadingEvents ? (
                        <div className="p-3 text-xs text-slate-500 font-medium">Memuat event aktif...</div>
                      ) : activeEvents.length === 0 ? (
                        <div className="p-3 text-xs text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                          Tidak ada event aktif yang terjadwal hari ini. Anda dapat membuat event di menu <strong>Event</strong> atau pilih <strong>Kunjungan Biasa</strong>.
                        </div>
                      ) : (
                        <select
                          value={eventId}
                          onChange={(e) => {
                            setEventId(e.target.value);
                            const ev = activeEvents.find(x => x.id == e.target.value);
                            if (ev && !purpose) {
                              setPurpose(`Mengikuti event: ${ev.name}`);
                            }
                          }}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-cyan bg-white"
                        >
                          <option value="">-- Pilih Event Hari Ini --</option>
                          {activeEvents.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              {ev.name} ({ev.start_time?.slice(0,5)} - {ev.end_time?.slice(0,5)} {ev.location ? `| ${ev.location}` : ''})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Bertemu Dengan */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Bertemu Dengan Siapa? {visitType === 'regular' && <span className="text-rose-500">*</span>}
                      {visitType === 'event' && <span className="text-xs text-slate-400 font-normal ml-1">(Opsional untuk Event)</span>}
                    </label>
                    <input
                      type="text"
                      required={visitType === 'regular'}
                      value={meetTo}
                      onChange={(e) => setMeetTo(e.target.value)}
                      placeholder={visitType === 'event' ? 'Opsional / Penanggung Jawab Event' : 'Contoh: Bpk. Budi - Manager HRD'}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all bg-slate-50/50"
                    />
                  </div>

                  {/* Keperluan Kunjungan */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Keperluan Kunjungan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Contoh: Meeting koordinasi proyek digitalisasi guestbook"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all bg-slate-50/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="emerald"
                    size="kiosk"
                    fullWidth
                    loading={submittingCheckIn}
                    icon={CheckCircle}
                  >
                    Konfirmasi Check-In Tamu
                  </Button>
                </form>
              </Card>
            </>
          ) : (
            <Card padding="p-6 md:p-8" className="space-y-6">
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-3xl bg-brand-navy/10 text-brand-navy flex items-center justify-center mb-4 mx-auto border border-brand-navy/20 shadow-xs">
                  <UserCheck className="w-8 h-8 text-brand-cyan" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Pilih Metode Check-In</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Daftarkan tamu baru atau cari data tamu yang sudah tersimpan di database.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  variant="primary"
                  size="kiosk"
                  fullWidth
                  onClick={() => setShowRegisterForm(true)}
                  icon={UserPlus}
                >
                  Daftar Tamu Baru
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-white text-slate-400 font-extrabold uppercase tracking-widest">
                      Atau Cari Tamu Terdaftar
                    </span>
                  </div>
                </div>

                {/* Search Form */}
                <form onSubmit={handleManualSearch} className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama, nomor telepon, atau instansi..."
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan bg-slate-50/50"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="md"
                    fullWidth
                    loading={searching}
                    disabled={!searchQuery.trim()}
                  >
                    {searching ? 'Mencari...' : 'Cari Data Tamu'}
                  </Button>
                </form>

                {/* Search Results list */}
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2.5 pt-3 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
                      Hasil Pencarian ({searchResults.length} ditemukan):
                    </p>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {searchResults.map((visitor) => (
                        <button
                          key={visitor.id}
                          onClick={() => {
                            setSelectedVisitor(visitor);
                            setSearchResults([]);
                            setSearchQuery('');
                          }}
                          className="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-cyan-50/80 border border-slate-200 hover:border-brand-cyan/40 transition-all group flex items-center gap-3 cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl bg-brand-navy text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                            {visitor.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-brand-navy truncate">
                              {visitor.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {visitor.company || 'Tanpa instansi'} • {visitor.phone || 'Tanpa telepon'}
                            </p>
                          </div>
                          <Badge variant="cyan" className="group-hover:bg-brand-cyan group-hover:text-white transition-colors">
                            Pilih
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          <Card padding="p-6">
            <CardHeader className="flex items-center gap-2 pb-3 mb-3">
              <HelpCircle className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Panduan Kiosk Self-Service
              </h3>
            </CardHeader>
            <ol className="space-y-3 text-xs md:text-sm text-slate-600 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <span><strong>Tamu Baru:</strong> Klik "Daftar Tamu Baru" untuk pendaftaran lengkap + foto wajah biometrik.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <span><strong>Tamu Terdaftar:</strong> Gunakan pencarian instan nama atau telepon.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <span><strong>Pilih Jenis Kunjungan:</strong> Tentukan kunjungan biasa atau kunjungan terkait event perusahaan.</span>
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;