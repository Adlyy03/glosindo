import React, { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';
import PublicRegistrationToggle from '../../components/PublicRegistrationToggle';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Settings, BarChart3, ShieldCheck, Activity } from 'lucide-react';

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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-navy to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-white/10 text-cyan-300">
              <Settings className="w-5 h-5" />
            </span>
            <Badge variant="cyan">Admin Control</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Konfigurasi Sistem & Layanan</h1>
          <p className="mt-1 text-sm text-slate-300">
            Kelola portal pendaftaran tamu publik dan pantau aktivitas sistem GLOSINDO.
          </p>
        </div>
      </div>

      {/* 1. Public Guest Registration Feature Toggle */}
      <PublicRegistrationToggle showLink={true} />

      {/* 2. Trends / System Metrics */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-navy" />
          Aktivitas Kunjungan (7 Hari Terakhir)
        </h2>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs text-center text-slate-500 text-sm">
            Memuat data tren...
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-rose-200 p-6 text-rose-600 shadow-xs text-sm">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {trends.map((item) => (
                <div
                  key={item.date}
                  className="flex flex-col justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <span className="text-xs font-semibold text-slate-500">{item.date}</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-extrabold text-slate-900">{item.count}</span>
                    <span className="text-[11px] text-slate-400 font-medium">kunjungan</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
