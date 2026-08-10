import { useEffect, useState } from 'react';

/**
 * type: 'checkin' | 'checkout' | 'newvisitor'
 * visitorName: string
 * meta: { purpose?, meetTo?, checkInTime?, checkOutTime? }
 */

const TYPE_CONFIG = {
  checkin: {
    bgColor: 'bg-green-500',
    borderColor: 'border-green-200',
    badgeBg: 'bg-green-50',
    badgeText: 'text-green-700',
    badgeLabel: 'CHECK-IN',
    badgeDot: 'bg-green-500',
    mainLabel: 'Selamat Datang!',
    subLabel: 'Kunjungan Anda telah tercatat.',
    timeLabel: 'Waktu Masuk',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  checkout: {
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-200',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeLabel: 'CHECK-OUT',
    badgeDot: 'bg-blue-500',
    mainLabel: 'Sampai Jumpa!',
    subLabel: 'Terima kasih telah berkunjung.',
    timeLabel: 'Waktu Keluar',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
  },
  newvisitor: {
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-200',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeLabel: 'TAMU BARU',
    badgeDot: 'bg-purple-500',
    mainLabel: 'Pendaftaran Berhasil!',
    subLabel: 'Data tamu telah tersimpan.',
    timeLabel: 'Waktu Daftar',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
};

const SuccessScreen = ({ open, type = 'checkin', visitorName, meta = {}, onClose }) => {
  const [countdown, setCountdown] = useState(5);
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.checkin;

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

  const now = new Date();
  const displayTime = meta.checkOutTime || meta.checkInTime || now;
  const timeStr = new Date(displayTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date(displayTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4">
        <div className={`rounded-3xl border-4 ${config.borderColor} bg-white shadow-2xl overflow-hidden`}>
          {/* Top accent bar */}
          <div className={`${config.bgColor} h-2 w-full`} />

          <div className="p-10 text-center">
            {/* Icon */}
            <div className={`mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full ${config.bgColor} text-white shadow-lg`}>
              {config.icon}
            </div>

            {/* Status badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.badgeBg} mb-4`}>
              <span className={`w-2 h-2 rounded-full ${config.badgeDot}`} />
              <span className={`text-xs font-bold tracking-widest ${config.badgeText}`}>{config.badgeLabel}</span>
            </div>

            {/* Visitor name */}
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {visitorName || 'Tamu'}
            </h2>

            {/* Main label */}
            <p className="text-base font-semibold text-gray-700 mb-1">{config.mainLabel}</p>
            <p className="text-sm text-gray-500 mb-6">{config.subLabel}</p>

            {/* Divider */}
            <div className="border-t border-gray-100 my-5" />

            {/* Details */}
            <div className="space-y-2 text-left text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">{config.timeLabel}</span>
                <span className="font-semibold text-gray-800">{timeStr} WIB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal</span>
                <span className="font-semibold text-gray-800">{dateStr}</span>
              </div>
              {meta.meetTo && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Bertemu</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[60%]">{meta.meetTo}</span>
                </div>
              )}
              {meta.purpose && (
                <div className="flex justify-between">
                  <span className="text-gray-500 flex-shrink-0">Keperluan</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[60%] line-clamp-2">{meta.purpose}</span>
                </div>
              )}
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition mb-3 text-sm"
            >
              Kembali ke Halaman Utama
            </button>

            <p className="text-xs text-gray-400">Otomatis kembali dalam {countdown}s</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
