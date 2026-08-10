import { useEffect, useState } from 'react';

const SuccessScreen = ({ open, title, subtitle, onClose }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!open) {
      setCountdown(5);
      return;
    }
    
    const timer = setTimeout(() => {
      onClose?.();
    }, 5000);

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white">
      <div className="w-full h-full flex items-center justify-center px-8">
        <div className="w-full max-w-md border-4 border-gray-300 rounded-3xl p-12 text-center bg-white shadow-2xl">
          {/* Check Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-white">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Berhasil Check-In!</h2>

          {/* Subtitle */}
          <p className="text-gray-600 text-base mb-6 leading-relaxed">
            Terima kasih sudah mengisi<br />buku tamu kami.
          </p>

          {/* Visitor Name */}
          <p className="text-2xl font-bold text-gray-900 mb-8">
            Selamat datang, {subtitle.split('Halo ')[1]?.split(',')[0] || 'Tamu'}!
          </p>

          {/* Divider */}
          <div className="border-t-2 border-gray-300 my-6"></div>

          {/* Check-in Details */}
          <div className="space-y-2 text-left text-gray-700 mb-8">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Check-in</span>
              <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Waktu</span>
              <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
            </div>
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition mb-3"
          >
            Kembali ke Halaman Utama
          </button>

          {/* Auto Redirect Timer */}
          <p className="text-xs text-gray-500">
            Otomatis kembali dalam {countdown}s
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
