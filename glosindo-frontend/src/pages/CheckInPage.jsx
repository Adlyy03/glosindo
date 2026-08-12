import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SuccessScreen from '../components/SplashOverlay';
import VisitorFormPage from './VisitorFormPage';
import visitService from '../services/visitService';
import visitorService from '../services/visitorService';

const CheckInPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Check-In Tamu</h1>
          <p className="text-sm text-gray-500 mt-1">Daftarkan tamu baru atau cari tamu yang sudah terdaftar untuk melakukan check-in</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Main Action Area */}
        <div className="space-y-6">
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
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Form Check-In</h2>
                  <button
                    onClick={() => {
                      setSelectedVisitor(null);
                      setSearchResults([]);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Batal
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xl flex-shrink-0">
                    {selectedVisitor.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tamu Terpilih</span>
                    <h3 className="text-lg font-bold text-gray-900">{selectedVisitor.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedVisitor.company || 'Instansi tidak diisi'} • {selectedVisitor.phone || 'Tanpa no. telepon'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCheckInSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bertemu Dengan Siapa? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={meetTo}
                      onChange={(e) => setMeetTo(e.target.value)}
                      placeholder="Contoh: Bpk. Budi - HRD"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Keperluan Kunjungan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Contoh: Meeting koordinasi proyek digitalisasi"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingCheckIn}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {submittingCheckIn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Konfirmasi Check-In
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pilih Tamu</h3>
                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                  Daftarkan tamu baru atau cari tamu yang sudah terdaftar untuk melanjutkan check-in
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setShowRegisterForm(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Daftar Tamu Baru
                </button>

                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-semibold">ATAU</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Cari Tamu yang Sudah Terdaftar
                  </label>
                  <form onSubmit={handleManualSearch} className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ketik nama, telepon, atau instansi..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={searching || !searchQuery.trim()}
                      className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-50 border-2 border-gray-300 disabled:border-gray-200 text-gray-700 disabled:text-gray-400 font-semibold py-3 rounded-xl text-sm transition-all"
                    >
                      {searching ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          Mencari...
                        </span>
                      ) : (
                        'Cari Tamu'
                      )}
                    </button>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-700 px-1">
                        Hasil Pencarian ({searchResults.length} tamu):
                      </p>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {searchResults.map((visitor) => (
                          <button
                            key={visitor.id}
                            onClick={() => {
                              setSelectedVisitor(visitor);
                              setSearchResults([]);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border-2 border-gray-200 hover:border-blue-300 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                                {visitor.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700">
                                  {visitor.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {visitor.company || 'Tanpa instansi'} • {visitor.phone || 'Tanpa telepon'}
                                </p>
                              </div>
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Information */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-blue-900 mb-1">Petunjuk Check-In</h3>
                <p className="text-sm text-blue-700">Ikuti langkah berikut untuk check-in tamu</p>
              </div>
            </div>
            <ol className="space-y-3 text-sm text-blue-800">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <span><strong>Tamu Baru:</strong> Klik "Daftar Tamu Baru" untuk registrasi dengan data lengkap dan foto wajah</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <span><strong>Tamu Terdaftar:</strong> Gunakan kolom pencarian untuk menemukan tamu berdasarkan nama, telepon, atau instansi</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <span><strong>Lengkapi Data:</strong> Isi tujuan bertemu dan keperluan kunjungan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                <span><strong>Konfirmasi:</strong> Klik tombol "Konfirmasi Check-In" untuk menyelesaikan</span>
              </li>
            </ol>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-900 mb-2">Quick Check-In/Out</h3>
                <p className="text-sm text-amber-800">
                  Untuk check-in/out cepat tanpa form, gunakan menu <strong>Quick Check-In/Out</strong> di sidebar. 
                  Scan wajah langsung untuk proses otomatis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
