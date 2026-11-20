import React, { useState } from 'react';
import {
  X,
  User,
  Building,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarRange,
  Camera,
  ZoomIn,
  Maximize2,
} from 'lucide-react';
import { getStorageUrl } from '../services/api';
import { formatServerDate } from '../utils/datetime';
import Badge from './ui/Badge';
import Button from './ui/Button';

/**
 * VisitDetailModal — Modal detail kunjungan individual.
 *
 * Props:
 *   isOpen   {boolean}  — tampilkan / sembunyikan modal
 *   visit    {object}   — data kunjungan dari API (visits/history endpoint)
 *   onClose  {function} — callback tutup modal
 */
const VisitDetailModal = ({ isOpen, visit, onClose }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!isOpen || !visit) return null;

  // Resolve nama, instansi dari snapshot atau relasi visitor
  const visitorName =
    visit.visitor?.name ||
    visit.visitor_name ||
    'Tamu Tidak Diketahui';

  const visitorCompany =
    visit.visitor?.company ||
    visit.visitor_company ||
    null;

  // Foto: ambil dari visitor.photo (foto profil tamu)
  // Visits tidak menyimpan foto check-in secara terpisah;
  // yang diarsipkan adalah foto profil tamu yang terdaftar.
  const visitorPhoto =
    visit.visitor?.photo || null;

  const photoUrl = visitorPhoto ? getStorageUrl(visitorPhoto) : null;

  const isOut = visit.status === 'OUT' || Boolean(visit.check_out);
  const isEventVisit = Boolean(visit.event_id || visit.event?.name);

  const meetToDisplay = isEventVisit
    ? visit.meet_to?.startsWith('Event:')
      ? visit.meet_to
      : `Event: ${visit.event?.name || visit.meet_to}`
    : visit.meet_to || '-';

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      {/* ── Main Modal ─────────────────────────────────────────── */}
      {/* z-[55] agar bisa muncul di atas VisitorDetailModal (z-50) */}
      <div
        className="fixed inset-0 z-[55] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn select-none"
        onClick={handleOverlayClick}
      >
        <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 my-auto overflow-hidden animate-scaleIn flex flex-col max-h-[90dvh]">

          {/* ── Header Banner ──────────────────────────────────── */}
          <div className="relative bg-gradient-to-r from-slate-900 via-brand-navy to-slate-900 p-4 sm:p-6 text-white flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">

                {/* Foto / Avatar */}
                <div className="relative flex-shrink-0 group">
                  {photoUrl ? (
                    <>
                      <img
                        src={photoUrl}
                        alt={visitorName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-md bg-slate-800 cursor-pointer"
                        onClick={() => setLightboxOpen(true)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      {/* Overlay zoom hint */}
                      <div
                        className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={() => setLightboxOpen(true)}
                      >
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : null}
                  {/* Fallback avatar */}
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-cyan/20 border-2 border-brand-cyan/40 text-brand-cyan flex items-center justify-center font-black text-xl sm:text-2xl shadow-md ${
                      photoUrl ? 'hidden' : 'flex'
                    }`}
                  >
                    {visitorName?.charAt(0)?.toUpperCase() || (
                      <User className="w-7 h-7 sm:w-8 sm:h-8" />
                    )}
                  </div>
                </div>

                {/* Judul & Badge */}
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                    {visitorName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium truncate flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-brand-cyan flex-shrink-0" />
                    <span className="truncate">
                      {visitorCompany || 'Pribadi / Tanpa Instansi'}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {isEventVisit ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        <CalendarRange className="w-3 h-3" />
                        Kunjungan Event
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-white border border-white/20">
                        <User className="w-3 h-3" />
                        Kunjungan Biasa
                      </span>
                    )}
                    {isOut ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600/40">
                        <CheckCircle2 className="w-3 h-3" />
                        Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        Sedang Berkunjung
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tombol Tutup */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Body ───────────────────────────────────────────── */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">

            {/* Foto Profil Tamu */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-white">
                <Camera className="w-4 h-4 text-brand-navy" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Foto Tamu
                </span>
              </div>
              <div className="p-4 flex items-center justify-center">
                {photoUrl ? (
                  <div className="relative group cursor-pointer" onClick={() => setLightboxOpen(true)}>
                    <img
                      src={photoUrl}
                      alt={visitorName}
                      className="max-h-48 w-auto rounded-xl object-cover shadow-md border border-slate-200"
                      onError={(e) => {
                        e.target.parentElement.innerHTML = `
                          <div class="flex flex-col items-center gap-2 py-6 text-slate-400">
                            <svg class="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            <p class="text-xs font-semibold">Foto tidak dapat dimuat</p>
                          </div>
                        `;
                      }}
                    />
                    <div className="absolute inset-0 rounded-xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Maximize2 className="w-5 h-5 text-white" />
                      <span className="text-white text-xs font-bold">Lihat Full Size</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">Foto profil tamu tidak tersedia</p>
                    <p className="text-[11px] text-slate-400 text-center max-w-[200px] leading-relaxed">
                      Foto belum diunggah saat tamu mendaftar.
                    </p>
                  </div>
                )}
              </div>
              {photoUrl && (
                <div className="px-4 pb-3 pt-0 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-navy text-white hover:bg-brand-navy/90 transition-colors shadow-xs cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Lihat Foto Full Size
                  </button>
                </div>
              )}
            </div>

            {/* Detail Kunjungan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <User className="w-3.5 h-3.5 text-brand-navy" />
                  <span>Nama Tamu</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{visitorName}</p>
                {visit.visitor?.deleted && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 font-bold">
                    Data tamu telah dihapus
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instansi</span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {visitorCompany || 'Pribadi / Tidak Diisi'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bertemu Dengan</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{meetToDisplay}</p>
                {isEventVisit && visit.event?.name && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                    <CalendarRange className="w-3 h-3" />
                    {visit.event.name}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Keperluan</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{visit.purpose || '—'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Waktu Check-In</span>
                </div>
                <p className="text-sm font-bold text-slate-900 font-mono">
                  {visit.check_in
                    ? formatServerDate(visit.check_in, 'DD MMMM YYYY, HH:mm')
                    : '—'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Waktu Check-Out</span>
                </div>
                {isOut && visit.check_out ? (
                  <p className="text-sm font-bold text-slate-900 font-mono">
                    {formatServerDate(visit.check_out, 'DD MMMM YYYY, HH:mm')}
                  </p>
                ) : isOut ? (
                  <p className="text-sm text-slate-400 font-medium">Auto checkout (tidak ada scan keluar)</p>
                ) : (
                  <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Masih Berkunjung
                  </p>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
              isOut
                ? 'bg-slate-50 border-slate-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              {isOut ? (
                <CheckCircle2 className="w-5 h-5 text-slate-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-pulse" />
              )}
              <div>
                <p className={`text-sm font-bold ${isOut ? 'text-slate-700' : 'text-emerald-700'}`}>
                  Status: {isOut ? 'Kunjungan Selesai' : 'Sedang Berkunjung'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isOut
                    ? 'Tamu sudah tercatat keluar dari area.'
                    : 'Tamu saat ini masih berada di area.'}
                </p>
              </div>
              <div className="ml-auto">
                <Badge variant={isOut ? 'neutral' : 'emerald'} dot={!isOut}>
                  {isOut ? 'OUT' : 'IN'}
                </Badge>
              </div>
            </div>

            {/* ID Referensi */}
            <p className="text-[11px] text-slate-400 text-right px-1">
              ID Kunjungan: #{visit.id}
            </p>
          </div>

          {/* ── Footer ─────────────────────────────────────────── */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex justify-end flex-shrink-0">
            <Button variant="outline" size="md" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>

      {/* ── Lightbox Full-Size ─────────────────────────────────── */}
      {/* z-[65] agar di atas semua modal */}
      {lightboxOpen && photoUrl && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center bg-black/90 animate-fadeIn p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
            aria-label="Tutup preview foto"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={photoUrl}
            alt={visitorName}
            className="max-h-[90dvh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-xs font-semibold text-center bg-black/40 px-4 py-1.5 rounded-full">
            {visitorName} &nbsp;·&nbsp; Klik di luar foto untuk menutup
          </p>
        </div>
      )}
    </>
  );
};

export default VisitDetailModal;
