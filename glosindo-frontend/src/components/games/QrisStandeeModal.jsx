import React, { useRef } from 'react';
import { X, Printer, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';

const QrisStandeeModal = ({ isOpen, onClose, qrData, eventName }) => {
  const printRef = useRef(null);

  if (!isOpen || !qrData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrData.qr_code) return;
    const link = document.createElement('a');
    link.href = qrData.qr_code;
    link.download = `QRIS_${(qrData.title || 'Poin').replace(/\s+/g, '_')}_${qrData.point_value}Poin.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn my-auto">
        
        {/* Modal Toolbar (hidden when printing) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs font-bold tracking-wider uppercase text-slate-200">
              Standee QRIS Poin Games
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Standee Body */}
        <div ref={printRef} className="p-6 bg-slate-50 text-slate-900 flex flex-col items-center print:p-8 print:bg-white">
          
          {/* Card Standee Frame */}
          <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-slate-800 shadow-md p-5 flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Top Red/Navy Header reminiscent of QRIS standards */}
            <div className="w-full -mx-5 -mt-5 px-5 py-3 bg-rose-600 text-white flex items-center justify-between border-b-2 border-slate-800 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-widest">QRIS</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-rose-700 tracking-wider">POIN</span>
              </div>
              <span className="text-[11px] font-semibold tracking-wide text-rose-100">GLOSINDO EVENT</span>
            </div>

            {/* Event Name & Station Title */}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
              {eventName || qrData.event_name || 'Buku Tamu Glosindo'}
            </p>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              {qrData.title || `Pos Poin ${qrData.point_value}`}
            </h3>
            {qrData.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {qrData.description}
              </p>
            )}

            {/* Point Value Pill */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 mt-3 rounded-full bg-emerald-500 text-white font-extrabold text-sm shadow-xs border border-emerald-600">
              <Sparkles className="w-4 h-4" />
              <span>+{qrData.point_value} POIN KELOMPOK</span>
            </div>

            {/* QR Code Container */}
            <div className="relative my-4 p-3 bg-white rounded-xl border border-slate-300 shadow-inner flex items-center justify-center">
              {qrData.qr_code ? (
                <img
                  src={qrData.qr_code}
                  alt={`QR Poin ${qrData.point_value}`}
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  Memuat QR Code...
                </div>
              )}
            </div>

            {/* Token & Instruction */}
            <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200 text-left space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-200/80 pb-1">
                <span>KODE TOKEN:</span>
                <span className="font-bold text-slate-800">{qrData.token?.slice(0, 16)}...</span>
              </div>
              <div className="text-[10px] text-slate-600 pt-1 space-y-0.5">
                <p className="font-bold text-slate-800">Petunjuk Peserta:</p>
                <p>1. Buka menu <strong className="text-blue-700">Scan QR Poin</strong> di HP Anda.</p>
                <p>2. Arahkan kamera ke QR di atas.</p>
                <p>3. Poin otomatis masuk ke akumulasi kelompok Anda.</p>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Berlaku 1x scan per peserta • Sistem Resmi Glosindo
            </div>
          </div>
        </div>

        {/* Action Buttons (print:hidden) */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2.5 print:hidden">
          <Button variant="outline" size="sm" onClick={handleDownload} icon={Download}>
            Unduh QR
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} icon={Printer}>
            Cetak Standee
          </Button>
        </div>

      </div>
    </div>
  );
};

export default QrisStandeeModal;

