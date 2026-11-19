import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  Camera,
  Search,
  Calendar,
  RefreshCw,
  Eye,
  ExternalLink,
  User,
  Building,
  Clock,
  CheckCircle2,
  LogOut,
  CalendarDays,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  X
} from 'lucide-react';
import visitService from '../../services/visitService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { getStorageUrl } from '../../services/api';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Jakarta');

const SnapshotGalleryPage = () => {
  const [visits, setVisits] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'today' | '7days' | '30days' | 'all' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'IN' | 'OUT'
  const [onlyWithPhoto, setOnlyWithPhoto] = useState(true);
  const [page, setPage] = useState(1);

  // Modal Detail / Lightbox
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Calculate dates based on filter preset
  const handlePresetDate = (preset) => {
    setDateFilter(preset);
    setPage(1);
    const now = dayjs();
    if (preset === 'today') {
      const todayStr = now.format('YYYY-MM-DD');
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7days') {
      setStartDate(now.subtract(6, 'day').format('YYYY-MM-DD'));
      setEndDate(now.format('YYYY-MM-DD'));
    } else if (preset === '30days') {
      setStartDate(now.subtract(29, 'day').format('YYYY-MM-DD'));
      setEndDate(now.format('YYYY-MM-DD'));
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const loadSnapshots = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 18,
        search: search.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        status: statusFilter || undefined,
        has_photo: onlyWithPhoto ? 'true' : undefined,
      };

      const res = await visitService.getAll(params);
      const data = res?.data || res;
      setVisits(data?.data || []);
      setMeta(data);
    } catch (err) {
      console.error('Failed to load snapshots:', err);
      toast.error('Gagal memuat galeri snapshot wajah');
    } finally {
      setLoading(false);
    }
  }, [page, search, startDate, endDate, statusFilter, onlyWithPhoto]);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  const handleResetFilters = () => {
    setSearch('');
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setOnlyWithPhoto(true);
    setPage(1);
  };

  // Helper to resolve display photo
  const getVisitPhoto = (visit) => {
    const rawPhoto = visit?.photo || visit?.visitor?.photo;
    return rawPhoto ? getStorageUrl(rawPhoto) : null;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-xl border border-sky-200/60 shadow-xs">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Galeri Snapshot Wajah
                <span className="text-xs px-2 py-0.5 font-medium bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                  Live Audit
                </span>
              </h1>
              <p className="text-sm text-slate-500">
                Log tangkapan visual kamera otomatis saat scan biometric dan check-in tamu
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSnapshots}
            disabled={loading}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="p-4 sm:p-5 border-slate-200/80 shadow-xs bg-white">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama tamu, perusahaan, atau keperluan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-700"
              >
                <option value="">Semua Status Kunjungan</option>
                <option value="IN">Sedang Bertamu (IN)</option>
                <option value="OUT">Sudah Selesai (OUT)</option>
              </select>
            </div>

            {/* Only With Photo Toggle */}
            <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-2 bg-slate-50/80 p-1.5 px-3 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                Hanya yang ada foto
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={onlyWithPhoto}
                onClick={() => {
                  setOnlyWithPhoto(!onlyWithPhoto);
                  setPage(1);
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  onlyWithPhoto ? 'bg-sky-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    onlyWithPhoto ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Date Filter Quick Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
                Waktu:
              </span>
              {[
                { id: 'all', label: 'Semua Waktu' },
                { id: 'today', label: 'Hari Ini' },
                { id: '7days', label: '7 Hari Terakhir' },
                { id: '30days', label: '30 Hari Terakhir' },
                { id: 'custom', label: 'Kustom' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    if (pill.id === 'custom') {
                      setDateFilter('custom');
                    } else {
                      handlePresetDate(pill.id);
                    }
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    dateFilter === pill.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Custom Date Inputs (shown when dateFilter === 'custom') */}
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
                />
                <span className="text-xs text-slate-400">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
                />
              </div>
            )}

            {(search || statusFilter || !onlyWithPhoto || dateFilter !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline flex items-center gap-1 ml-auto"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Gallery Count Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Menampilkan <span className="font-semibold text-slate-800">{visits.length}</span> snapshot
          {meta?.total !== undefined && (
            <> dari total <span className="font-semibold text-slate-800">{meta.total}</span> data</>
          )}
        </div>
        {loading && (
          <div className="flex items-center gap-1.5 text-sky-600 font-medium">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Memperbarui...
          </div>
        )}
      </div>

      {/* Main Snapshots Grid */}
      {loading && visits.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs animate-pulse"
            >
              <div className="aspect-square bg-slate-200/80" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 bg-slate-200 rounded-sm w-3/4" />
                <div className="h-3 bg-slate-100 rounded-sm w-1/2" />
                <div className="h-2.5 bg-slate-100 rounded-sm w-2/3 pt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
            <Camera className="w-8 h-8 opacity-75" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Belum ada snapshot wajah
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
            Snapshot otomatis diambil saat tamu melakukan scan wajah atau check-in mandiri melalui kiosk/kamera.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Reset Semua Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {visits.map((visit) => {
            const photoUrl = getVisitPhoto(visit);
            const visitorName = visit.visitor?.name || visit.visitor_name || 'Tamu Tanpa Nama';
            const company = visit.visitor?.company || visit.visitor_company || 'Instansi Umum';
            const checkInFormatted = visit.check_in
              ? dayjs.tz(visit.check_in, 'Asia/Jakarta').format('DD MMM, HH:mm')
              : '-';
            const isInside = visit.status === 'IN';

            return (
              <div
                key={visit.id}
                onClick={() => setSelectedVisit(visit)}
                className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
              >
                {/* Photo Aspect Container */}
                <div className="relative aspect-square w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={visitorName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <User className="w-10 h-10 mb-1 opacity-50 text-slate-300" />
                      <span className="text-[10px] text-slate-400 font-medium">Foto Tidak Tersedia</span>
                    </div>
                  )}

                  {/* Gradient bottom shadow for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Status Overlay Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs ${
                        isInside
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-700/85 text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isInside ? 'bg-white animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      {isInside ? 'IN' : 'OUT'}
                    </span>
                  </div>

                  {/* Check-in Time Overlay */}
                  <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between text-white/90 text-[11px] font-medium drop-shadow-xs">
                    <span className="flex items-center gap-1 truncate">
                      <Clock className="w-3 h-3 text-sky-300 shrink-0" />
                      {checkInFormatted}
                    </span>
                  </div>

                  {/* Hover Eye Icon Overlay */}
                  <div className="absolute inset-0 bg-sky-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-medium text-xs backdrop-blur-[2px]">
                    <Eye className="w-4 h-4" />
                    <span>Lihat Detail</span>
                  </div>
                </div>

                {/* Metadata Card Footer */}
                <div className="p-3 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <h4
                      className="font-semibold text-xs text-slate-800 truncate group-hover:text-sky-600 transition-colors"
                      title={visitorName}
                    >
                      {visitorName}
                    </h4>
                    <p
                      className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5"
                      title={company}
                    >
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      {company}
                    </p>
                  </div>

                  {/* Meet To / Purpose */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                    <span
                      className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm truncate max-w-full font-medium"
                      title={`Tujuan: ${visit.meet_to || visit.purpose || '-'}`}
                    >
                      {visit.meet_to || visit.purpose || 'Kunjungan'}
                    </span>
                    {visit.event_id && (
                      <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1 py-0.5 rounded-sm uppercase tracking-wide shrink-0">
                        Event
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Halaman <span className="font-semibold text-slate-700">{meta.current_page}</span> dari{' '}
            <span className="font-semibold text-slate-700">{meta.last_page}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page >= meta.last_page || loading}
              onClick={() => setPage((prev) => prev + 1)}
              iconRight={<ChevronRight className="w-4 h-4" />}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {/* Modal Lightbox Snapshot Detail */}
      {selectedVisit && (
        <Modal
          isOpen={!!selectedVisit}
          onClose={() => setSelectedVisit(null)}
          title="Detail Snapshot Wajah Tamu"
          size="lg"
        >
          {(() => {
            const photoUrl = getVisitPhoto(selectedVisit);
            const visitorName = selectedVisit.visitor?.name || selectedVisit.visitor_name || 'Tamu Tanpa Nama';
            const company = selectedVisit.visitor?.company || selectedVisit.visitor_company || '-';
            const phone = selectedVisit.visitor?.phone || selectedVisit.visitor_phone || '-';
            const email = selectedVisit.visitor?.email || selectedVisit.visitor_email || '-';
            const checkInFormatted = selectedVisit.check_in
              ? dayjs.tz(selectedVisit.check_in, 'Asia/Jakarta').format('DD MMMM YYYY, HH:mm:ss')
              : '-';
            const checkOutFormatted = selectedVisit.check_out
              ? dayjs.tz(selectedVisit.check_out, 'Asia/Jakarta').format('DD MMMM YYYY, HH:mm:ss')
              : 'Masih di lokasi (Belum Checkout)';

            return (
              <div className="space-y-5">
                {/* Photo Display Card */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center max-h-[380px]">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={visitorName}
                      className="max-h-[380px] w-auto max-w-full object-contain"
                    />
                  ) : (
                    <div className="py-20 text-center text-slate-400">
                      <Camera className="w-16 h-16 mx-auto mb-2 opacity-40 text-slate-500" />
                      <p className="text-sm">Tidak ada snapshot foto untuk kunjungan ini.</p>
                    </div>
                  )}

                  {photoUrl && (
                    <a
                      href={photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Ukuran Asli</span>
                    </a>
                  )}

                  {/* Status pill in modal */}
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md ${
                        selectedVisit.status === 'IN'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800/90 text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedVisit.status === 'IN' ? 'bg-white animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      Status: {selectedVisit.status === 'IN' ? 'Sedang Bertamu (IN)' : 'Sudah Checkout (OUT)'}
                    </span>
                  </div>
                </div>

                {/* Visitor Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Nama Tamu
                    </label>
                    <p className="font-bold text-slate-800 text-base">{visitorName}</p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Instansi / Perusahaan
                    </label>
                    <p className="font-semibold text-slate-700">{company}</p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Nomor Telepon / WhatsApp
                    </label>
                    <p className="text-slate-700 font-mono text-xs">{phone}</p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Tujuan Bertemu (Host)
                    </label>
                    <p className="font-semibold text-slate-700">{selectedVisit.meet_to || '-'}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Keperluan Kunjungan
                    </label>
                    <p className="text-slate-700 font-medium">{selectedVisit.purpose || '-'}</p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Waktu Check-In
                    </label>
                    <p className="text-slate-700 font-mono text-xs">{checkInFormatted}</p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Waktu Check-Out
                    </label>
                    <p className="text-slate-700 font-mono text-xs">{checkOutFormatted}</p>
                  </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setSelectedVisit(null)}>
                    Tutup
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};

export default SnapshotGalleryPage;
