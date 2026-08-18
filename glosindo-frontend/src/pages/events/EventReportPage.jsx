import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  BarChart3, CalendarRange, Filter, FileSpreadsheet,
  FileText, Users, Building2, Clock, RefreshCw, CheckCircle2
} from 'lucide-react';
import eventService from '../../services/eventService';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const EventReportPage = () => {
  const [reportData, setReportData] = useState({ summary: {}, events: [] });
  const [loading, setLoading] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [status, setStatus] = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventService.getReport({
        start_date: startDate,
        end_date: endDate,
        status: status || undefined,
      });
      setReportData(res.data?.data || { summary: {}, events: [] });
    } catch {
      toast.error('Gagal memuat laporan event');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, status]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const res = await eventService.exportExcel({ start_date: startDate, end_date: endDate });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Event_${startDate}_${endDate}.xlsx`);
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
      const res = await eventService.exportPdf({ start_date: startDate, end_date: endDate });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Event_${startDate}_${endDate}.pdf`);
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

  const { summary = {}, events = [] } = reportData;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Laporan Event</h1>
            <Badge variant="cyan">Analytics</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Statistik dan evaluasi partisipasi tamu pada seluruh event perusahaan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={FileSpreadsheet}
            loading={exportingExcel}
            onClick={handleExportExcel}
            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          >
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={FileText}
            loading={exportingPdf}
            onClick={handleExportPdf}
            className="text-rose-700 border-rose-200 hover:bg-rose-50"
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card padding="p-5 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
            />
          </div>

          <div className="lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Status Event
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Terjadwal</option>
              <option value="ongoing">Berlangsung</option>
              <option value="finished">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div className="lg:col-span-1">
            <Button variant="outline" size="md" fullWidth icon={RefreshCw} onClick={loadReport} />
          </div>
        </div>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="p-5" className="border-l-4 border-l-brand-navy">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Event</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{summary.total_events || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Dalam periode terpilih</p>
        </Card>

        <Card padding="p-5" className="border-l-4 border-l-brand-cyan">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Partisipan</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{summary.total_visitors || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Tamu menghadiri event</p>
        </Card>

        <Card padding="p-5" className="border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Selesai Check-Out</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">{summary.total_checked_out || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Kunjungan tuntas</p>
        </Card>

        <Card padding="p-5" className="border-l-4 border-l-amber-500">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Sedang Di Lokasi</p>
          <p className="text-3xl font-extrabold text-amber-700 mt-1">{summary.still_inside || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Status aktif saat ini</p>
        </Card>
      </div>

      {/* Events Breakdown Table */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-navy" />
            <h2 className="text-base font-bold text-slate-900">Performa Event</h2>
          </div>
          <Badge variant="neutral">{events.length} Event Ditemukan</Badge>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-xs font-semibold">Memuat rekapitulasi data event...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-600">Tidak ada data event pada filter ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Nama Event</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Peserta</th>
                  <th className="px-6 py-4 text-center">Perusahaan</th>
                  <th className="px-6 py-4 text-center">Rata-rata Durasi</th>
                  <th className="px-6 py-4">Pembuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev, index) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-400 font-bold">{index + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{ev.name}</p>
                      <p className="text-xs text-slate-400">{ev.location || 'Lokasi tidak ditentukan'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {dayjs(ev.event_date).format('DD/MM/YYYY')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="navy">{ev.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      {ev.total_visitors}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700">
                      {ev.companies_count}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700">
                      {ev.avg_duration ? `${ev.avg_duration} mnt` : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {ev.creator?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EventReportPage;