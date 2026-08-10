import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FaceScanner from '../components/FaceScanner';

const CheckInCameraPage = () => {
  const [matchedVisitor, setMatchedVisitor] = useState(null);
  const [noMatchDetected, setNoMatchDetected] = useState(false);
  const [reloadSignal, setReloadSignal] = useState(0);
  const navigate = useNavigate();

  const handleMatchFound = (visitor) => {
    const normalizedVisitor = {
      ...visitor,
      id: visitor.id || visitor.visitor_id,
    };
    setMatchedVisitor(normalizedVisitor);
    setNoMatchDetected(false);
  };

  const handleNoMatch = () => {
    setMatchedVisitor(null);
    setNoMatchDetected(true);
  };

  useEffect(() => {
    if (!matchedVisitor) return;
    navigate('/check-in/manual', { state: { visitor: matchedVisitor } });
  }, [matchedVisitor, navigate]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Check-In Tamu</h1>
          <p className="text-sm text-gray-500 mt-1">Identifikasi wajah tamu melalui live kamera. Halaman ini fokus pada pengenalan wajah.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-gray-100 p-3 text-xs text-gray-600">
          <span className="font-semibold">Mode</span>
          <span>Live Kamera</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6 items-start">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-4">Live Camera Identification</h2>
          <FaceScanner
            onMatchFound={handleMatchFound}
            onNoMatch={handleNoMatch}
            reloadSignal={reloadSignal}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Petunjuk</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>1. Arahkan wajah tamu ke kamera.</li>
              <li>2. Pastikan pencahayaan cukup dan wajah berada di tengah bingkai.</li>
              <li>3. Sistem akan memindai secara otomatis setiap 5 detik.</li>
            </ul>
          </div>

          {matchedVisitor ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-2">Wajah Teridentifikasi</h3>
              <p className="text-base font-bold text-emerald-900 mb-2">{matchedVisitor.name}</p>
              <p className="text-sm text-emerald-700 mb-4">{matchedVisitor.company || 'Instansi tidak tersedia'}</p>
              <Link
                to="/check-in/manual"
                className="inline-flex items-center justify-center w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Lanjutkan ke Form Check-In
              </Link>
            </div>
          ) : noMatchDetected ? (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">Wajah Belum Terdaftar</h3>
              <p className="text-sm text-amber-700 mb-4">Jika tamu belum terdaftar, lanjutkan ke registrasi atau pencarian manual.</p>
              <Link
                to="/check-in/manual"
                className="inline-flex items-center justify-center w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Buka Halaman Check-In Manual
              </Link>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Menunggu Identifikasi</h3>
              <p className="text-sm text-gray-600">Sistem akan melakukan pemindaian otomatis setelah model siap.</p>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Opsi Lain</h3>
            <Link
              to="/check-in/manual"
              className="inline-flex items-center justify-center w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Buka Halaman Check-In Manual / Registrasi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInCameraPage;
