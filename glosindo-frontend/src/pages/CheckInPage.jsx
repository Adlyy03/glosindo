import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import SuccessScreen from '../components/SplashOverlay';
import VisitorFormPage from './VisitorFormPage';
import visitService from '../services/visitService';
import visitorService from '../services/visitorService';

const CheckInPage = () => {
  const location = useLocation();
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [splashOpen, setSplashOpen] = useState(false);
  const [splashType, setSplashType] = useState('checkin');
  const [splashMeta, setSplashMeta] = useState({});

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
    toast.success('Pendaftaran tamu berhasil! Lanjutkan mengisi keperluan kunjungan.');
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisitor?.id) {
      toast.error('Pilih tamu terlebih dahulu');
      return;
    }
    if (!purpose.trim() || !meetTo.trim()) {
      toast.error('Tujuan dan Orang yang Ditemui wajib diisi');
      return;
    }

    setSubmittingCheckIn(true);
    try {
      await visitService.checkIn({
        visitor_id: selectedVisitor.id,
        purpose,
        meet_to: meetTo,
      });

      setSplashType('checkin');
      setSplashMeta({ meetTo, purpose });
      setSplashOpen(true);

      toast.success(`Check-In Berhasil! ${selectedVisitor.name} status IN.`, {
        duration: 4000,
        icon: '🎉',
      });

      setTimeout(() => {
        setSelectedVisitor(null);
        setPurpose('');
        setMeetTo('');
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Check-In Tamu</h1>
          <p className="text-sm text-gray-500 mt-1">Cari tamu secara manual atau daftarkan tamu baru untuk melanjutkan proses check-in.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <div className="lg:col-span-6">
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
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg flex-shrink-0">
                    {selectedVisitor.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tamu Terpilih</span>
                    <h3 className="text-lg font-bold text-gray-900">{selectedVisitor.name}</h3>
                    <p className="text-xs text-gray-500">{selectedVisitor.company || 'Instansi tidak diisi'} • {selectedVisitor.phone || 'Tanpa no. telepon'}</p>
                  </div>
                </div>

                <form onSubmit={handleCheckInSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Bertemu Dengan Siapa? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={meetTo}
                      onChange={(e) => setMeetTo(e.target.value)}
                      placeholder="Nama staf / pejabat / divisi tujuan (Contoh: Bpk. Budi - HRD)"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Maksud / Keperluan Kunjungan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Contoh: Meeting kordinasi proyek digitalisasi guestbook"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVisitor(null)}
                      className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCheckIn}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-2.5 rounded-xl text-sm shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      {submittingCheckIn ? (
                        'Proses Check-In...'
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Konfirmasi Check-In (IN)
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-800">Pilih pelanggan atau registrasi baru</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                Cari tamu lewat nama, telepon, atau instansi, lalu lanjutkan check-in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
