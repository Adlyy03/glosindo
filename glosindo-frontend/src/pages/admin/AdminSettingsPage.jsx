import React, { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';

const AdminSettingsPage = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await dashboardService.getVisitTrends();
        setTrends(response.data || []);
      } catch (err) {
        setError('Gagal memuat tren kunjungan.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Konfigurasi Sistem</h1>
        <p className="mt-2 text-sm text-slate-300">Data tren kunjungan diambil langsung dari API backend.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">Memuat tren kunjungan...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 p-5 text-red-600 shadow-sm">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Tren 7 Hari Terakhir</h2>
          <div className="mt-4 space-y-2">
            {trends.map((item) => (
              <div key={item.date} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <span className="text-sm text-gray-700">{item.date}</span>
                <span className="text-sm font-semibold text-gray-900">{item.count} kunjungan</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
