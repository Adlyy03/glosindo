import React, { useEffect, useState } from 'react';
import visitService from '../../services/visitService';
import Badge from '../../components/ui/Badge';
import VisitDetailModal from '../../components/VisitDetailModal';
import { CalendarRange, Eye } from 'lucide-react';

const ReceptionistHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [visitToView, setVisitToView] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await visitService.getHistory({ page: 1 });
        setHistory(response.data?.data || []);
      } catch (err) {
        setError('Gagal memuat riwayat kunjungan.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const openDetail = (entry) => {
    setVisitToView(entry);
    setDetailOpen(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Kunjungan</h1>
        <p className="mt-2 text-sm text-gray-600">
          Pantau log kunjungan harian untuk kebutuhan operasional resepsionis.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Log Hari Ini</h2>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-gray-500">Memuat riwayat...</div>
        ) : error ? (
          <div className="p-5 text-sm text-red-600">{error}</div>
        ) : history.length === 0 ? (
          <div className="p-5 text-sm text-gray-500">Belum ada data riwayat.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((entry) => (
              <div key={entry.id} className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">
                      {entry.visitor?.name || 'Tamu'}
                    </p>
                    {entry.event ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-brand-cyan-dark border border-cyan-200">
                        <CalendarRange className="w-3 h-3" />
                        {entry.event.name}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium">-</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {entry.visitor?.company || '—'}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        entry.status === 'IN'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {entry.status}
                    </span>
                    <p className="mt-1.5 text-sm text-gray-500">
                      {entry.check_in
                        ? new Date(entry.check_in).toLocaleString('id-ID')
                        : '-'}
                    </p>
                  </div>
                  <button
                    onClick={() => openDetail(entry)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-brand-navy hover:text-white transition-colors cursor-pointer"
                    title="Lihat detail kunjungan"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visit Detail Modal */}
      <VisitDetailModal
        isOpen={detailOpen}
        visit={visitToView}
        onClose={() => {
          setDetailOpen(false);
          setVisitToView(null);
        }}
      />
    </div>
  );
};

export default ReceptionistHistoryPage;
