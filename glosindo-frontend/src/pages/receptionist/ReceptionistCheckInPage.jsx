import React, { useEffect, useState } from 'react';
import FaceScanner from '../../components/FaceScanner';
import visitorService from '../../services/visitorService';
import visitService from '../../services/visitService';

const quickActions = ['Scan Wajah', 'Input Manual', 'Registrasi Baru'];

const ReceptionistCheckInPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVisitorId, setSelectedVisitorId] = useState('');
  const [selectedVisitorName, setSelectedVisitorName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [meetTo, setMeetTo] = useState('');
  const [message, setMessage] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await visitorService.getAll({ page: 1, search: '' });
        setVisitors(response.data?.data || []);
      } catch (err) {
        setError('Gagal memuat data tamu.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      const response = await visitService.checkIn({ visitor_id: selectedVisitorId, purpose, meet_to: meetTo });
      setMessage(response.message || 'Check-in berhasil.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-in gagal.');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Check-In Tamu</h1>
        <p className="mt-2 text-sm text-emerald-100">Area operasi resepsionis untuk mencatat kedatangan tamu dan memverifikasi wajah.</p>
      </div>

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

          <form onSubmit={handleCheckIn} className="mt-6 space-y-3">
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
            <input value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" placeholder="Tujuan kunjungan" required />
            <input value={meetTo} onChange={(e) => setMeetTo(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" placeholder="Yang ditemui" required />
            <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">Proses Check-In</button>
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
