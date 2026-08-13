import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarCheck,
  TrendingUp,
  Camera,
  ArrowRight,
  UserPlus,
  Clock,
  Award,
  Zap,
  History
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import StatCard from '../components/StatCard';
import dashboardService from '../services/dashboardService';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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
      subtitle: 'Master database visitor',
      icon: Users,
    },
    {
      title: 'Kunjungan Hari Ini',
      value: stats?.visitor_today,
      color: 'green',
      subtitle: dayjs().format('DD MMMM YYYY'),
      icon: CalendarCheck,
    },
    {
      title: 'Tamu Aktif (Status IN)',
      value: stats?.active_visitor,
      color: 'amber',
      subtitle: 'Sedang di dalam gedung',
      icon: UserCheck,
    },
    {
      title: 'Kunjungan Bulan Ini',
      value: stats?.total_visit_this_month,
      color: 'purple',
      subtitle: dayjs().format('MMMM YYYY'),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Corporate Kiosk Banner */}
      <div className="bg-gradient-to-r from-brand-navy via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-cyan-200 border border-white/20 mb-3">
            <Zap className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Biometric Guestbook Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Monitoring & Kiosk Operations
          </h1>
          <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
            {dayjs().format('dddd, DD MMMM YYYY')} — Monitoring aktivitas tamu dan akses pengenalan wajah biometrik realtime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          <Link to="/check-in">
            <Button variant="secondary" size="lg" icon={Camera}>
              Check-In Kiosk
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Analytics & Top Visitors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Trend Chart Card */}
        <Card className="lg:col-span-8 p-6">
          <CardHeader className="flex items-center justify-between pb-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Grafik Tren Kunjungan (7 Hari Terakhir)
              </h2>
              <p className="text-xs text-slate-500 font-medium">Frekuensi total kedatangan per hari</p>
            </div>
            <Badge variant="navy">Grafik Mingguan</Badge>
          </CardHeader>

          {trends.length === 0 && !loading ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs font-medium">
              Belum ada data riwayat kunjungan minggu ini.
            </div>
          ) : (
            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="count" fill="#1e3a8a" radius={[8, 8, 0, 0]} name="Jumlah Tamu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Top Visitors */}
        <Card className="lg:col-span-4 p-6 flex flex-col justify-between">
          <div>
            <CardHeader className="flex items-center justify-between pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">Tamu Paling Sering</h2>
              </div>
              <Badge variant="cyan">Top 5</Badge>
            </CardHeader>

            <div className="space-y-3">
              {topVisitors.length === 0 && !loading ? (
                <p className="text-xs text-slate-400 text-center py-6">Belum ada riwayat kunjungan.</p>
              ) : (
                topVisitors.map((v, i) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-cyan-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-brand-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        #{i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{v.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{v.company || 'Pribadi'}</p>
                      </div>
                    </div>
                    <Badge variant="cyan" className="flex-shrink-0">
                      {v.visits_count}x
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/visitors"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-cyan transition-colors"
          >
            <span>Lihat Semua Direktori Tamu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>

      {/* Quick Kiosk Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/active-visitors">
          <Card hover padding="p-5" className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-none shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-emerald-200 uppercase tracking-widest font-extrabold">Tamu Aktif</p>
                <h4 className="text-base font-bold mt-1 text-white">Kelola Tamu Status IN →</h4>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-white">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/visit-history">
          <Card hover padding="p-5" className="bg-gradient-to-r from-brand-navy to-slate-900 text-white border-none shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-cyan-200 uppercase tracking-widest font-extrabold">Riwayat Kunjungan</p>
                <h4 className="text-base font-bold mt-1 text-white">Log History Complete →</h4>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-white">
                <History className="w-6 h-6 text-brand-cyan" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/visitors">
          <Card hover padding="p-5" className="bg-gradient-to-r from-slate-800 to-slate-950 text-white border-none shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-300 uppercase tracking-widest font-extrabold">Master Data</p>
                <h4 className="text-base font-bold mt-1 text-white">Direktori Tamu →</h4>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-white">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
