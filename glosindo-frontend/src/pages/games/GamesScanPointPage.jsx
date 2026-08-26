import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Trophy, Scan, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import gamesEventService from '../../services/gamesEventService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const GamesScanPointPage = () => {
  const [participantId, setParticipantId] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    
    if (!participantId || !qrToken) {
      toast.error('Participant ID dan QR Token wajib diisi');
      return;
    }

    setScanning(true);
    setResult(null);
    setError(null);

    try {
      const res = await gamesEventService.scanPoint({
        participant_id: parseInt(participantId),
        qr_token: qrToken.trim(),
      });
      
      setResult(res.data.data);
      toast.success(res.data.message);
      
      // Reset form
      setQrToken('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal scan QR';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setQrToken('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Scan QR Poin</h1>
          <p className="text-neutral-600">Scan QR code untuk mendapatkan poin</p>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-lg p-6 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-emerald-700 mb-2">
                +{result.points_earned} Poin!
              </h2>
              <p className="text-neutral-600 mb-4">Berhasil mendapatkan poin</p>
              
              <div className="bg-white rounded-lg p-4 space-y-2 text-left">
                <div>
                  <p className="text-sm text-neutral-600">Peserta</p>
                  <p className="font-medium text-neutral-900">{result.participant}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Kelompok</p>
                  <p className="font-medium text-emerald-700">{result.group}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Total Poin Kamu</p>
                  <p className="font-bold text-2xl text-amber-600">{result.total_points}</p>
                </div>
              </div>
            </div>

            <Button onClick={handleReset} className="w-full">
              Scan Lagi
            </Button>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="bg-danger-50 rounded-lg p-6 text-center">
              <XCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-danger-700 mb-2">Gagal Scan</h2>
              <p className="text-neutral-600">{error}</p>
            </div>

            <Button onClick={handleReset} variant="outline" className="w-full">
              Coba Lagi
            </Button>
          </div>
        ) : (
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Participant ID <span className="text-danger-500">*</span>
              </label>
              <input
                type="number"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                placeholder="Masukkan Participant ID kamu"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-neutral-500">
                ID didapat saat registrasi
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                QR Token <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                placeholder="Token dari QR Code"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Scan QR Code poin dari panitia
              </p>
            </div>

            <Button type="submit" className="w-full" icon={Scan} loading={scanning}>
              {scanning ? 'Memvalidasi...' : 'Scan QR Poin'}
            </Button>

            <div className="bg-amber-50 rounded-lg p-4 mt-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-neutral-700">
                  <p className="font-medium mb-1">Catatan:</p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-600">
                    <li>Setiap QR hanya bisa digunakan sekali</li>
                    <li>Pastikan event masih aktif</li>
                    <li>QR tidak valid akan ditolak sistem</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default GamesScanPointPage;
