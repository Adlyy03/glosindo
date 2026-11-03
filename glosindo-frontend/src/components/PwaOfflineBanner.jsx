import { WifiOff, Download, Wifi } from 'lucide-react';
import usePwa from '../hooks/usePwa';

const PwaOfflineBanner = () => {
  const { isOnline, isInstallable, isInstalled, installPwa } = usePwa();

  return (
    <>
      {/* Offline Status Floating Pill */}
      {!isOnline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-300">
            <WifiOff className="w-4 h-4 text-slate-950" />
            <span>Mode Offline Kiosk Aktif (Koneksi Kantor Terputus)</span>
          </div>
        </div>
      )}

      {/* Install PWA Prompt Button (Only shown if browser supports and not yet installed) */}
      {isInstallable && !isInstalled && isOnline && (
        <div className="fixed bottom-4 right-4 z-40 animate-fadeIn">
          <button
            type="button"
            onClick={installPwa}
            className="px-4 py-2.5 rounded-2xl bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold shadow-xl border border-white/20 flex items-center gap-2 backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
            title="Install GLOSINDO Kiosk ke Desktop/Tablet"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Install Aplikasi Kiosk</span>
          </button>
        </div>
      )}
    </>
  );
};

export default PwaOfflineBanner;

