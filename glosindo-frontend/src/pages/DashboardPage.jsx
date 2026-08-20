import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Calendar,
  CalendarRange,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Sparkles,
  Layers
} from 'lucide-react';
import { Line, Bar as BarChart2, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
import eventService from '../services/eventService';
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
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

dayjs.locale('id');

const DashboardPage = () => {
  const navigate = useNavigate();
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

  // Copied link id
  const [copiedEventId, setCopiedEventId] = useState(null);

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

  const handleCopyLink = (event, e) => {
    e.stopPropagation();
    const code = event.code || event.id;
    const url = `${window.location.origin}/event/${code}/register`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedEventId(event.id);
      toast.success('Link registrasi publik disalin!', { icon: '🔗' });
      setTimeout(() => setCopiedEventId(null), 2500);
    }).catch(() => {
      toast.error('Gagal menyalin link');
    });
  };

  const handleDownloadExcel = async () => {
    if (!startDate || !endDate) {
      toast.error('Pilih tanggal terlebih dahulu');
      return;
    }

    setDownloading({ ...downloading, excel: true });
    try {
      const res = await reportService.exportExcel(startDate, endDate);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-kunjungan-${startDate}-${endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('File Excel berhasil diunduh!', { icon: '📥' });
    } catch {
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
      const res = await reportService.exportPdf(startDate, endDate);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-kunjungan-${startDate}-${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('File PDF berhasil diunduh!', { icon: '📥' });
    } catch {
      toast.error('Gagal mengunduh file PDF');
    } finally {
      setDownloading({ ...downloading, pdf: false });
    }
  };

  // Prepare chart data
  const lineChartData = reportStats ? {
    labels: reportStats.daily_stats.map((d) =>
      new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    ),
    datasets: [
      {
        label: 'Total Kunjungan',
        data: reportStats.daily_stats.map((d) => d.total_visits),
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
    labels: reportStats.daily_stats.map((d) =>
      new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    ),
    datasets: [
      {
        label: 'Aktif',
        data: reportStats.daily_stats.map((d) => d.active_visits),
        backgroundColor: '#3B82F6',
        borderRadius: 6,
      },
      {
        label: 'Selesai',
        data: reportStats.daily_stats.map((d) => d.completed_visits),
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
    ],
  } : null;

  // Event Doughnut Chart Data
  const eventDoughnutData = {
    labels: ['Sudah Check-In', 'Belum Check-In'],
    datasets: [
      {
        data: [
          stats?.event_participants_checked_in || 0,
          stats?.event_participants_not_checked_in || 0,
        ],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderWidth: 0,
      },
    ],
  };

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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-br from-indigo-700 via-brand-navy to-blue-900 rounded-3xl p-8 md:p-10 text-white shadow-xl overflow-hidden min-h-[190px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-cyan-200 font-semibold uppercase tracking-wider mb-1">
              {dayjs().format('dddd, DD MMMM YYYY')}
            </p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Selamat datang, <span className="text-cyan-300">{user?.name || 'User'}</span>
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-md mt-1 leading-relaxed">
              Sistem buku tamu digital terintegrasi & manajemen event PT GLOSINDO.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={CalendarRange}
              onClick={() => navigate('/events')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Kelola Event
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Camera}
              onClick={() => navigate('/check-in')}
              className="bg-brand-cyan hover:bg-cyan-500 text-white border-none font-bold"
            >
              Camera Check-In
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link to="/check-in">
          <Card hover className="p-5 text-center bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xs font-bold text-slate-900">Check-In</p>
            <p className="text-[10px] text-slate-400">Scanner Wajah</p>
          </Card>
        </Link>

        <Link to="/events">
          <Card hover className="p-5 text-center bg-white border border-cyan-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all bg-cyan-50/20">
            <div className="w-12 h-12 mx-auto mb-2 bg-cyan-100 rounded-2xl flex items-center justify-center">
              <CalendarRange className="w-6 h-6 text-cyan-600" />
            </div>
            <p className="text-xs font-bold text-slate-900">Event</p>
            <p className="text-[10px] text-cyan-600 font-semibold">Tamu Perusahaan</p>
          </Card>
        </Link>

        <Link to="/active-visitors">
          <Card hover className="p-5 text-center bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 mx-auto mb-2 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xs font-bold text-slate-900">Tamu Aktif</p>
            <p className="text-[10px] text-slate-400">Di Dalam Gedung</p>
          </Card>
        </Link>

        <Link to="/visit-history">
          <Card hover className="p-5 text-center bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 mx-auto mb-2 bg-amber-100 rounded-2xl flex items-center justify-center">
              <History className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-xs font-bold text-slate-900">Riwayat</p>
            <p className="text-[10px] text-slate-400">Log Kunjungan</p>
          </Card>
        </Link>

        <Link to="/visitors">
          <Card hover className="p-5 text-center bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-bold text-slate-900">Direktori Tamu</p>
            <p className="text-[10px] text-slate-400">Database Master</p>
          </Card>
        </Link>
      </div>

      {/* ─── EVENT & TAMU PERUSAHAAN SECTION ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-brand-navy" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Statistik Event & Tamu Perusahaan
            </h2>
            <Badge variant="cyan">Event System</Badge>
          </div>
          <Link to="/events" className="text-xs font-bold text-brand-navy hover:underline flex items-center gap-1">
            Lihat Semua Event <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 Event KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <Card padding="p-4" className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Event</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats?.total_events || 0}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Semua event</p>
          </Card>

          <Card padding="p-4" className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">Event Aktif</p>
            <p className="text-2xl font-black text-brand-navy mt-1">{stats?.active_events || 0}</p>
            <p className="text-[10px] text-cyan-600 mt-0.5">Sedang berjalan</p>
          </Card>

          <Card padding="p-4" className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Event Selesai</p>
            <p className="text-2xl font-black text-slate-700 mt-1">{stats?.finished_events || 0}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Riwayat tuntas</p>
          </Card>

          <Card padding="p-4" className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Total Peserta</p>
            <p className="text-2xl font-black text-purple-900 mt-1">{stats?.total_event_participants || 0}</p>
            <p className="text-[10px] text-purple-600 mt-0.5">Pra-registrasi & tamu</p>
          </Card>

          <Card padding="p-4" className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Sudah Check-In</p>
            <p className="text-2xl font-black text-emerald-800 mt-1">{stats?.event_participants_checked_in || 0}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Telah hadir di lokasi</p>
          </Card>

          <Card padding="p-4" className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Belum Check-In</p>
            <p className="text-2xl font-black text-amber-800 mt-1">{stats?.event_participants_not_checked_in || 0}</p>
            <p className="text-[10px] text-amber-600 mt-0.5">Menunggu kehadiran</p>
          </Card>
        </div>

        {/* Event Terdekat & Grafik Kehadiran */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Upcoming / Active Events List */}
          <Card padding="p-6" className="lg:col-span-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-brand-navy" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Event Aktif & Terdekat
                </h3>
              </div>
              <Badge variant="neutral">Top 5 Agenda</Badge>
            </div>

            {(!stats?.upcoming_events || stats.upcoming_events.length === 0) ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <Calendar className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs font-semibold text-slate-600">Tidak ada event terdekat saat ini.</p>
                <p className="text-[11px]">Buat event baru untuk membuka registrasi tamu perusahaan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcoming_events.map((evt) => {
                  const startDate = evt.start_date || evt.event_date;
                  const totalPart = Math.max(evt.participants_count || 0, evt.visits_count || 0);

                  return (
                    <div
                      key={evt.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 hover:bg-slate-100/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-extrabold text-slate-900 text-sm">{evt.name}</p>
                          {evt.code && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                              {evt.code}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {dayjs(startDate).format('DD MMM YYYY')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {evt.start_time?.slice(0, 5)} - {evt.end_time?.slice(0, 5)} WIB
                          </span>
                          {evt.location && (
                            <span className="flex items-center gap-1 truncate max-w-[120px]">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {evt.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white text-brand-navy font-bold text-xs border border-slate-200">
                          <Users className="w-3.5 h-3.5" />
                          {totalPart} Peserta
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          icon={copiedEventId === evt.id ? Check : Copy}
                          onClick={(e) => handleCopyLink(evt, e)}
                          className="text-xs"
                          title="Salin Link Registrasi Publik"
                        >
                          {copiedEventId === evt.id ? 'Tersalin' : 'Link'}
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/events/${evt.id}`)}
                          className="text-xs py-1.5 px-3"
                        >
                          Detail
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Participant Presence Status Donut */}
          <Card padding="p-6" className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Kehadiran Peserta
                  </h3>
                </div>
                <Badge variant="emerald">Realtime</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Rasio peserta event yang telah melakukan check-in vs belum hadir.
              </p>
            </div>

            <div className="h-44 relative flex items-center justify-center my-2">
              <Doughnut
                data={eventDoughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 11, weight: '600' } } },
                  },
                  cutout: '70%',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-center text-xs font-bold">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                <p className="text-[10px] text-emerald-600 font-semibold uppercase">Check-In</p>
                <p className="text-base font-extrabold">{stats?.event_participants_checked_in || 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                <p className="text-[10px] text-amber-600 font-semibold uppercase">Belum Hadir</p>
                <p className="text-base font-extrabold">{stats?.event_participants_not_checked_in || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── GENERAL VISITOR STATS ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-navy" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Ringkasan Kunjungan Kantor
          </h2>
          <Badge variant="navy">Visitor Summary</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-none rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-2xl shadow-xs">
                <CalendarCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-blue-900">{stats?.visitor_today || 0}</p>
                <p className="text-xs text-blue-700 font-semibold">Tamu Hari Ini</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-none rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-2xl shadow-xs">
                <History className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-amber-900">{stats?.total_visit_this_month || 0}</p>
                <p className="text-xs text-amber-700 font-semibold">Kunjungan Bulan Ini</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-none rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-2xl shadow-xs">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-green-900">{stats?.total_visitor || 0}</p>
                <p className="text-xs text-green-700 font-semibold">Total Profil Tamu</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Weekly & Monthly Report Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-brand-navy" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Laporan & Tren Statistik</h2>
          <Badge variant="blue" dot>Analytics</Badge>
        </div>

        {/* Filter Controls */}
        <Card padding="p-6">
          <CardHeader className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-brand-navy" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Filter Periode Analitik</h3>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                Periode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('weekly')}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    period === 'weekly'
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    period === 'monthly'
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Bulanan
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-cyan text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-cyan text-sm"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchReportStatistics}
                disabled={loadingReport}
                className="w-full px-6 py-2.5 rounded-xl bg-brand-cyan text-white font-bold text-sm shadow-sm hover:bg-cyan-600 transition-all disabled:opacity-50"
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
              <Card padding="p-6" className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg">
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

              <Card padding="p-6" className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-lg">
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

              <Card padding="p-6" className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-none shadow-lg">
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
              <Card padding="p-6">
                <CardHeader className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tren Kunjungan Harian</h3>
                </CardHeader>
                <div style={{ height: '280px' }}>
                  {lineChartData && <Line data={lineChartData} options={chartOptions} />}
                </div>
              </Card>

              <Card padding="p-6">
                <CardHeader className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Status Kunjungan</h3>
                </CardHeader>
                <div style={{ height: '280px' }}>
                  {barChartData && <BarChart2 data={barChartData} options={chartOptions} />}
                </div>
              </Card>
            </div>

            {/* Export Buttons */}
            <Card padding="p-6" className="bg-slate-900 text-white border-none shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                    <FileDown className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-0.5">Unduh Laporan Kunjungan</h3>
                    <p className="text-xs text-slate-300">
                      Ekspor data statistik kunjungan ke format Excel atau PDF untuk arsip resmi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadExcel}
                    disabled={downloading.excel}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{downloading.excel ? 'Mengunduh...' : 'Excel'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloading.pdf}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
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
