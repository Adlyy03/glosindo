import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock,
  FileSpreadsheet,
  FileDown,
  Zap,
  BarChart3,
  Activity,
  Award
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import reportService from '../services/reportService';
import toast from 'react-hot-toast';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ReportsPage = () => {
  const [period, setPeriod] = useState('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [downloading, setDownloading] = useState({ excel: false, pdf: false });

  // Set default dates on mount
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

  const fetchStatistics = async () => {
    if (!startDate || !endDate) {
      toast.error('Pilih tanggal terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const res = await reportService.getStatistics(period, startDate, endDate);
      setStats(res.data.data);
      toast.success('Data statistik berhasil dimuat', { icon: '📊' });
    } catch (err) {
      console.error('Fetch statistics error:', err);
      toast.error(err.response?.data?.message || 'Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchStatistics();
    }
  }, [startDate, endDate, period]);

  const handleDownloadExcel = async () => {
    if (!startDate || !endDate) {
      toast.error('Pilih tanggal terlebih dahulu');
      return;
    }

    setDownloading({ ...downloading, excel: true });
    try {
      console.log('Requesting Excel export...', { startDate, endDate });
      const res = await reportService.exportExcel(startDate, endDate);
      console.log('Excel response:', res);
      console.log('Response data type:', res.data.constructor.name);
      console.log('Response data size:', res.data.size);
      
      // Check if response is actually a blob
      if (!(res.data instanceof Blob)) {
        console.error('Response is not a Blob:', res.data);
        toast.error('Format respons tidak valid');
        return;
      }

      const url = window.URL.createObjectURL(new Blob([res.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Kunjungan_${startDate}_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('File Excel berhasil diunduh!', { icon: '📥' });
    } catch (err) {
      console.error('Download Excel error:', err);
      console.error('Error response:', err.response);
      toast.error(err.response?.data?.message || 'Gagal mengunduh file Excel');
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
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Kunjungan_${startDate}_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('File PDF berhasil diunduh!', { icon: '📥' });
    } catch (err) {
      console.error('Download PDF error:', err);
      toast.error('Gagal mengunduh file PDF');
    } finally {
      setDownloading({ ...downloading, pdf: false });
    }
  };

  // Prepare chart data
  const lineChartData = stats ? {
    labels: stats.daily_stats.map(d => new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Total Kunjungan',
        data: stats.daily_stats.map(d => d.total_visits),
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

  const barChartData = stats ? {
    labels: stats.daily_stats.map(d => new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Aktif',
        data: stats.daily_stats.map(d => d.active_visits),
        backgroundColor: '#3B82F6',
        borderRadius: 6,
      },
      {
        label: 'Selesai',
        data: stats.daily_stats.map(d => d.completed_visits),
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Hero Header - Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-75" />
          <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-2xl animate-bounce delay-150" style={{ animationDuration: '3s' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Activity className="w-8 h-8" />
            </div>
            <Badge variant="white" className="text-xs font-bold">Advanced Analytics</Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
            Laporan & Analitik Kunjungan
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
            Dashboard reporting dengan visualisasi data real-time dan ekspor laporan profesional.
          </p>

          {/* Quick Stats Mini Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all group">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-slate-300 font-medium">Total</span>
                </div>
                <p className="text-2xl font-black">{stats.summary.total_visits}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all group">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-slate-300 font-medium">Aktif</span>
                </div>
                <p className="text-2xl font-black">{stats.summary.active_visits}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all group">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-slate-300 font-medium">Selesai</span>
                </div>
                <p className="text-2xl font-black">{stats.summary.completed_visits}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all group">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-slate-300 font-medium">Unique</span>
                </div>
                <p className="text-2xl font-black">{stats.summary.unique_visitors}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Controls - Premium Glass Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-200/70">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Filter Periode Laporan</h2>
              <p className="text-xs text-slate-500">Pilih rentang tanggal analisis data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Period Toggle */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                Periode
              </label>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setPeriod('weekly')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-xs transition-all ${
                    period === 'weekly'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-[1.02]'
                      : 'text-slate-600 hover:bg-white/70'
                  }`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-xs transition-all ${
                    period === 'monthly'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-[1.02]'
                      : 'text-slate-600 hover:bg-white/70'
                  }`}
                >
                  Bulanan
                </button>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2.5 uppercase tracking-wider">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm font-medium transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2.5 uppercase tracking-wider">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm font-medium transition-all"
              />
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={fetchStatistics}
                disabled={loading}
                className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-sm shadow-lg hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Perbarui Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Total Visits - Premium Card */}
            <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <Badge variant="white" className="text-xs font-black">TOTAL</Badge>
                </div>
                <div>
                  <p className="text-sm text-blue-100 mb-1.5 font-semibold uppercase tracking-wider">Total Kunjungan</p>
                  <p className="text-5xl font-black tracking-tighter mb-1">{stats.summary.total_visits}</p>
                  <p className="text-xs text-blue-200/80">Seluruh periode terpilih</p>
                </div>
              </div>
            </div>

            {/* Active Visits - Premium Card */}
            <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg group-hover:scale-110 transition-transform group-hover:rotate-3">
                    <Clock className="w-7 h-7" />
                  </div>
                  <Badge variant="white" className="text-xs font-black">AKTIF</Badge>
                </div>
                <div>
                  <p className="text-sm text-orange-100 mb-1.5 font-semibold uppercase tracking-wider">Kunjungan Aktif</p>
                  <p className="text-5xl font-black tracking-tighter mb-1">{stats.summary.active_visits}</p>
                  <p className="text-xs text-orange-200/80">Sedang berlangsung</p>
                </div>
              </div>
            </div>

            {/* Completed Visits - Premium Card */}
            <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg group-hover:scale-110 transition-transform group-hover:-rotate-3">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <Badge variant="white" className="text-xs font-black">SELESAI</Badge>
                </div>
                <div>
                  <p className="text-sm text-emerald-100 mb-1.5 font-semibold uppercase tracking-wider">Kunjungan Selesai</p>
                  <p className="text-5xl font-black tracking-tighter mb-1">{stats.summary.completed_visits}</p>
                  <p className="text-xs text-emerald-200/80">Check-out sukses</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts - Premium Glass Design */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <div className="relative overflow-hidden rounded-3xl p-6 bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-200/70">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Tren Kunjungan Harian</h3>
                    <p className="text-xs text-slate-500">Grafik pergerakan visit</p>
                  </div>
                </div>
                <div style={{ height: '320px' }}>
                  {lineChartData && <Line data={lineChartData} options={chartOptions} />}
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="relative overflow-hidden rounded-3xl p-6 bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-200/70">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-md">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Status Kunjungan Harian</h3>
                    <p className="text-xs text-slate-500">Breakdown aktif vs selesai</p>
                  </div>
                </div>
                <div style={{ height: '320px' }}>
                  {barChartData && <Bar data={barChartData} options={chartOptions} />}
                </div>
              </div>
            </div>
          </div>

          {/* Top Visitors - Premium Ranking Board */}
          {stats.top_visitors.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-300/50">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">🏆 Top 10 Tamu Teraktif</h3>
                    <p className="text-xs text-slate-600">Berdasarkan frekuensi kunjungan</p>
                  </div>
                </div>
                
                <div className="space-y-2.5">
                  {stats.top_visitors.map((item, idx) => {
                    const isMedal = idx < 3;
                    const medalColors = [
                      'from-yellow-400 to-amber-500',
                      'from-slate-300 to-slate-400',
                      'from-orange-400 to-amber-600'
                    ];
                    
                    return (
                      <div 
                        key={idx} 
                        className={`group flex items-center justify-between p-4 rounded-2xl transition-all ${
                          isMedal 
                            ? 'bg-white shadow-md hover:shadow-lg scale-[1.02]' 
                            : 'bg-white/70 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${
                            isMedal 
                              ? `bg-gradient-to-br ${medalColors[idx]} text-white` 
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                              {item.visitor?.name || '-'}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">{item.visitor?.company || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-xs shadow-sm">
                            {item.visit_count}x
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Export Buttons - Premium Action Card */}
          <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                  <FileDown className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">Ekspor Laporan Profesional</h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                    Download laporan lengkap dengan visualisasi data dalam format Excel (analisis mendalam) atau PDF (presentasi formal).
                  </p>
                </div>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={handleDownloadExcel}
                  disabled={downloading.excel}
                  className="group relative overflow-hidden flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-sm shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <FileSpreadsheet className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">
                    {downloading.excel ? 'Downloading...' : 'Export Excel'}
                  </span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  disabled={downloading.pdf}
                  className="group relative overflow-hidden flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <FileText className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">
                    {downloading.pdf ? 'Downloading...' : 'Export PDF'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State - Premium */}
      {!stats && !loading && (
        <div className="relative overflow-hidden rounded-3xl p-16 bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200 text-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Menunggu Data Analitik</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Pilih rentang tanggal pada filter di atas untuk menampilkan statistik kunjungan dan grafik visual.
            </p>
          </div>
        </div>
      )}

      {/* Loading State - Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-3xl bg-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-96 rounded-3xl bg-slate-200" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
