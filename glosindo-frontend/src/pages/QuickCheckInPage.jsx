import { useState } from 'react';
import FaceScanner from '../components/FaceScanner';
import SplashOverlay from '../components/SplashOverlay';
import visitService from '../services/visitService';
import toast from 'react-hot-toast';

const QuickCheckInPage = () => {
  const [processing, setProcessing] = useState(false);
  const [splashOpen, setSplashOpen] = useState(false);
  const [splashType, setSplashType] = useState('checkin');
  const [visitorName, setVisitorName] = useState('');
  const [reloadSignal, setReloadSignal] = useState(0);

  const handleMatchFound = async (visitor) => {
    if (processing) return;
    
    console.log('=== Quick Check Debug ===');
    console.log('Visitor matched:', visitor);
    
    setProcessing(true);
    try {
      // Cek dulu apakah visitor punya active visit
      const activeVisitsRes = await visitService.getActive();
      console.log('Active visits response:', activeVisitsRes);
      
      const visitorId = visitor.id || visitor.visitor_id;
      const activeVisit = activeVisitsRes.data?.find(v => v.visitor_id === visitorId);
      console.log('Found active visit for this visitor:', activeVisit);
      
      if (activeVisit) {
        // Ada active visit, lakukan check-out
        console.log('Attempting check-out for visit ID:', activeVisit.id);
        await visitService.checkOut(activeVisit.id);
        
        setVisitorName(visitor.name);
        setSplashType('checkout');
        setSplashOpen(true);
        toast.success(`Check-Out Berhasil! ${visitor.name}`, { icon: '👋' });
      } else {
        // Tidak ada active visit, lakukan check-in
        const checkInData = {
          visitor_id: visitorId,
          purpose: 'Quick Check-In',
          meet_to: '-',
        };
        console.log('Attempting check-in with data:', checkInData);
        
        const result = await visitService.checkIn(checkInData);
        console.log('Check-in result:', result);
        
        setVisitorName(visitor.name);
        setSplashType('checkin');
        setSplashOpen(true);
        toast.success(`Check-In Berhasil! ${visitor.name}`, { icon: '✅' });
      }
      
      // Reload scanner setelah 3 detik
      setTimeout(() => {
        setReloadSignal(prev => prev + 1);
      }, 3000);
      
    } catch (err) {
      console.error('Quick process error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      const msg = err.response?.data?.message || 'Gagal memproses';
      toast.error(msg, { duration: 5000 });
    } finally {
      setProcessing(false);
    }
  };

  const handleNoMatch = () => {
    toast.error('Wajah belum terdaftar. Gunakan menu Check-In Tamu untuk registrasi.', {
      duration: 4000,
    });
  };

  const handleSplashClose = () => {
    setSplashOpen(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <SplashOverlay
        open={splashOpen}
        type={splashType}
        visitorName={visitorName}
        onClose={handleSplashClose}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Quick Check-In/Out
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Scan wajah langsung untuk check-in atau check-out otomatis. Tanpa form tambahan.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-2 text-sm text-blue-700 font-semibold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Auto Mode
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6 items-start">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Live Camera Scan</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              Auto Detect
            </span>
          </div>
          
          {!splashOpen && (
            <FaceScanner
              onMatchFound={handleMatchFound}
              onNoMatch={handleNoMatch}
              reloadSignal={reloadSignal}
              silentMode={true}
            />
          )}
          
          {splashOpen && (
            <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-2xl border-2 border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium text-sm">Kamera dinonaktifkan</p>
                <p className="text-gray-400 text-xs mt-1">Menampilkan hasil...</p>
              </div>
            </div>
          )}
          
          {processing && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
                <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
                <span className="text-sm font-semibold text-blue-700">
                  Memproses...
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Cara Pakai
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>1. Arahkan wajah ke kamera</li>
              <li>2. Sistem deteksi status otomatis</li>
              <li>3. Belum check-in? Auto check-in</li>
              <li>4. Sudah check-in? Auto check-out</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-2">
              Mode Otomatis
            </h3>
            <p className="text-sm text-blue-700">
              Sistem deteksi status visitor otomatis. Bila belum check-in, proses check-in (Purpose: "Quick Check-In", Meet To: "-"). Bila sudah IN, proses check-out.
            </p>
          </div>

          <div className="bg-amber-50 rounded-3xl p-6 shadow-sm border border-amber-200">
            <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">
              Catatan
            </h3>
            <p className="text-sm text-amber-700">
              Untuk registrasi tamu baru atau check-in dengan detail lengkap, gunakan menu "Check-In Tamu".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickCheckInPage;
