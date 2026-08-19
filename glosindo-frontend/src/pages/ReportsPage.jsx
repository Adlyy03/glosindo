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
  FileDown
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
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Laporan & Statistik
            </h1>
            <Badge variant="blue" dot>Reporting</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Lihat statistik kunjungan tamu dalam bentuk grafik dan unduh laporan dalam format Excel atau PDF.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <Card padding="p-6">
        <CardHeader className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <Calendar className="w-5 h-5 text-brand-navy" />
          <h2 className="text-lg font-bold text-slate-900">Filter Periode</h2>
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
              onClick={fetchStatistics}
              disabled={loading}
              className="w-full px-6 py-2.5 rounded-xl bg-brand-cyan text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memuat...' : 'Perbarui Data'}
            </button>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      {stats && (
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
                <p className="text-4xl font-extrabold tracking-tight">{stats.summary.total_visits}</p>
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
                <p className="text-4xl font-extrabold tracking-tight">{stats.summary.active_visits}</p>
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
                <p className="text-4xl font-extrabold tracking-tight">{stats.summary.completed_visits}</p>
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
                {barChartData && <Bar data={barChartData} options={chartOptions} />}
              </div>
            </Card>
          </div>

          {/* Top Visitors */}
          {stats.top_visitors.length > 0 && (
            <Card padding="p-6">
              <CardHeader className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                <Users className="w-5 h-5 text-brand-navy" />
                <h3 className="text-lg font-bold text-slate-900">10 Tamu Teratas</h3>
              </CardHeader>
              <div className="space-y-3">
                {stats.top_visitors.map((item, idx) => (
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

      {/* Empty State */}
      {!stats && !loading && (
        <Card padding="p-12" className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Belum Ada Data</h3>
          <p className="text-sm text-slate-500">
            Pilih periode dan tanggal untuk melihat statistik kunjungan.
          </p>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
