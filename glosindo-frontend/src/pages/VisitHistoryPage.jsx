import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { History, Search, Calendar, RefreshCw, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import visitService from '../services/visitService';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const VisitHistoryPage = () => {
  const [visits, setVisits] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await visitService.getHistory({
        search,
        start_date: startDate,
        end_date: endDate,
        page,
      });
      setVisits(res.data?.data || []);
      setMeta(res.data);
    } catch (err) {
      toast.error('Gagal memuat riwayat kunjungan');
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate, page]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleResetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setPage(1);
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
            Laporan lengkap riwayat log masuk (check-in) dan log keluar (check-out) seluruh tamu.
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
      <Card padding="p-5 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Cari Nama / Pihak Ditemui
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Ketik nama tamu atau tujuan..."
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
                    <th className="px-6 py-4">Bertemu With</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Maksud Keperluan</th>
                    <th className="px-6 py-4">Check-In</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Check-Out</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{visit.visitor?.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{visit.visitor?.company || 'Pribadi'}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{visit.meet_to}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {visits.map((visit) => (
                <div key={visit.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{visit.visitor?.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{visit.visitor?.company || 'Pribadi'}</p>
                    </div>
                    {visit.status === 'IN' ? (
                      <Badge variant="emerald" dot>IN</Badge>
                    ) : (
                      <Badge variant="neutral">OUT</Badge>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bertemu:</span>
                      <span className="font-bold text-slate-900">{visit.meet_to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Keperluan:</span>
                      <span className="text-slate-700 truncate max-w-[60%]">{visit.purpose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Check-In:</span>
                      <span className="font-bold text-brand-navy">{dayjs(visit.check_in).format('DD/MM/YY HH:mm')}</span>
                    </div>
                    {visit.check_out && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Check-Out:</span>
                        <span className="font-bold text-slate-700">{dayjs(visit.check_out).format('DD/MM/YY HH:mm')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {meta && meta.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-500">
                  Menampilkan {meta.from}–{meta.to} dari {meta.total} data kunjungan
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
    </div>
  );
};

export default VisitHistoryPage;
