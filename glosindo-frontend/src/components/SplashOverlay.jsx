import { useEffect, useState } from 'react';
import { CheckCircle, LogOut, UserPlus, Clock, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';

const TYPE_CONFIG = {
  checkin: {
    badgeVariant: 'success',
    badgeLabel: 'CHECK-IN BERHASIL',
    mainLabel: 'Selamat Datang!',
    subLabel: 'Data kunjungan Anda telah terverifikasi oleh sistem.',
    timeLabel: 'Waktu Masuk',
    iconBg: 'bg-emerald-600',
    icon: <CheckCircle className="w-12 h-12 text-white" />,
  },
  checkout: {
    badgeVariant: 'navy',
    badgeLabel: 'CHECK-OUT BERHASIL',
    mainLabel: 'Sampai Jumpa!',
    subLabel: 'Terima kasih atas kunjungan Anda di Glosindo.',
    timeLabel: 'Waktu Keluar',
    iconBg: 'bg-brand-navy',
    icon: <LogOut className="w-12 h-12 text-white" />,
  },
  newvisitor: {
    badgeVariant: 'cyan',
    badgeLabel: 'REGISTRASI BERHASIL',
    mainLabel: 'Pendaftaran Selesai!',
    subLabel: 'Profil dan data biometrik Anda telah tersimpan di sistem.',
    timeLabel: 'Waktu Pendaftaran',
    iconBg: 'bg-brand-cyan-dark',
    icon: <UserPlus className="w-12 h-12 text-white" />,
  },
};

const SuccessScreen = ({ open, type = 'checkin', visitorName, meta = {}, onClose }) => {
  const [countdown, setCountdown] = useState(5);
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.checkin;

  useEffect(() => {
    if (!open) return;

    setCountdown(5);

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
  const timeStr = new Date(displayTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const dateStr = new Date(displayTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden animate-scaleIn">
        {/* Top Decorative Color Bar */}
        <div className={`h-3 w-full ${config.iconBg}`} />

        <div className="p-8 text-center">
          {/* Main Success Icon */}
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl ${config.iconBg} shadow-lg shadow-brand-navy/20`}>
            {config.icon}
          </div>

          <div className="mb-3">
            <Badge variant={config.badgeVariant} dot>
              {config.badgeLabel}
            </Badge>
          </div>

          {/* Visitor Name */}
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            {visitorName || 'Tamu Glosindo'}
          </h2>

          <p className="text-base font-bold text-slate-800">{config.mainLabel}</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {config.subLabel}
          </p>

          {/* Visit Meta Details Card */}
          <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-left text-xs font-medium">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-cyan" /> {config.timeLabel}
              </span>
              <span className="font-bold text-slate-900">{timeStr}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-cyan" /> Tanggal
              </span>
              <span className="font-bold text-slate-900">{dateStr}</span>
            </div>

            {meta.meetTo && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-cyan" /> Bertemu
                </span>
                <span className="font-bold text-slate-900 text-right max-w-[55%] truncate">{meta.meetTo}</span>
              </div>
            )}

            {meta.purpose && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-cyan" /> Keperluan
                </span>
                <span className="font-bold text-slate-900 text-right max-w-[55%] truncate">{meta.purpose}</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={onClose}
            icon={ArrowRight}
          >
            Kembali ke Beranda
          </Button>

          <p className="text-[11px] text-slate-400 font-medium mt-3">
            Otomatis kembali dalam <span className="font-bold text-brand-navy">{countdown}d</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
