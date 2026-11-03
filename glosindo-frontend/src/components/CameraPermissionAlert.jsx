import { useState } from 'react';
import { CameraOff, AlertTriangle, RefreshCw, ShieldAlert, Copy, Check, Lock, Info } from 'lucide-react';
import Button from './ui/Button';

/**
 * CameraPermissionAlert
 * Komponen panduan perizinan kamera lengkap untuk semua role & pengunjung.
 * Menangani kasus:
 * 1. Izin ditolak browser (permission_denied)
 * 2. Akses via HTTP non-SSL (insecure_origin)
 * 3. Kamera tidak ditemukan (not_found)
 * 4. Kamera sedang dipakai aplikasi lain (in_use)
 */
const CameraPermissionAlert = ({ error, onRetry, fullscreen = false, className = '' }) => {
  const [copied, setCopied] = useState(false);

  // Normalize error
  let type = 'general';
  let title = 'Kendala Akses Kamera';
  let message = typeof error === 'string' ? error : error?.message || 'Tidak dapat mengakses perangkat kamera.';
  let guide = error?.guide || null;

  if (typeof error === 'object' && error !== null) {
    type = error.type || 'general';
    if (error.title) title = error.title;
  } else if (typeof error === 'string') {
    const lower = error.toLowerCase();
    if (lower.includes('izin') || lower.includes('denied') || lower.includes('notallowed') || lower.includes('tolak')) {
      type = 'permission_denied';
      title = 'Izin Akses Kamera Ditolak';
      message = 'Browser Anda menolak akses kamera untuk situs ini. Mohon berikan izin agar fitur dapat berfungsi.';
      guide = [
        'Klik ikon Gembok atau Setelan Situs (🔒) di sebelah kiri alamat URL browser.',
        'Cari menu "Kamera" (Camera), lalu ubah pengaturannya menjadi "Izinkan" (Allow).',
        'Klik tombol "Minta Izin Kamera Ulang" di bawah ini atau refresh halaman browser Anda.'
      ];
    } else if (lower.includes('secure') || lower.includes('getusermedia') || lower.includes('http')) {
      type = 'insecure_origin';
      title = 'Koneksi Aman (HTTPS) Diperlukan untuk Kamera';
      message = 'Browser memblokir kamera jika website dibuka via HTTP biasa. Harap beralih ke HTTPS agar kamera langsung aktif.';
      guide = [
        'Klik tombol hijau "Buka via HTTPS" di bawah ini.',
        'Jika muncul peringatan sertifikat browser, klik "Lanjutan" (Advanced) lalu klik "Lanjutkan ke 103.134.221.200 (Proceed)".',
        'Klik "Izinkan" (Allow) pada popup permintaan izin kamera.'
      ];
    } else if (lower.includes('tidak ditemukan') || lower.includes('notfound') || lower.includes('device')) {
      type = 'not_found';
      title = 'Kamera Tidak Ditemukan';
      message = 'Perangkat webcam atau kamera depan tidak terdeteksi oleh browser.';
      guide = [
        'Pastikan kabel USB webcam atau kamera laptop terpasang dengan baik.',
        'Pastikan driver kamera telah aktif pada sistem operasi Anda.'
      ];
    } else if (lower.includes('digunakan') || lower.includes('in use') || lower.includes('notreadable')) {
      type = 'in_use';
      title = 'Kamera Sedang Digunakan';
      message = 'Kamera sedang aktif pada aplikasi lain (seperti Zoom, Google Meet, Teams, atau tab lain).';
      guide = [
        'Tutup aplikasi atau tab lain yang sedang menggunakan kamera.',
        'Setelah itu, klik tombol "Coba Kamera Lagi" di bawah.'
      ];
    }
  }

  const handleCopyOrigin = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'permission_denied':
        return <Lock className="w-7 h-7 text-amber-600" />;
      case 'insecure_origin':
        return <ShieldAlert className="w-7 h-7 text-indigo-600" />;
      case 'not_found':
      case 'in_use':
        return <CameraOff className="w-7 h-7 text-rose-600" />;
      default:
        return <AlertTriangle className="w-7 h-7 text-amber-600" />;
    }
  };

  const getTheme = () => {
    switch (type) {
      case 'permission_denied':
        return {
          wrapper: 'bg-amber-50/95 border-amber-300 text-amber-950',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          bullet: 'bg-amber-500 text-white',
        };
      case 'insecure_origin':
        return {
          wrapper: 'bg-indigo-50/95 border-indigo-300 text-indigo-950',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          bullet: 'bg-indigo-600 text-white',
        };
      case 'not_found':
      case 'in_use':
        return {
          wrapper: 'bg-rose-50/95 border-rose-300 text-rose-950',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          bullet: 'bg-rose-500 text-white',
        };
      default:
        return {
          wrapper: 'bg-slate-50/95 border-slate-300 text-slate-900',
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          bullet: 'bg-slate-600 text-white',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`rounded-3xl border-2 p-6 md:p-7 shadow-lg flex flex-col items-center text-center transition-all animate-fadeIn ${
        fullscreen ? 'max-w-xl mx-auto my-auto backdrop-blur-md bg-white/95 text-slate-900 border-slate-200' : theme.wrapper
      } ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-4">
        {getIcon()}
      </div>

      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 border ${theme.badge}`}>
        {type === 'permission_denied'
          ? 'Perizinan Dibutuhkan'
          : type === 'insecure_origin'
          ? 'Konfigurasi Browser'
          : 'Status Kamera'}
      </span>

      <h3 className="font-extrabold text-base md:text-lg mb-1.5">{title}</h3>
      <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto mb-4 leading-relaxed">
        {message}
      </p>

      {/* Panduan Langkah Demi Langkah */}
      {guide && guide.length > 0 && (
        <div className="w-full text-left bg-white/90 rounded-2xl p-4 border border-slate-200/80 mb-5 shadow-xs space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Panduan Mengaktifkan:
          </p>
          <ol className="space-y-2 text-xs text-slate-700">
            {guide.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-snug">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 ${theme.bullet}`}>
                  {idx + 1}
                </span>
                <span className="flex-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Copy URL Helper jika origin HTTP */}
      {type === 'insecure_origin' && (
        <div className="w-full mb-4 flex items-center gap-2 bg-white rounded-xl p-2 border border-slate-200">
          <input
            type="text"
            readOnly
            value={window.location.origin}
            className="flex-1 bg-transparent px-2 text-xs font-mono text-slate-600 outline-none"
          />
          <button
            type="button"
            onClick={handleCopyOrigin}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin' : 'Salin URL'}
          </button>
        </div>
      )}

      {/* Direct One-Click HTTPS Switch Button */}
      {typeof window !== 'undefined' && window.location.protocol === 'http:' && (
        <button
          type="button"
          onClick={() => {
            window.location.href = window.location.href.replace('http:', 'https:');
          }}
          className="w-full mb-4 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Lock className="w-5 h-5 text-emerald-200" />
          <span>Buka via HTTPS (Kamera Langsung Aktif)</span>
        </button>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full justify-center">
        {onRetry && (
          <Button
            size="md"
            variant="primary"
            onClick={onRetry}
            icon={RefreshCw}
            className="w-full sm:w-auto"
          >
            Minta Izin Kamera Ulang
          </Button>
        )}
        <Button
          size="md"
          variant="outline"
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto"
        >
          Muat Ulang Halaman
        </Button>
      </div>
    </div>
  );
};

export default CameraPermissionAlert;
