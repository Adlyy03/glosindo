import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, CheckCircle, AlertTriangle, ArrowRight, UserPlus, Info, ShieldCheck } from 'lucide-react';
import FaceScanner from '../components/FaceScanner';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Biometric Face Check-In
            </h1>
            <Badge variant="cyan" dot>Live Kiosk</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Scan wajah tamu menggunakan AI camera untuk verifikasi otomatis dan mempercepat proses masuk.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-center">
          <Link to="/check-in/manual">
            <Button variant="outline" size="md" icon={UserPlus}>
              Check-In Manual / Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Kiosk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Camera Scanner Container */}
        <Card className="lg:col-span-7 xl:col-span-8 p-6 md:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-navy text-white shadow-xs">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Live Camera Kiosk</h2>
                <p className="text-xs text-slate-500 font-medium">Arahkan wajah ke kamera depan</p>
              </div>
            </div>
            <Badge variant="navy">Auto Scan</Badge>
          </div>

          <FaceScanner
            onMatchFound={handleMatchFound}
            onNoMatch={handleNoMatch}
            reloadSignal={reloadSignal}
          />
        </Card>

        {/* Right Info & Status Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Realtime Status Card */}
          {matchedVisitor ? (
            <div className="bg-emerald-500 text-white rounded-3xl p-6 shadow-xl space-y-4 animate-scaleIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-6 h-6 text-emerald-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Teridentifikasi
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black leading-tight">{matchedVisitor.name}</h3>
                <p className="text-sm text-emerald-100 mt-1 font-medium">
                  {matchedVisitor.company || 'Instansi tidak diisi'}
                </p>
              </div>
              <Link to="/check-in/manual" className="block pt-2">
                <Button variant="emerald" size="lg" fullWidth icon={ArrowRight}>
                  Lanjut ke Form Check-In
                </Button>
              </Link>
            </div>
          ) : noMatchDetected ? (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-md space-y-4 animate-scaleIn">
              <div className="flex items-center gap-2.5 text-amber-800">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Wajah Belum Terdaftar
                </span>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed font-medium">
                Wajah tidak ditemukan di database. Lanjutkan ke pendaftaran tamu baru.
              </p>
              <Link to="/check-in/manual" className="block">
                <Button variant="secondary" size="lg" fullWidth icon={UserPlus}>
                  Daftar Tamu Baru
                </Button>
              </Link>
            </div>
          ) : (
            <Card className="bg-slate-50/70 border-dashed border-slate-300 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white text-brand-navy border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Camera className="w-6 h-6 text-brand-cyan" />
              </div>
              <h3 className="text-slate-900 font-bold text-base mb-1">Menunggu Pemindaian</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Posisikan wajah di tengah lingkaran bingkai kamera untuk verifikasi.
              </p>
            </Card>
          )}

          {/* Guidelines Card */}
          <Card padding="p-6">
            <CardHeader className="flex items-center gap-2 pb-3 mb-3">
              <Info className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Petunjuk Pemindaian
              </h3>
            </CardHeader>
            <ul className="space-y-3 text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-navy/10 text-brand-navy text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Pastikan pencahayaan ruangan cukup terang.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-navy/10 text-brand-navy text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>Lepaskan kacamata hitam atau penutup wajah berlebih.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-navy/10 text-brand-navy text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Sistem secara otomatis memindai setiap 5 detik.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckInCameraPage;
