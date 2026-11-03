import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import {
  Trophy,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  User,
  Users,
  Keyboard,
  ShieldCheck,
  RefreshCw,
  QrCode
} from 'lucide-react';
import gamesEventService from '../../services/gamesEventService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const playSuccessChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio errors
  }
};

const GamesScanPointPage = () => {
  const navigate = useNavigate();

  // Participant State
  const [participantId, setParticipantId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isParticipantSet, setIsParticipantSet] = useState(false);

  // Scanner States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  // Result States
  const [result, setResult] = useState(null);

  const html5QrCodeRef = useRef(null);

  // 1. Check local storage for active participant
  useEffect(() => {
    const saved = localStorage.getItem('glosindo_games_active_participant');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id) {
          setParticipantId(parsed.id);
          setParticipantName(parsed.name || `Peserta #${parsed.id}`);
          setGroupName(parsed.groupName || 'Tim');
          setIsParticipantSet(true);
        }
      } catch {
        // Ignore JSON error
      }
    }
  }, []);

  // 2. Start Camera when participant is set and not in manual mode
  useEffect(() => {
    if (!isParticipantSet || manualMode || result) {
      stopCamera();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      setCameraError(null);
      try {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode('public-qr-reader');
        }

        const qr = html5QrCodeRef.current;
        if (qr.isScanning) {
          await qr.stop();
        }

        await qr.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) {
              handleTokenDetected(decodedText);
            }
          },
          () => {}
        );

        if (isMounted) setCameraActive(true);
      } catch (err) {
        if (isMounted) {
          console.warn('Camera error:', err);
          setCameraError('Kamera tidak dapat diakses atau izin ditolak. Silakan gunakan mode input token.');
          setCameraActive(false);
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, [isParticipantSet, manualMode, result]);

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        setCameraActive(false);
      }
    } catch {
      // Ignore stop errors
    }
  };

  const handleTokenDetected = async (token) => {
    if (scanning) return;
    setScanning(true);
    await stopCamera();
    await processScan(token.trim());
  };

  const processScan = async (token) => {
    try {
      const res = await gamesEventService.scanPoint({
        participant_id: parseInt(participantId),
        qr_token: token,
      });

      playSuccessChime();
      setResult(res.data.data);
      toast.success(res.data.message || 'Poin berhasil didapatkan!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal scan QR poin';
      toast.error(errorMsg);
      setTimeout(() => {
        setScanning(false);
        setResult(null);
      }, 2000);
    } finally {
      setScanning(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      toast.error('Token QR wajib diisi');
      return;
    }
    setSubmittingManual(true);
    await processScan(manualToken.trim());
    setSubmittingManual(false);
    setManualToken('');
  };

  const handleSaveParticipant = (e) => {
    e.preventDefault();
    if (!participantId) {
      toast.error('Participant ID wajib diisi');
      return;
    }
    const name = participantName.trim() || `Peserta #${participantId}`;
    localStorage.setItem(
      'glosindo_games_active_participant',
      JSON.stringify({
        id: participantId,
        name: name,
        groupName: groupName.trim() || 'Tim',
      })
    );
    setIsParticipantSet(true);
  };

  const handleChangeParticipant = () => {
    stopCamera();
    setIsParticipantSet(false);
    setResult(null);
    localStorage.removeItem('glosindo_games_active_participant');
  };

  const handleResetForNext = () => {
    setResult(null);
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none">
      
      {/* Top Navbar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">
            QRIS Poin Games
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="hidden sm:inline">Server Live</span>
        </div>
      </div>

      {/* Main Responsive Body */}
      <div className="max-w-4xl w-full mx-auto my-auto py-6">
        
        {/* Step 1: Input Participant ID if not set */}
        {!isParticipantSet ? (
          <div className="max-w-md mx-auto bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-5 animate-scaleIn">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                <User className="w-7 h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Identitas Peserta Games
              </h1>
              <p className="text-xs text-slate-400">
                Masukkan ID peserta yang didapat saat pendaftaran kelompok untuk mulai mengumpulkan poin.
              </p>
            </div>

            <form onSubmit={handleSaveParticipant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Participant ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  placeholder="Contoh: 12"
                  className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-white font-mono text-sm focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nama Anda (Opsional):
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Nama panggilan"
                  className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-white text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nama Kelompok (Opsional):
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Contoh: Tim Merah"
                  className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-white text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg"
                icon={Camera}
              >
                Mulai Scan QR Poin
              </Button>
            </form>
          </div>
        ) : result ? (
          /* Step 3: Success Celebration View */
          <div className="max-w-md mx-auto bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl text-center space-y-5 animate-scaleIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider mb-2">
                Poin Sukses Diklaim!
              </span>
              <h2 className="text-4xl font-black text-emerald-400">
                +{result.points_earned} POIN
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Poin telah otomatis diakumulasikan ke kelompok Anda.
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Peserta:</span>
                <span className="font-bold text-white">{result.participant}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Kelompok:</span>
                <span className="font-extrabold text-blue-400">{result.group}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Total Poin Peserta:</span>
                <span className="text-lg font-black text-amber-400">{result.total_points} Poin</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black shadow-lg"
                onClick={handleResetForNext}
                icon={Camera}
              >
                Scan Pos Selanjutnya
              </Button>
              <button
                type="button"
                onClick={handleChangeParticipant}
                className="text-xs text-slate-400 hover:text-white font-medium"
              >
                Ganti Peserta Lain
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Live Camera Viewfinder & Responsive Dashboard */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Viewfinder Column (7 cols on Desktop / Tab) */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Participant Bar */}
              <div className="flex items-center justify-between bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{participantName}</p>
                    <p className="text-[11px] text-blue-400 truncate">{groupName} • ID #{participantId}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleChangeParticipant}
                  className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
                >
                  Ganti
                </button>
              </div>

              {/* Viewfinder Frame */}
              {!manualMode ? (
                <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-black aspect-square max-w-sm sm:max-w-md mx-auto shadow-2xl flex items-center justify-center">
                  <div id="public-qr-reader" className="w-full h-full" />
                  
                  {/* Modern Reticle Framing */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-60 h-60 border border-white/20 rounded-2xl">
                      <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-amber-400 rounded-tl-xl" />
                      <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-amber-400 rounded-tr-xl" />
                      <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-amber-400 rounded-bl-xl" />
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-amber-400 rounded-br-xl" />

                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
                    </div>
                  </div>

                  {scanning && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                      <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-bold tracking-wider">Memvalidasi Poin QRIS...</p>
                    </div>
                  )}

                  {cameraError && (
                    <div className="absolute inset-0 bg-slate-900/90 p-5 flex flex-col items-center justify-center text-center text-white space-y-3">
                      <AlertTriangle className="w-8 h-8 text-amber-400" />
                      <p className="text-xs text-slate-300">{cameraError}</p>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setManualMode(true)}
                        icon={Keyboard}
                      >
                        Gunakan Kode Token
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* Manual Token Fallback Card */
                <form onSubmit={handleManualSubmit} className="p-6 bg-slate-800 rounded-3xl border border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Keyboard className="w-4 h-4 text-slate-400" />
                      Input Kode Token QR Poin:
                    </label>
                    <button
                      type="button"
                      onClick={() => setManualMode(false)}
                      className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Buka Kamera
                    </button>
                  </div>
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Masukkan token dari QR poin"
                    className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-white font-mono text-sm focus:ring-2 focus:ring-amber-500"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                    loading={submittingManual}
                    icon={Sparkles}
                  >
                    Klaim Poin Manual
                  </Button>
                </form>
              )}

              {/* Mode Switcher */}
              <div className="flex items-center justify-between text-xs px-2 pt-1 text-slate-400">
                <span>{manualMode ? 'Kembali ke mode kamera' : 'Kamera terkunci?'}</span>
                <button
                  type="button"
                  onClick={() => setManualMode(!manualMode)}
                  className="font-bold text-amber-400 hover:underline"
                >
                  {manualMode ? 'Nyalakan Kamera Scanner' : 'Ketik Token Manual'}
                </button>
              </div>
            </div>

            {/* Instruction & Info Column (5 cols on Desktop / Tab) */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Panduan QRIS Poin Games</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <p>1. Arahkan kamera ke standee QRIS poin yang disediakan di setiap pos games.</p>
                  <p>2. Pastikan QR code berada tepat di dalam kotak bidik kuning.</p>
                  <p>3. Poin otomatis tercatat ke kelompok Anda dalam hitungan detik.</p>
                </div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-300">Ketentuan Poin:</p>
                <p className="mt-0.5">Satu QR pos hanya dapat diklaim 1 kali oleh masing-masing peserta untuk mencegah perolehan ganda.</p>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Footer */}
      <div className="max-w-4xl w-full mx-auto text-center pt-4 border-t border-slate-800 text-[11px] text-slate-500">
        Buku Tamu Glosindo • Sistem Poin Games & Kompetisi Kelompok
      </div>

    </div>
  );
};

export default GamesScanPointPage;
