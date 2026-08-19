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
  History,
  FileSpreadsheet,
  FileText,
  FileDown,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { Line, Bar as BarChart2 } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import StatCard from '../components/StatCard';
import dashboardService from '../services/dashboardService';
import reportService from '../services/reportService';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

dayjs.locale('id');

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topVisitors, setTopVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  // Reports state
  const [period, setPeriod] = useState('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportStats, setReportStats] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloading, setDownloading] = useState({ excel: false, pdf: false });

  // Set default dates for weekly report
  useEffect(() => {
    const now = new Date();
    if (period === 'weekly') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      setStartDate(startOfWeek.toISOString().split('T')[0]);
      setEndDate(endOfWeek.toISOString().split('T')[0]);
    } else {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(startOfMonth.toISOString().split('T')[0]);
      setEndDate(endOfMonth.toISOString().split('T')[0]);
    }
  }, [period]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, trendsRes, topRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getVisitTrends(),
          dashboardService.getTopVisitors(5),
        ]);
        // dashboardService already returns response.data, so use directly
        const statsData = statsRes?.data ?? statsRes;
        const trendsData = trendsRes?.data ?? trendsRes;
        const topData = topRes?.data ?? topRes;
        setStats(statsData);
        setTrends(
          (Array.isArray(trendsData) ? trendsData : []).map((d) => ({
            ...d,
            label: dayjs(d.date).format('DD/MM'),
          }))
        );
        setTopVisitors(Array.isArray(topData) ? topData : []);
      } catch (err) {
        console.error('Failed loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Fetch weekly report statistics
  const fetchReportStatistics = async () => {
    if (!startDate || !endDate) return;

    setLoadingReport(true);
    try {
      const res = await reportService.getStatistics(period, startDate, endDate);
      setReportStats(res.data.data);
    } catch (err) {
      console.error('Fetch report statistics error:', err);
      toast.error(err.response?.data?.message || 'Gagal memuat statistik laporan');
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchReportStatistics();
    }
  }, [startDate, endDate, period]);

  const handleDownloadExcel = async () => {
    if (!startDate || !endDate) {
      toast.error('Pilih tanggal terlebih dahulu');
      return;
    }

    setDownloading({ ...downloading, excel: true });
    try {
      await reportService.downloadExcel(startDate, endDate);
      toast.success('File Excel berhasil diunduh!', { icon: '📥' });
    } catch (err) {
      console.error('Download Excel error:', err);
      toast.error('Gagal mengunduh file Excel');
    } finally {
      setDownloading({ ...downloading, excel: false });
    }
  };

  const handleDownloadPdf = async () => {
    if (!startDate || !endDate) {
      toast.error('Pilih tanggal terlebih dahulu');
      return;
    }

    setDownloading({ ...downloading, pdf: true });
    try {
      await reportService.downloadPdf(startDate, endDate);
      toast.success('File PDF berhasil diunduh!', { icon: '📥' });
    } catch (err) {
      console.error('Download PDF error:', err);
      toast.error('Gagal mengunduh file PDF');
    } finally {
      setDownloading({ ...downloading, pdf: false });
    }
  };

  // Prepare chart data
  const lineChartData = reportStats ? {
    labels: reportStats.daily_stats.map(d => new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Total Kunjungan',
        data: reportStats.daily_stats.map(d => d.total_visits),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  } : null;

  const barChartData = reportStats ? {
    labels: reportStats.daily_stats.map(d => new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Aktif',
        data: reportStats.daily_stats.map(d => d.active_visits),
        backgroundColor: '#3B82F6',
        borderRadius: 6,
      },
      {
        label: 'Selesai',
        data: reportStats.daily_stats.map(d => d.completed_visits),
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, family: 'Inter, sans-serif', weight: '600' },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 11 }, stepSize: 1 },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: {
        ticks: { font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

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
    {
      title: 'Event Hari Ini',
      value: stats?.event_today || stats?.events_today || 0,
      color: 'cyan',
      subtitle: `${stats?.active_events || 0} event berlangsung`,
      icon: Calendar,
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

      {/* Weekly Report Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-brand-navy" />
          <h2 className="text-xl font-bold text-slate-900">Laporan Mingguan</h2>
          <Badge variant="blue" dot>Weekly Report</Badge>
        </div>

        {/* Filter Controls */}
        <Card padding="p-6">
          <CardHeader className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-brand-navy" />
            <h3 className="text-lg font-bold text-slate-900">Filter Periode</h3>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Period Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                Periode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('weekly')}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    period === 'weekly'
                      ? 'bg-brand-navy text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    period === 'monthly'
                      ? 'bg-brand-navy text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Bulanan
                </button>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 focus:border-brand-navy text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 focus:border-brand-navy text-sm"
              />
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={fetchReportStatistics}
                disabled={loadingReport}
                className="w-full px-6 py-2.5 rounded-xl bg-brand-cyan text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingReport ? 'Memuat...' : 'Perbarui Data'}
              </button>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        {reportStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Total Visits */}
              <Card padding="p-6" className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <Badge variant="white">Total</Badge>
                </div>
                <div>
                  <p className="text-sm text-blue-100 mb-1 font-medium">Total Kunjungan</p>
                  <p className="text-4xl font-extrabold tracking-tight">{reportStats.summary.total_visits}</p>
                </div>
              </Card>

              {/* Active Visits */}
              <Card padding="p-6" className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <Badge variant="white">Aktif</Badge>
                </div>
                <div>
                  <p className="text-sm text-amber-100 mb-1 font-medium">Kunjungan Aktif</p>
                  <p className="text-4xl font-extrabold tracking-tight">{reportStats.summary.active_visits}</p>
                </div>
              </Card>

              {/* Completed Visits */}
              <Card padding="p-6" className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-none shadow-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <Badge variant="white">Selesai</Badge>
                </div>
                <div>
                  <p className="text-sm text-emerald-100 mb-1 font-medium">Kunjungan Selesai</p>
                  <p className="text-4xl font-extrabold tracking-tight">{reportStats.summary.completed_visits}</p>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart */}
              <Card padding="p-6">
                <CardHeader className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">Tren Kunjungan Harian</h3>
                </CardHeader>
                <div style={{ height: '300px' }}>
                  {lineChartData && <Line data={lineChartData} options={chartOptions} />}
                </div>
              </Card>

              {/* Bar Chart */}
              <Card padding="p-6">
                <CardHeader className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-900">Status Kunjungan</h3>
                </CardHeader>
                <div style={{ height: '300px' }}>
                  {barChartData && <BarChart2 data={barChartData} options={chartOptions} />}
                </div>
              </Card>
            </div>

            {/* Top Visitors */}
            {reportStats.top_visitors.length > 0 && (
              <Card padding="p-6">
                <CardHeader className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                  <Users className="w-5 h-5 text-brand-navy" />
                  <h3 className="text-lg font-bold text-slate-900">10 Tamu Teratas</h3>
                </CardHeader>
                <div className="space-y-3">
                  {reportStats.top_visitors.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.visitor?.name || '-'}</p>
                          <p className="text-xs text-slate-500">{item.visitor?.company || '-'}</p>
                        </div>
                      </div>
                      <Badge variant="blue">{item.visit_count} kunjungan</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Export Buttons */}
            <Card padding="p-6" className="bg-slate-900 text-white border-none shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                    <FileDown className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Unduh Laporan</h3>
                    <p className="text-sm text-slate-300">
                      Ekspor data statistik ke format Excel atau PDF untuk arsip dan dokumentasi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadExcel}
                    disabled={downloading.excel}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span>{downloading.excel ? 'Mengunduh...' : 'Excel'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloading.pdf}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-5 h-5" />
                    <span>{downloading.pdf ? 'Mengunduh...' : 'PDF'}</span>
                  </button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
