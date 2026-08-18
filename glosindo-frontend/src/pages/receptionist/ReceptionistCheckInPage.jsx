import React, { useEffect, useState } from 'react';
import FaceScanner from '../../components/FaceScanner';
import visitorService from '../../services/visitorService';
import visitService from '../../services/visitService';
import eventService from '../../services/eventService';
import PublicRegistrationToggle from '../../components/PublicRegistrationToggle';
import { CalendarRange } from 'lucide-react';

const quickActions = ['Scan Wajah', 'Input Manual', 'Registrasi Baru'];

const ReceptionistCheckInPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVisitorId, setSelectedVisitorId] = useState('');
  const [selectedVisitorName, setSelectedVisitorName] = useState('');
  const [visitType, setVisitType] = useState('regular');
  const [eventId, setEventId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [meetTo, setMeetTo] = useState('');
  const [message, setMessage] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [visRes, evRes] = await Promise.all([
          visitorService.getAll({ page: 1, search: '' }),
          eventService.getActive()
        ]);
        setVisitors(visRes.data?.data || []);
        setActiveEvents(evRes.data?.data || []);
      } catch (err) {
        setError('Gagal memuat data awal.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        visitor_id: selectedVisitorId,
        purpose,
        meet_to: visitType === 'event' ? (meetTo.trim() || '-') : meetTo,
        event_id: visitType === 'event' ? eventId : null,
      };
      const response = await visitService.checkIn(payload);
      setMessage(response.message || 'Check-in berhasil.');
      setSelectedVisitorId('');
      setSelectedVisitorName('');
      setPurpose('');
      setMeetTo('');
      setEventId('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-in gagal.');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Check-In Tamu</h1>
        <p className="mt-2 text-sm text-emerald-100">Area operasi resepsionis untuk mencatat kedatangan tamu (Biasa maupun Event) dan memverifikasi wajah.</p>
      </div>

      <PublicRegistrationToggle showLink={true} />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Scan Wajah untuk Check-In</h2>
          <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-700">
            <FaceScanner
              onMatchFound={(visitor) => {
                setSelectedVisitorId(visitor.visitor_id);
                setSelectedVisitorName(visitor.name);
                setScanMessage(`Wajah cocok dengan ${visitor.name}`);
                setMessage('');
              }}
              onNoMatch={() => {
                setScanMessage('Wajah tidak terdaftar. Pilih tamu manual atau registrasi baru.');
              }}
            />
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {scanMessage || 'Arahkan wajah tamu ke kamera untuk mengidentifikasi dan memilih tamu secara otomatis.'}
          </div>

          <form onSubmit={handleCheckIn} className="mt-6 space-y-4">
            {/* Pilih Jenis Kunjungan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Jenis Kunjungan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisitType('regular')}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    visitType === 'regular'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  Kunjungan Biasa
                </button>
                <button
                  type="button"
                  onClick={() => setVisitType('event')}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    visitType === 'event'
                      ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-600/20'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  Kunjungan Event
                </button>
              </div>
            </div>

            {/* Dropdown Event jika visitType === 'event' */}
            {visitType === 'event' && (
              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 space-y-1.5">
                <label className="block text-xs font-bold text-teal-900 uppercase">Pilih Event Aktif *</label>
                <select
                  value={eventId}
                  onChange={(e) => {
                    setEventId(e.target.value);
                    const ev = activeEvents.find(x => x.id == e.target.value);
                    if (ev && !purpose) setPurpose(`Mengikuti event: ${ev.name}`);
                  }}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white"
                  required
                >
                  <option value="">-- Pilih Event --</option>
                  {activeEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.start_time?.slice(0,5)} - {ev.end_time?.slice(0,5)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <select value={selectedVisitorId} onChange={(e) => { setSelectedVisitorId(e.target.value); setSelectedVisitorName(''); }} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" required>
                <option value="">Pilih tamu</option>
                {visitors.map((visitor) => (
                  <option key={visitor.id} value={visitor.id}>{visitor.name}</option>
                ))}
              </select>
              {selectedVisitorName && (
                <p className="mt-2 text-sm text-green-700">Tamu terpilih via scan: {selectedVisitorName}</p>
              )}
            </div>

            <input
              value={meetTo}
              onChange={(e) => setMeetTo(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
              placeholder={visitType === 'event' ? 'Yang ditemui (Opsional)' : 'Yang ditemui *'}
              required={visitType === 'regular'}
            />

            <input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
              placeholder="Tujuan / Keperluan kunjungan *"
              required
            />

            <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
              Proses Check-In
            </button>
          </form>

          {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
          {scanMessage && <p className="mt-3 text-sm text-gray-700">{scanMessage}</p>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Aksi Cepat</h2>
          <div className="mt-4 space-y-2">
            {quickActions.map((action) => (
              <button key={action} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                {action}
              </button>
            ))}
          </div>
          {loading && <p className="mt-4 text-sm text-gray-500">Memuat daftar tamu...</p>}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistCheckInPage;