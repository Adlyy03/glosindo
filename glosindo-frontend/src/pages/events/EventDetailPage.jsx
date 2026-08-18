import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  CalendarRange, Clock, MapPin, User, Users, CheckCircle2,
  LogOut, Hourglass, Building2, ArrowLeft, Pencil, RefreshCw
} from 'lucide-react';
import eventService from '../../services/eventService';
import useAuthStore from '../../store/authStore';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',      variant: 'neutral' },
  scheduled: { label: 'Terjadwal',  variant: 'navy' },
  ongoing:   { label: 'Berlangsung',variant: 'emerald', dot: true },
  finished:  { label: 'Selesai',    variant: 'neutral' },
  cancelled: { label: 'Dibatalkan', variant: 'danger' },
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisor = user?.role === 'supervisor';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventService.getById(id);
      setData(res.data?.data);
    } catch {
      toast.error('Gagal memuat detail event');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-xs font-semibold">Memuat data detail event...</p>
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-700 font-bold">Event tidak ditemukan.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/events')}>
          Kembali ke Daftar Event
        </Button>
      </div>
    );
  }

  const { event, statistics, participants = [] } = data;
  const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/events')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{event.name}</h1>
              <Badge variant={statusCfg.variant} dot={statusCfg.dot}>{statusCfg.label}</Badge>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              {event.description || 'Tidak ada deskripsi event.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <Button variant="outline" size="md" icon={RefreshCw} onClick={loadDetail}>
            Refresh
          </Button>
          {!isSupervisor && (
            <Button variant="primary" size="md" icon={Pencil} onClick={() => navigate(`/events/${event.id}/edit`)}>
              Edit Event
            </Button>
          )}
        </div>
      </div>

      {/* Info Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-50 text-brand-navy">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Tanggal</p>
            <p className="text-sm font-bold text-slate-800">{dayjs(event.event_date).format('DD MMMM YYYY')}</p>
          </div>
        </Card>

        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Waktu</p>
            <p className="text-sm font-bold text-slate-800">{event.start_time?.slice(0,5)} - {event.end_time?.slice(0,5)} WIB</p>
          </div>
        </Card>

        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Lokasi</p>
            <p className="text-sm font-bold text-slate-800">{event.location || '-'}</p>
          </div>
        </Card>

        <Card padding="p-4" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Pembuat Event</p>
            <p className="text-sm font-bold text-slate-800">{event.creator?.name || '-'}</p>
          </div>
        </Card>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card padding="p-4" className="text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Peserta</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{statistics?.total_visitors || 0}</p>
        </Card>
        <Card padding="p-4" className="text-center bg-emerald-50/50 border-emerald-100">
          <p className="text-[11px] font-bold text-emerald-600 uppercase">Check-In</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{statistics?.checked_in || 0}</p>
        </Card>
        <Card padding="p-4" className="text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Check-Out</p>
          <p className="text-2xl font-extrabold text-slate-700 mt-1">{statistics?.checked_out || 0}</p>
        </Card>
        <Card padding="p-4" className="text-center bg-blue-50/50 border-blue-100">
          <p className="text-[11px] font-bold text-brand-navy uppercase">Masih di Lokasi</p>
          <p className="text-2xl font-extrabold text-brand-navy mt-1">{statistics?.still_inside || 0}</p>
        </Card>
        <Card padding="p-4" className="text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Rata-rata Durasi</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">
            {statistics?.avg_duration ? `${statistics.avg_duration} m` : '-'}
          </p>
        </Card>
        <Card padding="p-4" className="text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Perusahaan</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{statistics?.companies_count || 0}</p>
        </Card>
      </div>

      {/* Participants List */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-navy" />
            <h2 className="text-base font-bold text-slate-900">Daftar Tamu / Peserta Event</h2>
          </div>
          <Badge variant="neutral">{participants.length} Tamu Terdaftar</Badge>
        </div>

        {participants.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-600">Belum ada tamu yang check-in untuk event ini.</p>
            <p className="text-xs mt-1">Gunakan menu Check-In Tamu dan pilih event ini saat tamu hadir.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Nama Tamu</th>
                  <th className="px-6 py-4">Perusahaan</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4 text-center">Durasi</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{item.visitor?.name || '-'}</p>
                      {item.visitor?.phone && <p className="text-xs text-slate-400">{item.visitor.phone}</p>}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {item.visitor?.company || 'Pribadi'}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {dayjs(item.check_in).format('DD/MM/YY HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {item.check_out ? dayjs(item.check_out).format('DD/MM/YY HH:mm') : '—'}
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-700">
                      {item.duration !== null ? `${item.duration} mnt` : '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.status === 'IN' ? (
                        <Badge variant="emerald" dot>Di Lokasi</Badge>
                      ) : (
                        <Badge variant="neutral">Selesai</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EventDetailPage;