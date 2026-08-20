import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  History, Search, Calendar, RefreshCw, FileText,
  ChevronLeft, ChevronRight, Trash2, AlertTriangle, CalendarRange, Users, UserCheck
} from 'lucide-react';
import visitService from '../services/visitService';
import useAuthStore from '../store/authStore';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Jakarta');

const VisitHistoryPage = () => {
  const { user } = useAuthStore();
  const isSupervisor = user?.role === 'supervisor';

  const [visits, setVisits] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '' | 'regular' | 'event'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search,
        start_date: startDate,
        end_date: endDate,
        page,
      };
      if (typeFilter) params.type = typeFilter;

      const res = await visitService.getHistory(params);
      setVisits(res.data?.data || []);
      setMeta(res.data);
    } catch {
      toast.error('Gagal memuat riwayat kunjungan');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, startDate, endDate, page]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const openDeleteModal = (visit) => {
    setVisitToDelete(visit);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!visitToDelete) return;

    setDeleting(true);
    try {
      await visitService.delete(visitToDelete.id);
      toast.success('Riwayat kunjungan berhasil dihapus');
      setDeleteModal(false);
      setVisitToDelete(null);
      loadHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus riwayat');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Riwayat Log Kunjungan
            </h1>
            <Badge variant="navy">Audit History</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Laporan lengkap riwayat log masuk (check-in) dan log keluar (check-out) seluruh tamu biasa maupun peserta event.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          loading={loading}
          onClick={() => loadHistory()}
          icon={RefreshCw}
        >
          Refresh Log
        </Button>
      </div>

      {/* Filter Card */}
      <Card padding="p-5 md:p-6" className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 flex-wrap">
          <button
            onClick={() => { setTypeFilter(''); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              typeFilter === ''
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Semua Riwayat
          </button>

          <button
            onClick={() => { setTypeFilter('regular'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              typeFilter === 'regular'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Tamu Biasa
          </button>

          <button
            onClick={() => { setTypeFilter('event'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              typeFilter === 'event'
                ? 'bg-brand-cyan text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            Tamu / Peserta Event
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Cari Nama / Pihak Ditemui / Event
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Ketik nama tamu, instansi, atau event..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
            />
          </div>

          <div className="lg:col-span-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={handleResetFilters}
            >
              Reset Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Main History Table Card */}
      <Card padding="p-0" className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-xs font-semibold">Memuat riwayat kunjungan...</p>
          </div>
        ) : visits.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200">
              <History className="w-6 h-6" />
            </div>
            <p className="text-slate-700 font-bold text-sm">Tidak Ada Catatan Riwayat</p>
            <p className="text-slate-400 text-xs mt-1">Gunakan kata kunci atau tanggal lain pada filter pencarian.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                    <th className="px-6 py-4">Nama Tamu</th>
                    <th className="px-6 py-4">Bertemu Dengan</th>
                    <th className="px-6 py-4">Event Terkait</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Maksud Keperluan</th>
                    <th className="px-6 py-4">Check-In</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Check-Out</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map((visit) => {
                    const isEventVisit = Boolean(visit.event_id || visit.event?.name);
                    const meetToDisplay = isEventVisit
                      ? (visit.meet_to?.startsWith('Event:') ? visit.meet_to : `Event: ${visit.event?.name || visit.meet_to}`)
                      : (visit.meet_to || '-');

                    return (
                      <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{visit.visitor?.name}</p>
                          <p className="text-xs text-slate-400 font-medium">
                            {visit.visitor?.company || 'Pribadi'}
                            {visit.visitor?.deleted && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                                DELETED
                              </span>
                            )}
                          </p>
                        </td>

                        {/* Bertemu Dengan Field */}
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {isEventVisit ? (
                            <span className="text-brand-navy font-extrabold">{meetToDisplay}</span>
                          ) : (
                            <span>{meetToDisplay}</span>
                          )}
                        </td>

                        {/* Event Column */}
                        <td className="px-6 py-4">
                          {visit.event?.name ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                              <CalendarRange className="w-3.5 h-3.5 text-cyan-600" />
                              {visit.event.name}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-semibold text-xs">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate hidden lg:table-cell font-medium">
                          {visit.purpose}
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                          {dayjs(visit.check_in).format('DD/MM/YY HH:mm')}
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-700 whitespace-nowrap hidden lg:table-cell">
                          {visit.check_out ? dayjs(visit.check_out).format('DD/MM/YY HH:mm') : '—'}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {visit.status === 'IN' ? (
                            <Badge variant="emerald" dot>IN</Badge>
                          ) : (
                            <Badge variant="neutral">OUT</Badge>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {!isSupervisor && (
                            <button
                              onClick={() => openDeleteModal(visit)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus riwayat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {visits.map((visit) => {
                const isEventVisit = Boolean(visit.event_id || visit.event?.name);
                const meetToDisplay = isEventVisit
                  ? (visit.meet_to?.startsWith('Event:') ? visit.meet_to : `Event: ${visit.event?.name || visit.meet_to}`)
                  : (visit.meet_to || '-');

                return (
                  <div key={visit.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{visit.visitor?.name}</p>
                        <p className="text-xs text-slate-400 font-medium">
                          {visit.visitor?.company || 'Pribadi'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {visit.status === 'IN' ? (
                          <Badge variant="emerald" dot>IN</Badge>
                        ) : (
                          <Badge variant="neutral">OUT</Badge>
                        )}
                        {!isSupervisor && (
                          <button
                            onClick={() => openDeleteModal(visit)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bertemu:</span>
                        <span className="font-bold text-slate-800">{meetToDisplay}</span>
                      </div>
                      {visit.event?.name && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Event:</span>
                          <span className="font-bold text-brand-cyan">{visit.event.name}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Keperluan:</span>
                        <span className="truncate max-w-[180px]">{visit.purpose}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200/60">
                        <span>Check-In: {dayjs(visit.check_in).format('DD/MM HH:mm')}</span>
                        <span>Out: {visit.check_out ? dayjs(visit.check_out).format('DD/MM HH:mm') : '—'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {meta && meta.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-500">
                  Menampilkan {meta.from}–{meta.to} dari total {meta.total} riwayat log kunjungan
                </p>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.current_page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    icon={ChevronLeft}
                  />
                  {Array.from({ length: Math.min(meta.last_page, 7) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        p === meta.current_page
                          ? 'bg-brand-navy text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.current_page === meta.last_page}
                    onClick={() => setPage((prev) => Math.min(meta.last_page, prev + 1))}
                    icon={ChevronRight}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => !deleting && setDeleteModal(false)}
        title="Hapus Riwayat Kunjungan"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm mb-1">
                Konfirmasi Penghapusan Log
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda yakin ingin menghapus data log kunjungan tamu{' '}
                <span className="font-bold text-slate-900">{visitToDelete?.visitor?.name}</span>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setDeleteModal(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleDelete}
              loading={deleting}
            >
              Hapus Riwayat
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VisitHistoryPage;