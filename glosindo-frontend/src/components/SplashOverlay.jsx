import { useEffect } from 'react';

const SuccessScreen = ({ open, title, subtitle, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, 2800);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/95 p-8 text-center shadow-2xl shadow-slate-950/40">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
          <span className="text-3xl font-black">✨</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="mt-3 text-sm text-slate-300">{subtitle}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-white/5 transition hover:bg-white/15"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
