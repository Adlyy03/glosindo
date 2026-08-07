import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import visitService from '../services/visitService';

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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Riwayat Kunjungan</h1>
        <p className="text-sm text-gray-500 mt-1">Laporan histori log check-in dan check-out tamu.</p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Cari Nama / Bertemu</label>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Ketik kata kunci..."
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Dari Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <button
            onClick={handleResetFilters}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Memuat riwayat...</p>
          </div>
        ) : visits.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium text-sm">Tidak ada catatan riwayat kunjungan</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-5 py-3.5">Tamu</th>
                    <th className="px-5 py-3.5">Bertemu</th>
                    <th className="px-5 py-3.5">Keperluan</th>
                    <th className="px-5 py-3.5">Waktu Check-In</th>
                    <th className="px-5 py-3.5">Waktu Check-Out</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900">{visit.visitor?.name}</p>
                        <p className="text-xs text-gray-400">{visit.visitor?.company || 'Pribadi'}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">{visit.meet_to}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 max-w-xs truncate">{visit.purpose}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-700">
                        {dayjs(visit.check_in).format('DD/MM/YYYY HH:mm')}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-700">
                        {visit.check_out ? dayjs(visit.check_out).format('DD/MM/YYYY HH:mm') : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          visit.status === 'IN'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {visit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/40">
                <p className="text-xs text-gray-500">
                  Menampilkan {meta.from}–{meta.to} dari total {meta.total} data
                </p>
                <div className="flex gap-1">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        p === meta.current_page
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VisitHistoryPage;
