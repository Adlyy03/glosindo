import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Building,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  CalendarRange,
  ShieldCheck,
  FileText,
  ExternalLink,
  History,
  Info
} from 'lucide-react';
import { getStorageUrl } from '../services/api';
import visitorService from '../services/visitorService';
import { formatServerDate } from '../utils/datetime';
import Badge from './ui/Badge';
import Button from './ui/Button';

const VisitorDetailModal = ({ isOpen, visitorId, initialVisitor, onClose, onEdit }) => {
  const [visitor, setVisitor] = useState(initialVisitor || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'visits'

  useEffect(() => {
    if (!isOpen) {
      setVisitor(null);
      setError(null);
      return;
    }

    setVisitor(initialVisitor || null);
    if (!visitorId) return;

    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await visitorService.getById(visitorId);
        if (isMounted && res.data) {
          setVisitor(res.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching visitor detail:', err);
          setError('Gagal memuat rincian lengkap data tamu.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [isOpen, visitorId, initialVisitor]);

  if (!isOpen) return null;

  const currentVisitor = visitor || initialVisitor || {};
  const visits = currentVisitor.visits || [];
  const hasFaceEmbedding = Boolean(
    currentVisitor.face_embedding || currentVisitor.faceEmbedding
  );

  const hasEvent =
    (currentVisitor.event_participants && currentVisitor.event_participants.length > 0) ||
    currentVisitor.latest_visit?.event ||
    visits.some((v) => v.event_id || v.event);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 my-auto overflow-hidden animate-scaleIn flex flex-col max-h-[90dvh]">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-brand-navy to-slate-900 p-4 sm:p-6 text-white flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Photo / Avatar */}
              <div className="relative flex-shrink-0"> 
                {currentVisitor.photo ? (
                  <img
                    src={getStorageUrl(currentVisitor.photo)}
                    alt={currentVisitor.name}
                    className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-md bg-slate-800"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-brand-cyan/20 border-2 border-brand-cyan/40 text-brand-cyan flex items-center justify-center font-black text-xl sm:text-2xl shadow-md ${
                    currentVisitor.photo ? 'hidden' : 'flex'
                  }`}
                >
                  {currentVisitor.name?.charAt(0)?.toUpperCase() || <User className="w-7 h-7 sm:w-8 sm:h-8" />}
                </div>

                {/* Biometric Status Pin */}
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-md border-2 border-slate-900 ${
                    hasFaceEmbedding ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-slate-200'
                  }`}
                  title={hasFaceEmbedding ? 'Biometrik Wajah Terdaftar' : 'Belum Ada Data Wajah'}
                >
                  {hasFaceEmbedding ? (
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  ) : (
                    <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  )}
                </div>
              </div>

              {/* Visitor Title & Category */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5 sm:mb-1">
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">
                    {currentVisitor.name || 'Detail Tamu'}
                  </h2>
                </div>
                
                <p className="text-xs sm:text-sm text-slate-300 font-medium truncate flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-brand-cyan flex-shrink-0" />
                  <span className="truncate">{currentVisitor.company || 'Pribadi / Tanpa Instansi'}</span>
                  {currentVisitor.position && (
                    <>
                      <span className="text-slate-500">•</span>
                      <span className="truncate">{currentVisitor.position}</span>
                    </>
                  )}
                </p>

                <div className="flex items-center gap-2 mt-1.5 sm:mt-2 flex-wrap">
                  {hasEvent ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      <CalendarRange className="w-3 h-3" />
                      Tamu Event
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-white border border-white/20">
                      <User className="w-3 h-3" />
                      Tamu Biasa
                    </span>
                  )}

                  {hasFaceEmbedding ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" />
                      Biometrik Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600/40">
                      Belum Wajah
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 mt-6 border-b border-white/10 pb-0 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-brand-cyan text-brand-cyan'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Profil Lengkap</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('visits')}
              className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'visits'
                  ? 'border-brand-cyan text-brand-cyan'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Riwayat Kunjungan ({visits.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {loading && !visitor && (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-3 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Memuat data lengkap tamu...</p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: PROFIL LENGKAP */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Contact & Company Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nomor Telepon / WhatsApp</span>
                  </div>
                  {currentVisitor.phone ? (
                    <a
                      href={`tel:${currentVisitor.phone}`}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                    >
                      {currentVisitor.phone}
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400 font-medium">—</span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Alamat Email</span>
                  </div>
                  {currentVisitor.email ? (
                    <a
                      href={`mailto:${currentVisitor.email}`}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 truncate max-w-full"
                    >
                      <span className="truncate">{currentVisitor.email}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400 font-medium">—</span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instansi / Perusahaan</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {currentVisitor.company || 'Pribadi / Tidak diisi'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                    <span>Jabatan / Divisi</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {currentVisitor.position || '—'}
                  </p>
                </div>
              </div>

              {/* Biometrics Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-navy" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Status Biometrik AI
                    </h4>
                  </div>
                  {hasFaceEmbedding ? (
                    <Badge variant="emerald" dot>Aktif</Badge>
                  ) : (
                    <Badge variant="neutral">Belum Ada</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {hasFaceEmbedding
                    ? 'Wajah tamu ini telah direkam dengan vektor biometrik 128-dimensi. Tamu dapat melakukan check-in cepat otomatis pada Kiosk Kamera.'
                    : 'Tamu ini belum memiliki rekaman wajah biometrik. Scan wajah dapat ditambahkan saat check-in atau melalui tombol Edit Profil.'}
                </p>
              </div>

              {/* Registration Meta */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                <span>ID Tamu: #{currentVisitor.id}</span>
                <span>
                  Terdaftar: {formatServerDate(currentVisitor.created_at, 'DD MMMM YYYY')}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT KUNJUNGAN */}
          {activeTab === 'visits' && (
            <div className="space-y-3">
              {visits.length === 0 ? (
                <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Belum Ada Riwayat Kunjungan</p>
                  <p className="text-xs text-slate-400 mt-0.5">Tamu ini belum pernah tercatat melakukan check-in.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {visits.map((v, i) => {
                    const isCheckedOut = v.status === 'OUT' || Boolean(v.check_out);
                    return (
                      <div key={v.id || i} className="p-4 hover:bg-slate-50/70 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                Bertemu: {v.meet_to || '—'}
                              </span>
                              {v.event ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                                  {v.event.name}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Keperluan: {v.purpose || 'Kunjungan'}
                            </p>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isCheckedOut
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                            }`}
                          >
                            {isCheckedOut ? 'Selesai' : 'Sedang Berkunjung'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            Masuk: {formatServerDate(v.check_in, 'DD/MM/YYYY HH:mm')}
                          </span>
                          {isCheckedOut && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-rose-500" />
                              Keluar: {formatServerDate(v.check_out, 'HH:mm')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 flex-shrink-0">
          <Button variant="outline" size="md" onClick={onClose}>
            Tutup
          </Button>

          {onEdit && (
            <Button
              variant="primary"
              size="md"
              icon={Edit2}
              onClick={() => onEdit(currentVisitor)}
            >
              Edit Profil Tamu
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};

export default VisitorDetailModal;

