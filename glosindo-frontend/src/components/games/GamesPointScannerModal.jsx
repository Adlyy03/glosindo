import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import {
  X,
  Camera,
  RefreshCw,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  User,
  Users,
  Sparkles,
  Zap,
  Keyboard,
  ShieldCheck
} from 'lucide-react';
import gamesEventService from '../../services/gamesEventService';
import Button from '../ui/Button';

const playSuccessChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1); // B5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio errors on unauthenticated browser policies
  }
};

const GamesPointScannerModal = ({ isOpen, onClose, eventId, onScanSuccess }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [groupName, setGroupName] = useState('');

  // Scanner states
  const [cameraStarted, setCameraStarted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  // Result state
  const [scanResult, setScanResult] = useState(null);

  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // 1. Load groups and saved participant on open
  useEffect(() => {
    if (!isOpen) return;

    const saved = localStorage.getItem('glosindo_games_active_participant');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id) {
          setSelectedParticipantId(parsed.id);
          setParticipantName(parsed.name || '');
          setGroupName(parsed.groupName || '');
          setSelectedGroupId(parsed.groupId || '');
        }
      } catch {
        // Ignore JSON error
      }
    }

    if (eventId) {
      gamesEventService.getGroups(eventId)
        .then((res) => {
          setGroups(res.data?.data || []);
        })
        .catch(() => {});
    }
  }, [isOpen, eventId]);

  // 2. Load participants when group changes
  useEffect(() => {
    if (!eventId || !selectedGroupId) {
      setParticipants([]);
      return;
    }

    gamesEventService.getGroupParticipants(eventId, selectedGroupId)
      .then((res) => {
        setParticipants(res.data?.data || []);
      })
      .catch(() => {});
  }, [eventId, selectedGroupId]);

  // 3. Start camera scanner when participant is ready and result is null
  useEffect(() => {
    if (!isOpen || !selectedParticipantId || scanResult || manualMode) {
      stopCamera();
      return;
    }

    let isSubscribed = true;

    const startCamera = async () => {
      setCameraError(null);
      try {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode('games-qr-reader');
        }

        const qrCode = html5QrCodeRef.current;
        if (qrCode.isScanning) {
          await qrCode.stop();
        }

        await qrCode.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isSubscribed) {
              handleQrDetected(decodedText);
            }
          },
          () => {
            // on decode error, ignore continuous attempts
          }
        );

        if (isSubscribed) {
          setCameraStarted(true);
        }
      } catch (err) {
        if (isSubscribed) {
          console.warn('Camera start error:', err);
          setCameraError(
            'Kamera tidak dapat diakses atau izin ditolak. Silakan gunakan mode input manual.'
          );
          setCameraStarted(false);
        }
      }
    };

    const timer = setTimeout(() => {
      startCamera();
    }, 250);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen, selectedParticipantId, scanResult, manualMode]);

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        setCameraStarted(false);
      }
    } catch {
      // Ignore stop errors
    }
  };

  const handleSelectParticipant = (e) => {
    const pId = e.target.value;
    setSelectedParticipantId(pId);
    const pObj = participants.find((p) => String(p.id) === String(pId));
    const gObj = groups.find((g) => String(g.id) === String(selectedGroupId));

    if (pObj && gObj) {
      setParticipantName(pObj.name);
      setGroupName(gObj.name);
      localStorage.setItem(
        'glosindo_games_active_participant',
        JSON.stringify({
          id: pObj.id,
          name: pObj.name,
          groupId: gObj.id,
          groupName: gObj.name,
        })
      );
    }
  };

  const handleQrDetected = async (rawText) => {
    if (scanning) return;
    setScanning(true);

    // Stop camera immediately to prevent repeated scans
    await stopCamera();

    const token = rawText.trim();
    await processToken(token);
  };

  const processToken = async (token) => {
    try {
      const res = await gamesEventService.scanPoint({
        participant_id: parseInt(selectedParticipantId),
        qr_token: token,
      });

      playSuccessChime();
      setScanResult(res.data.data);
      toast.success(res.data.message || 'Poin berhasil didapatkan!');
      onScanSuccess?.(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal scan QR poin';
      toast.error(msg);
      // Restart camera after short error alert
      setTimeout(() => {
        setScanning(false);
        setScanResult(null);
      }, 1800);
    } finally {
      setScanning(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      toast.error('Masukkan token QR');
      return;
    }
    setSubmittingManual(true);
    await processToken(manualToken.trim());
    setSubmittingManual(false);
    setManualToken('');
  };

  const handleResetForNextScan = () => {
    setScanResult(null);
    setScanning(false);
  };

  const handleSwitchParticipant = () => {
    stopCamera();
    setSelectedParticipantId('');
    setParticipantName('');
    setGroupName('');
    setScanResult(null);
    localStorage.removeItem('glosindo_games_active_participant');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-xs overflow-y-auto animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn my-auto flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                Scan QRIS Poin Games
              </h3>
              <p className="text-[11px] text-slate-400">
                Pindai QR poin event langsung dari kamera
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Participant Picker (if not selected) */}
          {!selectedParticipantId ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <User className="w-4 h-4 text-blue-700" />
                  Pilih Identitas Peserta
                </p>
                <p className="text-slate-600">
                  Pilih kelompok dan nama peserta terlebih dahulu agar poin masuk ke profil dan kelompok yang benar.
                </p>
              </div>

              {/* Group Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  Pilih Kelompok:
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => {
                    setSelectedGroupId(e.target.value);
                    setSelectedParticipantId('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Pilih Kelompok / Tim --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.participants_count || 0} peserta)
                    </option>
                  ))}
                </select>
              </div>

              {/* Participant Select */}
              {selectedGroupId && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Pilih Nama Anda:
                  </label>
                  {participants.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                      Belum ada peserta di kelompok ini. Daftarkan peserta di kelompok ini terlebih dahulu.
                    </p>
                  ) : (
                    <select
                      value={selectedParticipantId}
                      onChange={handleSelectParticipant}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">-- Pilih Nama Peserta --</option>
                      {participants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.phone ? `(${p.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          ) : scanResult ? (
            /* Success Celebration Card */
            <div className="p-6 text-center rounded-3xl bg-emerald-50 border-2 border-emerald-300 shadow-inner space-y-4 animate-scaleIn">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-200 text-emerald-900 uppercase tracking-wider mb-2">
                  Poin Sukses Diklaim!
                </span>
                <h2 className="text-3xl font-black text-emerald-800">
                  +{scanResult.points_earned} POIN
                </h2>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  Poin berhasil ditambahkan ke saldo kelompok Anda!
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-emerald-200 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Nama Peserta:</span>
                  <span className="font-bold text-slate-800">{scanResult.participant}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Kelompok:</span>
                  <span className="font-extrabold text-blue-700">{scanResult.group}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500 font-medium">Total Poin Peserta:</span>
                  <span className="text-base font-black text-amber-600">
                    {scanResult.total_points} Poin
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleResetForNextScan}
                  icon={Camera}
                >
                  Scan Pos Lainnya
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                >
                  Selesai
                </Button>
              </div>
            </div>
          ) : (
            /* Active Scanner Section */
            <div className="space-y-4">
              {/* Active Participant Badge */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                    {participantName?.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{participantName}</p>
                    <p className="text-[11px] text-blue-700 font-semibold truncate">{groupName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSwitchParticipant}
                  className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg transition-colors border border-slate-300"
                >
                  Ganti Peserta
                </button>
              </div>

              {/* Camera Viewport or Manual Input */}
              {!manualMode ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 aspect-square max-w-sm mx-auto shadow-inner flex items-center justify-center">
                  <div id="games-qr-reader" className="w-full h-full" />
                  
                  {/* Framing Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-56 h-56 border border-white/20 rounded-2xl">
                      {/* 4 Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-xl" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-xl" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-xl" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-xl" />
                      
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
                    </div>
                  </div>

                  {scanning && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                      <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-bold tracking-wider">Memproses Poin QRIS...</p>
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
                        Gunakan Kode Manual
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* Manual Token Input Card */
                <form onSubmit={handleManualSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Keyboard className="w-4 h-4 text-slate-500" />
                      Input Kode Token QR Poin:
                    </label>
                    <button
                      type="button"
                      onClick={() => setManualMode(false)}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Buka Kamera
                    </button>
                  </div>
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Contoh: pt-8f92a1... atau token QR"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={submittingManual}
                    icon={Sparkles}
                  >
                    Klaim Poin Manual
                  </Button>
                </form>
              )}

              {/* Mode switch link */}
              <div className="flex items-center justify-between text-xs px-2 pt-1">
                <span className="text-slate-500">
                  {manualMode ? 'Kembali ke mode kamera' : 'Kamera bermasalah?'}
                </span>
                <button
                  type="button"
                  onClick={() => setManualMode(!manualMode)}
                  className="font-bold text-blue-700 hover:text-blue-900 transition-colors"
                >
                  {manualMode ? 'Buka Kamera Pemindai' : 'Input Token Manual'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Anti-Duplikasi (1x scan per pos)</span>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="font-bold text-slate-700 hover:text-slate-900"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

export default GamesPointScannerModal;

