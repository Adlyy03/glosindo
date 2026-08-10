import React, { useState } from 'react';
import toast from 'react-hot-toast';
import FaceScanner from '../components/FaceScanner';
import SuccessScreen from '../components/SplashOverlay';
import VisitorFormPage from './VisitorFormPage';
import visitService from '../services/visitService';
import visitorService from '../services/visitorService';

const CheckInPage = () => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [embeddingsRefreshToken, setEmbeddingsRefreshToken] = useState(0);
  const [splashOpen, setSplashOpen] = useState(false);
  const [splashTitle, setSplashTitle] = useState('');
  const [splashSubtitle, setSplashSubtitle] = useState('');

  // Visit details form
  const [purpose, setPurpose] = useState('');
  const [meetTo, setMeetTo] = useState('');
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);

  // Manual search fallback
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleMatchFound = (visitor) => {
    setSelectedVisitor({
      ...visitor,
      id: visitor.visitor_id,
    });
    setShowRegisterForm(false);
    setSplashTitle('Selamat datang kembali di Glosindo');
    setSplashSubtitle(`Halo ${visitor.name}, terima kasih sudah kembali.`);
    setSplashOpen(true);
    toast.success(`Wajah cocok dengan ${visitor.name}`);
  };

  const handleNoMatch = (descriptor) => {
    setFaceDescriptor(descriptor);
    setSelectedVisitor(null);
    setShowRegisterForm(true);
    toast('Tamu belum terdaftar. Silakan lengkapi pendaftaran.', { icon: 'ℹ️' });
  };

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
    setFaceDescriptor(null); // Reset descriptor setelah registrasi berhasil
    setEmbeddingsRefreshToken((prev) => prev + 1);
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

      // Show success screen
      setSplashTitle('Berhasil Check-In!');
      setSplashSubtitle(`Halo ${selectedVisitor.name}, terima kasih sudah mengisi buku tamu kami.`);
      setSplashOpen(true);

      toast.success(`Check-In Berhasil! ${selectedVisitor.name} status IN.`, {
        duration: 4000,
        icon: '🎉',
      });

      // Reset state for next visitor after splash closes
      setTimeout(() => {
        setSelectedVisitor(null);
        setPurpose('');
        setMeetTo('');
        setFaceDescriptor(null);
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
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Check-In Tamu</h1>
          <p className="text-sm text-gray-500 mt-1">Pindai wajah tamu via AI Camera atau cari data tamu secara manual.</p>
        </div>

        {/* Tab switch */}
        <div className="inline-flex p-1 bg-gray-200/70 rounded-xl">
          <button
            onClick={() => { setActiveTab('camera'); setSelectedVisitor(null); setShowRegisterForm(false); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'camera' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📷 Scan Wajah AI
          </button>
          <button
            onClick={() => { setActiveTab('manual'); setSelectedVisitor(null); setShowRegisterForm(false); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'manual' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔍 Cari Manual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Scanner or Manual Search */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {activeTab === 'camera' ? (
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Camera Identification
              </h2>
              <FaceScanner
                onMatchFound={handleMatchFound}
                onNoMatch={handleNoMatch}
                reloadSignal={embeddingsRefreshToken}
              />
            </div>
          ) : (
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-4">Cari Data Tamu</h2>
              <form onSubmit={handleManualSearch} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama, telepon, atau instansi..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {searching ? 'Mencari...' : 'Cari'}
                </button>
              </form>

              {/* Results list */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto">
                {searchResults.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => { setSelectedVisitor(v); setShowRegisterForm(false); }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedVisitor?.id === v.id
                        ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{v.name}</p>
                      <p className="text-xs text-gray-500">{v.company || 'Pribadi'} • {v.phone || 'Tanpa No HP'}</p>
                    </div>
                    {selectedVisitor?.id === v.id && (
                      <span className="text-xs bg-blue-600 text-white font-bold px-2.5 py-1 rounded-full">Dipilih</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <button
                  onClick={() => { setSelectedVisitor(null); setShowRegisterForm(true); }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  + Tambah / Registrasi Tamu Baru
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Register Form OR Check-In Purpose Form */}
        <div className="lg:col-span-6">
          {showRegisterForm ? (
            <VisitorFormPage
              faceVectorPreset={faceDescriptor}
              onSuccess={handleRegisterSuccess}
              onCancel={() => setShowRegisterForm(false)}
            />
          ) : selectedVisitor ? (
            <>
              <SuccessScreen
                open={splashOpen}
                title={splashTitle}
                subtitle={splashSubtitle}
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
              <h3 className="text-base font-bold text-gray-800">Menunggu Hasil Identifikasi</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                Arahkan wajah ke kamera dan tekan tombol <strong>Scan & Identifikasi</strong>, atau cari data tamu secara manual.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
