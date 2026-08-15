import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Power,
  Share2,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import publicRegistrationService from '../services/publicRegistrationService';
import Button from './ui/Button';
import Badge from './ui/Badge';

const PublicRegistrationToggle = ({ compact = false, showLink = true }) => {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await publicRegistrationService.getStatus();
      setEnabled(res.enabled);
    } catch (err) {
      console.error('Failed to load public registration status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggle = async () => {
    const nextState = !enabled;
    setToggling(true);
    try {
      const res = await publicRegistrationService.toggleStatus(nextState);
      setEnabled(res.enabled);
      if (res.enabled) {
        toast.success('Pendaftaran tamu mandiri berhasil DIAKTIFKAN');
      } else {
        toast('Pendaftaran tamu mandiri berhasil DINONAKTIFKAN', { icon: '🔒' });
      }
    } catch (err) {
      console.error('Failed to toggle public registration:', err);
      toast.error('Gagal mengubah status pendaftaran publik');
    } finally {
      setToggling(false);
    }
  };

  const publicUrl = `${window.location.origin}/register`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('Tautan pendaftaran tamu mandiri disalin ke clipboard!', { icon: '📋' });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={loading || toggling}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
            enabled
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          }`}
          title="Klik untuk mengubah status pendaftaran online tamu"
        >
          {toggling ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : enabled ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span>Portal Tamu: {enabled ? 'Aktif' : 'Tutup'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
            enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
          }`}>
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Pendaftaran Tamu Mandiri (Online/Home)
              </h3>
              <Badge variant={enabled ? 'emerald' : 'rose'}>
                {enabled ? 'AKTIF / TERBUKA' : 'NONAKTIF / DITUTUP'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Kontrol apakah tamu dari luar/rumah diizinkan mendaftar secara mandiri melalui browser sebelum tiba di lokasi.
            </p>
          </div>
        </div>

        {/* Toggle Switch Button */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={handleToggle}
            disabled={loading || toggling}
            className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                enabled ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs font-bold text-slate-700 min-w-[70px]">
            {toggling ? 'Menyimpan...' : enabled ? 'Dibuka' : 'Ditutup'}
          </span>
        </div>
      </div>

      {/* Link & Details */}
      {showLink && (
        <div className="mt-5 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <span className="font-bold text-slate-600 px-1 whitespace-nowrap">Tautan Publik:</span>
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 bg-white px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-700 text-xs select-all outline-none"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                icon={Copy}
              >
                Salin Tautan
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(publicUrl, '_blank')}
                icon={ExternalLink}
              >
                Buka
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              Tamu yang membuka tautan ini hanya dapat mengisi formulir pendaftaran. Mereka tidak memiliki akses ke sistem resepsionis maupun admin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicRegistrationToggle;
