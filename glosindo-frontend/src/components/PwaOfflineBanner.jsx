import { WifiOff } from 'lucide-react';
import usePwa from '../hooks/usePwa';

const PwaOfflineBanner = () => {
  const { isOnline } = usePwa();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none">
      <div className="px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-300">
        <WifiOff className="w-4 h-4 text-slate-950" />
        <span>Mode Offline Kiosk Aktif (Koneksi Kantor Terputus)</span>
      </div>
    </div>
  );
};

export default PwaOfflineBanner;

