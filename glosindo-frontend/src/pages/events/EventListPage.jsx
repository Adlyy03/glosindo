import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  CalendarRange, Plus, Search, RefreshCw, Trash2, Eye, Pencil,
  MapPin, Clock, Users, AlertTriangle, ChevronLeft, ChevronRight, FileSpreadsheet, FileText,
  Copy, Check, ExternalLink, Calendar, Sparkles
} from 'lucide-react';
import eventService from '../../services/eventService';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',       variant: 'neutral' },
  scheduled: { label: 'Terjadwal',   variant: 'navy' },
  ongoing:   { label: 'Berlangsung', variant: 'emerald', dot: true },
  active:    { label: 'Aktif',       variant: 'emerald', dot: true },
  finished:  { label: 'Selesai',     variant: 'neutral' },
  cancelled: { label: 'Dibatalkan',  variant: 'danger' },
};

const EventListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisor = user?.role === 'supervisor';

  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Link copy animation
  const [copiedId, setCopiedId] = useState(null);

  // Report exports
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [reportStartDate, setReportStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [reportEndDate, setReportEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (startDateFilter) params.start_date = startDateFilter;
      if (endDateFilter) params.end_date = endDateFilter;
      const res = await eventService.getAll(params);
      const pagination = res.data?.data;
      setEvents(Array.isArray(pagination?.data) ? pagination.data : []);
      setMeta(pagination ?? null);
    } catch {
      toast.error('Gagal memuat daftar event');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, startDateFilter, endDateFilter, page]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const copyRegistrationLink = (event, e) => {
    e.stopPropagation();
    const code = event.code || event.id;
    const url = `${window.location.origin}/event/${code}/register`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(event.id);
      toast.success('Link registrasi publik disalin ke clipboard!', { icon: '🔗' });
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(() => {
      toast.error('Gagal menyalin link');
    });
  };

  const openDeleteModal = (event) => {
    setEventToDelete(event);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    try {
      await eventService.delete(eventToDelete.id);
      toast.success('Event berhasil dihapus');
      setDeleteModal(false);
      setEventToDelete(null);
      loadEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus event');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const res = await eventService.exportExcel({ start_date: reportStartDate, end_date: reportEndDate });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Event_${reportStartDate}_${reportEndDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export Excel berhasil');
    } catch {
      toast.error('Gagal export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const res = await eventService.exportPdf({ start_date: reportStartDate, end_date: reportEndDate });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Event_${reportStartDate}_${reportEndDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export PDF berhasil');
    } catch {
      toast.error('Gagal export PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Event</h1>
            <Badge variant="navy">Entity Khusus</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola event perusahaan, link registrasi publik, dan data seluruh tamu/peserta event.
          </p>
        </div>
        {!isSupervisor && (
          <Button variant="primary" icon={Plus} onClick={() => navigate('/events/new')}>
            Buat Event Baru
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card padding="p-5 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Cari Event / Kode</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Nama event, kode, atau lokasi..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Terjadwal</option>
              <option value="ongoing">Berlangsung</option>
              <option value="active">Aktif</option>
              <option value="finished">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Dari Tanggal</label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => { setStartDateFilter(e.target.value); setPage(1); }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Sampai Tanggal</label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => { setEndDateFilter(e.target.value); setPage(1); }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
            />
          </div>
          <div className="lg:col-span-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setStartDateFilter('');
                setEndDateFilter('');
                setPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Export Laporan Event */}
      <Card padding="p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Laporan Rekapitulasi Event</h3>
          <Badge variant="cyan">Export Data</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Periode Mulai</label>
            <input
              type="date"
              value={reportStartDate}
              onChange={(e) => setReportStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
            />
          </div>
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Periode Akhir</label>
            <input
              type="date"
              value={reportEndDate}
              onChange={(e) => setReportEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
            />
          </div>
          <div className="lg:col-span-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              icon={FileSpreadsheet}
              loading={exportingExcel}
              onClick={handleExportExcel}
              className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            >
              Excel
            </Button>
          </div>
          <div className="lg:col-span-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              icon={FileText}
              loading={exportingPdf}
              onClick={handleExportPdf}
              className="text-rose-700 border-rose-200 hover:bg-rose-50"
            >
              PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card padding="p-0" className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-xs font-semibold">Memuat daftar event...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200">
              <CalendarRange className="w-6 h-6" />
            </div>
            <p className="text-slate-700 font-bold text-sm">Belum Ada Event</p>
            <p className="text-slate-400 text-xs mt-1">Buat event baru untuk mulai membuka pendaftaran dan mengelola tamu event.</p>
            {!isSupervisor && (
              <Button variant="primary" size="sm" icon={Plus} className="mt-4" onClick={() => navigate('/events/new')}>
                Buat Event Pertama
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                    <th className="px-6 py-4">Event & Kode</th>
                    <th className="px-6 py-4">Lokasi</th>
                    <th className="px-6 py-4">Tanggal Event</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Periode Registrasi</th>
                    <th className="px-6 py-4 text-center">Peserta</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((event) => {
                    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;
                    const startDate = event.start_date || event.event_date;
                    const endDate = event.end_date || startDate;
                    const totalParticipants = Math.max(event.participants_count || 0, event.visits_count || 0);

                    return (
                      <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{event.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {event.code || `ID: ${event.id}`}
                            </span>
                            {event.description && (
                              <p className="text-xs text-slate-400 font-medium truncate max-w-xs">{event.description}</p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {event.location ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate max-w-[130px]">{event.location}</span>
                            </div>
                          ) : <span className="text-slate-300">-</span>}
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <CalendarRange className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {dayjs(startDate).format('DD/MM/YY')}
                              {endDate && endDate !== startDate && ` - ${dayjs(endDate).format('DD/MM/YY')}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {event.start_time?.slice(0,5)} - {event.end_time?.slice(0,5)} WIB
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 font-medium hidden lg:table-cell whitespace-nowrap">
                          {event.registration_start_at || event.registration_end_at ? (
                            <div className="space-y-0.5">
                              {event.registration_start_at && (
                                <p className="text-[11px] text-slate-500">
                                  Buka: {dayjs(event.registration_start_at).format('DD/MM/YY HH:mm')}
                                </p>
                              )}
                              {event.registration_end_at && (
                                <p className="text-[11px] text-rose-600 font-semibold">
                                  Tutup: {dayjs(event.registration_end_at).format('DD/MM/YY HH:mm')}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Selama Event</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs">
                            <Users className="w-3.5 h-3.5 text-brand-navy" />
                            <span>{totalParticipants}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <Badge variant={statusCfg.variant} dot={statusCfg.dot}>{statusCfg.label}</Badge>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Copy Public Link Button */}
                            <button
                              onClick={(e) => copyRegistrationLink(event, e)}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                                copiedId === event.id
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'text-brand-cyan hover:bg-cyan-50'
                              }`}
                              title="Salin Link Registrasi Publik"
                            >
                              {copiedId === event.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>

                            {/* View Detail */}
                            <button
                              onClick={() => navigate(`/events/${event.id}`)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-brand-navy hover:bg-blue-50 transition-colors"
                              title="Lihat Detail & Peserta"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {!isSupervisor && (
                              <>
                                <button
                                  onClick={() => navigate(`/events/${event.id}/edit`)}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                                  title="Edit Event"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(event)}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                  title="Hapus Event"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {events.map((event) => {
                const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;
                const startDate = event.start_date || event.event_date;
                const totalParticipants = Math.max(event.participants_count || 0, event.visits_count || 0);

                return (
                  <div key={event.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{event.name}</p>
                        <p className="text-xs text-slate-400">{dayjs(startDate).format('DD MMM YYYY')}</p>
                      </div>
                      <Badge variant={statusCfg.variant} dot={statusCfg.dot}>{statusCfg.label}</Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" />{event.start_time?.slice(0,5)} - {event.end_time?.slice(0,5)}</span>
                      {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{event.location}</span>}
                      <span className="flex items-center gap-1 font-bold text-brand-navy"><Users className="w-3 h-3" />{totalParticipants} peserta</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={copiedId === event.id ? Check : Copy}
                        onClick={(e) => copyRegistrationLink(event, e)}
                        className="text-xs"
                      >
                        {copiedId === event.id ? 'Tersalin' : 'Copy Link'}
                      </Button>
                      <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/events/${event.id}`)}>
                        Detail
                      </Button>
                      {!isSupervisor && (
                        <>
                          <Button variant="outline" size="sm" icon={Pencil} onClick={() => navigate(`/events/${event.id}/edit`)}>
                            Edit
                          </Button>
                          <button
                            onClick={() => openDeleteModal(event)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-500">Menampilkan {meta.from}–{meta.to} dari {meta.total} event</p>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  <Button variant="outline" size="sm" disabled={meta.current_page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} icon={ChevronLeft} />
                  {Array.from({ length: Math.min(meta.last_page, 7) }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${p === meta.current_page ? 'bg-brand-navy text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}>{p}</button>
                  ))}
                  <Button variant="outline" size="sm" disabled={meta.current_page === meta.last_page} onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} icon={ChevronRight} />
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => !deleting && setDeleteModal(false)} title="Hapus Event">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm mb-1">Konfirmasi Penghapusan Event</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda yakin ingin menghapus event <span className="font-bold text-slate-900">{eventToDelete?.name}</span>?
                Seluruh data pendaftaran dan riwayat log kunjungan akan tetap tersimpan aman di database.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setDeleteModal(false)} disabled={deleting}>Batal</Button>
            <Button variant="danger" fullWidth onClick={handleDelete} loading={deleting}>Hapus Event</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventListPage;