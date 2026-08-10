import React, { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';

const AdminUsersPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await dashboardService.getStats();
        setStats(response.data);
      } catch (err) {
        setError('Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-3xl p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Kelola Petugas</h1>
        <p className="mt-2 text-sm text-purple-100">Pantau akun admin dan receptionist berdasarkan data aktivitas sistem.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">Memuat data...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 p-5 text-red-600 shadow-sm">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Tamu Terdaftar</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.total_visitor ?? 0}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <p className="text-sm text-gray-500">Tamu Hari Ini</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.visitor_today ?? 0}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <p className="text-sm text-gray-500">Tamu Aktif</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.active_visitor ?? 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Data Sistem</h2>
              <p className="text-sm text-gray-500">Informasi ini berasal dari endpoint dashboard backend.</p>
            </div>
            <div className="p-5 text-sm text-gray-700">
              <p>Total kunjungan bulan ini: <span className="font-semibold">{stats?.total_visit_this_month ?? 0}</span></p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsersPage;
