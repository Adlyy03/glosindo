import React, { useEffect, useState } from 'react';
import FaceScanner from '../../components/FaceScanner';
import visitService from '../../services/visitService';

const ReceptionistActivePage = () => {
  const [activeVisits, setActiveVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [verificationVisit, setVerificationVisit] = useState(null);
  const [verificationError, setVerificationError] = useState('');

  const loadActive = async () => {
    try {
      const response = await visitService.getActive();
      setActiveVisits(response.data || []);
    } catch (err) {
      setError('Gagal memuat tamu aktif.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActive();
  }, []);

  const handleMatchFound = async (visitor) => {
    if (!verificationVisit) {
      setScanMessage(`Tamu ${visitor.name} teridentifikasi, tetapi tidak ada sesi verifikasi aktif.`);
      return;
    }

    const expectedVisitorId = verificationVisit.visitor?.id || verificationVisit.visitor_id;
    if (visitor.visitor_id !== expectedVisitorId) {
      setVerificationError('Wajah tidak cocok dengan tamu yang dipilih untuk checkout. Coba lagi.');
      return;
    }

    try {
      await visitService.checkOut(verificationVisit.id);
      setScanMessage(`Checkout ${visitor.name} berhasil.`);
      setVerificationVisit(null);
      setVerificationError('');
      await loadActive();
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout gagal.');
    }
  };

  const handleNoMatch = () => {
    setVerificationError('Wajah tidak terdaftar. Pastikan wajah jelas saat scan.');
  };

  const handleCheckout = (visit) => {
    setVerificationVisit(visit);
    setScanMessage(`Scan wajah ${visit.visitor?.name || 'tamu'} untuk verifikasi checkout.`);
    setVerificationError('');
    setError('');
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Tamu Aktif</h1>
        <p className="mt-2 text-sm text-gray-600">Daftar tamu yang sedang berada di area lokasi.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Scan Wajah untuk Checkout</h2>
        {verificationVisit ? (
          <>
            <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4">
              <FaceScanner onMatchFound={handleMatchFound} onNoMatch={handleNoMatch} />
            </div>
            <p className="mt-3 text-sm text-gray-500">Arahkan wajah {verificationVisit.visitor?.name || 'tamu'} untuk verifikasi checkout.</p>
            {verificationError && <p className="mt-3 text-sm text-red-600">{verificationError}</p>}
            <button
              onClick={() => setVerificationVisit(null)}
              className="mt-4 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Batalkan Verifikasi
            </button>
          </>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Pilih tombol checkout pada tamu aktif, lalu verifikasi wajah untuk menyelesaikan proses.</p>
        )}
        {scanMessage && <p className="mt-3 text-sm text-gray-700">{scanMessage}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Saat Ini</h2>
        </div>
        {loading ? (
          <div className="p-5 text-sm text-gray-500">Memuat tamu aktif...</div>
        ) : error ? (
          <div className="p-5 text-sm text-red-600">{error}</div>
        ) : activeVisits.length === 0 ? (
          <div className="p-5 text-sm text-gray-500">Tidak ada tamu aktif saat ini.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activeVisits.map((visit) => (
              <div key={visit.id} className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{visit.visitor?.name || 'Tamu'}</p>
                  <p className="text-sm text-gray-500">{visit.visitor?.company || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600">Masuk {visit.check_in ? new Date(visit.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                  <button onClick={() => handleCheckout(visit)} className="mt-2 text-sm text-blue-600">Checkout</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionistActivePage;
