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
import 'dayjs/locale/id';
import StatCard from '../components/StatCard';
import dashboardService from '../services/dashboardService';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import useAuthStore from '../store/authStore';

dayjs.locale('id');

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topVisitors, setTopVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

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
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 animate-fadeIn">
      {/* Purple Gradient Header dengan Ilustrasi */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white shadow-xl overflow-hidden min-h-[200px]">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-900/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-32 w-3 h-3 bg-yellow-300/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-32 left-40 w-2 h-2 bg-purple-300/30 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        </div>
        
        <div className="relative">
          <div className="z-10">
            <p className="text-sm text-purple-200 mb-2">{dayjs().format('dddd, DD MMMM YYYY')}</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Selamat datang, <span className="text-yellow-300">{user?.name || 'User'}</span>
            </h1>
            <p className="text-purple-100 text-sm max-w-md">
              Sistem buku tamu digital dengan face recognition PT GLOSINDO.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Menu Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/check-in">
          <Card hover className="p-6 text-center bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="w-14 h-14 mx-auto mb-3 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Camera className="w-7 h-7 text-blue-600" />
            </div>
            <p className="text-sm font-bold text-slate-900">Check-In</p>
          </Card>
        </Link>

        <Link to="/visit-history">
          <Card hover className="p-6 text-center bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="w-14 h-14 mx-auto mb-3 bg-amber-100 rounded-2xl flex items-center justify-center">
              <History className="w-7 h-7 text-amber-600" />
            </div>
            <p className="text-sm font-bold text-slate-900">History</p>
          </Card>
        </Link>

        <Link to="/active-visitors">
          <Card hover className="p-6 text-center bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="w-14 h-14 mx-auto mb-3 bg-green-100 rounded-2xl flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-sm font-bold text-slate-900">Active</p>
          </Card>
        </Link>

        <Link to="/visitors">
          <Card hover className="p-6 text-center bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="w-14 h-14 mx-auto mb-3 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <p className="text-sm font-bold text-slate-900">Directory</p>
          </Card>
        </Link>
      </div>

      {/* Info Section Horizontal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CalendarCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Tamu hari ini</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats?.visitor_today || 0}</span>
                <span className="text-xs text-slate-500">pengunjung</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Status tamu</p>
              <p className="text-sm font-bold text-slate-900">{stats?.active_visitor || 0} sedang di dalam</p>
              <Link to="/active-visitors" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                Lihat daftar tamu aktif
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Cards Bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-none rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <CalendarCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{stats?.visitor_today || 0}</p>
              <p className="text-xs text-blue-700 font-medium">Visitor hari ini</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-none rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <History className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">{stats?.total_visit_this_month || 0}</p>
              <p className="text-xs text-amber-700 font-medium">Visit bulan ini</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-none rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{stats?.total_visitor || 0}</p>
              <p className="text-xs text-green-700 font-medium">Total visitor</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
