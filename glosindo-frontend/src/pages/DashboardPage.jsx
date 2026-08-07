import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import StatCard from '../components/StatCard';
import dashboardService from '../services/dashboardService';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topVisitors, setTopVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, trendsRes, topRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getVisitTrends(),
          dashboardService.getTopVisitors(5),
        ]);
        setStats(statsRes.data);
        setTrends(
          (trendsRes.data || []).map((d) => ({
            ...d,
            label: dayjs(d.date).format('DD/MM'),
          }))
        );
        setTopVisitors(topRes.data || []);
      } catch (err) {
        console.error('Failed loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      title: 'Total Tamu Terdaftar',
      value: stats?.total_visitor,
      color: 'blue',
      subtitle: 'Direktori master tamu',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'Tamu Hari Ini',
      value: stats?.visitor_today,
      color: 'green',
      subtitle: dayjs().format('DD MMMM YYYY'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Tamu Aktif (Masuk)',
      value: stats?.active_visitor,
      color: 'yellow',
      subtitle: 'Sedang berada di lokasi',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07" />
        </svg>
      ),
    },
    {
      title: 'Total Kunjungan Bulan Ini',
      value: stats?.total_visit_this_month,
      color: 'purple',
      subtitle: dayjs().format('MMMM YYYY'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold backdrop-blur-xs">
            GLOSINDO Biometric Check-In System
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mt-2">Selamat Datang di Portal Guestbook</h1>
          <p className="text-blue-100 text-sm mt-1">
            {dayjs().format('dddd, DD MMMM YYYY')} — Monitoring lalu lintas pengunjung dan pengenalan wajah biometrik.
          </p>
        </div>

        <Link
          to="/check-in"
          className="bg-white text-blue-800 hover:bg-blue-50 font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Proses Check-In Tamu
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Analytics & Top Visitors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Trend Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Tren Kunjungan — 7 Hari Terakhir
              </h2>
              <p className="text-xs text-gray-400">Frekuensi jumlah pengunjung per hari.</p>
            </div>
          </div>

          {trends.length === 0 && !loading ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
              Belum ada data grafik kunjungan minggu ini.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} name="Jumlah Kunjungan" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Visitors */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Tamu Paling Sering Berkunjung</h2>
            <p className="text-xs text-gray-400 mb-4">Rangking 5 pengunjung dengan total visit terbanyak.</p>

            <div className="space-y-3">
              {topVisitors.length === 0 && !loading ? (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada riwayat kunjungan.</p>
              ) : (
                topVisitors.map((v, i) => (
                  <div key={v.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 hover:bg-blue-50/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{v.name}</p>
                        <p className="text-[11px] text-gray-400">{v.company || 'Pribadi'}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                      {v.visits_count}x visit
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/visitors"
            className="mt-4 text-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Lihat Semua Tamu →
          </Link>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/active-visitors"
          className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md hover:scale-[1.01] transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">Tamu Aktif</p>
            <p className="text-lg mt-0.5">Daftar Status IN →</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
            ⚡
          </div>
        </Link>

        <Link
          to="/visit-history"
          className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-md hover:scale-[1.01] transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-indigo-100 uppercase tracking-wider font-semibold">Log History</p>
            <p className="text-lg mt-0.5">Riwayat Kunjungan →</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
            📋
          </div>
        </Link>

        <Link
          to="/visitors"
          className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-md hover:scale-[1.01] transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-amber-100 uppercase tracking-wider font-semibold">Direktori Master</p>
            <p className="text-lg mt-0.5">Kelola Data Tamu →</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
            👤
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
