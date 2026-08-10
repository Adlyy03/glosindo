import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import FaceScanner from '../components/FaceScanner';
import SuccessScreen from '../components/SplashOverlay';
import visitService from '../services/visitService';

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

    // Polling interval every 15 seconds
    const interval = setInterval(() => {
      fetchActive(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchActive]);

  const handleScanMatch = async (visitor) => {
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
      toast.success(`Check-Out Berhasil! ${verificationVisit.visitor?.name} telah keluar.`, { icon: '👋' });
      setSplashVisitorName(verificationVisit.visitor?.name || 'Tamu');
      setSplashMeta({ checkOutTime: new Date() });
      setSplashOpen(true);
      setVerificationMessage(`Checkout ${verificationVisit.visitor?.name} selesai.`);
      setVerificationVisit(null);
      setVerificationError('');
      fetchActive();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal melakukan check-out');
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
    setError('');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Tamu Aktif Saat Ini</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Daftar pengunjung yang sedang berada di area gedung (Status: IN). Auto-update tiap 15s.</p>
        </div>

        <button
          onClick={() => fetchActive()}
          className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-2 shadow-2xs transition-all"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Verifikasi Check-Out</h2>
          {verificationVisit ? (
            <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4">
              <FaceScanner onMatchFound={handleScanMatch} onNoMatch={handleScanNoMatch} />
              <p className="mt-3 text-sm text-gray-500">Arahkan wajah {verificationVisit.visitor?.name || 'tamu'} untuk verifikasi checkout.</p>
              {verificationError && <p className="mt-2 text-sm text-red-600">{verificationError}</p>}
              <button
                onClick={() => setVerificationVisit(null)}
                className="mt-3 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Batalkan Verifikasi
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Klik tombol checkout pada tamu aktif untuk memulai verifikasi wajah.</p>
          )}
          {verificationMessage && <p className="mt-3 text-sm text-gray-700">{verificationMessage}</p>}
          <SuccessScreen
            open={splashOpen}
            type="checkout"
            visitorName={splashVisitorName}
            meta={splashMeta}
            onClose={() => setSplashOpen(false)}
          />
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Memuat tamu aktif...</p>
          </div>
        ) : activeVisits.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800">Tidak Ada Tamu Aktif</h3>
            <p className="text-xs text-gray-500 mt-1">Saat ini seluruh pengunjung telah melakukan check-out.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-5 py-3.5">Nama Tamu</th>
                    <th className="px-5 py-3.5">Bertemu Dengan</th>
                    <th className="px-5 py-3.5 hidden lg:table-cell">Maksud Keperluan</th>
                    <th className="px-5 py-3.5">Jam Masuk (IN)</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm flex-shrink-0">
                            {visit.visitor?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{visit.visitor?.name}</p>
                            <p className="text-xs text-gray-400">{visit.visitor?.company || 'Pribadi'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {visit.meet_to}
                      </td>

                      <td className="px-5 py-4 text-gray-600 max-w-xs hidden lg:table-cell">
                        <p className="truncate text-xs">{visit.purpose}</p>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-blue-700">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 whitespace-nowrap">
                          {dayjs(visit.check_in).format('HH:mm — D MMM')}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleCheckout(visit)}
                          disabled={checkingOutId === visit.id}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold text-xs shadow-xs transition-all inline-flex items-center gap-1.5"
                        >
                          {checkingOutId === visit.id ? (
                            'Proses...'
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span className="hidden lg:inline">Check-Out</span>
                              <span className="lg:hidden">OUT</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {activeVisits.map((visit) => (
                <div key={visit.id} className="p-4 hover:bg-blue-50/20 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm flex-shrink-0">
                        {visit.visitor?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{visit.visitor?.name}</p>
                        <p className="text-xs text-gray-400">{visit.visitor?.company || 'Pribadi'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex-shrink-0">IN</span>
                  </div>
                  
                  <div className="space-y-2 text-xs mb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 w-20">Bertemu:</span>
                      <span className="font-semibold text-gray-900">{visit.meet_to}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 w-20">Keperluan:</span>
                      <span className="text-gray-700 line-clamp-2">{visit.purpose}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 w-20">Jam Masuk:</span>
                      <span className="font-semibold text-blue-700">{dayjs(visit.check_in).format('HH:mm — D MMM YYYY')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCheckout(visit)}
                    disabled={checkingOutId === visit.id}
                    className="w-full px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    {checkingOutId === visit.id ? (
                      'Proses...'
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Check-Out (OUT)
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActiveVisitorPage;
