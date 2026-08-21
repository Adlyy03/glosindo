import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarRange,
  Save,
  ArrowLeft,
  MapPin,
  Clock,
  FileText,
  Key,
  ShieldCheck,
  Calendar,
  Lock,
  Tag
} from 'lucide-react';
import eventService from '../../services/eventService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const STATUS_OPTIONS = [
  { value: 'draft',     label: 'Draft' },
  { value: 'scheduled', label: 'Terjadwal' },
  { value: 'ongoing',   label: 'Berlangsung / Aktif' },
  { value: 'finished',  label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const EventFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '08:00',
    end_time: '17:00',
    registration_start_at: '',
    registration_end_at: '',
    location: '',
    status: 'scheduled',
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      eventService
        .getById(id)
        .then((res) => {
          const event = res.data?.data?.event;
          if (event) {
            const startDate = event.start_date
              ? event.start_date.split('T')[0]
              : (event.event_date ? event.event_date.split('T')[0] : '');
            const endDate = event.end_date
              ? event.end_date.split('T')[0]
              : startDate;

            setForm({
              name: event.name || '',
              code: event.code || '',
              description: event.description || '',
              start_date: startDate,
              end_date: endDate,
              start_time: event.start_time?.slice(0, 5) || '08:00',
              end_time: event.end_time?.slice(0, 5) || '17:00',
              registration_start_at: event.registration_start_at ? event.registration_start_at.slice(0, 16) : '',
              registration_end_at: event.registration_end_at ? event.registration_end_at.slice(0, 16) : '',
              location: event.location || '',
              status: event.status || 'scheduled',
            });
          }
        })
        .catch(() => toast.error('Gagal memuat data event'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto fill end_date if empty when start_date is chosen
      if (name === 'start_date' && !prev.end_date) {
        updated.end_date = value;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nama event wajib diisi');
      return;
    }
    if (!form.start_date) {
      toast.error('Tanggal mulai event wajib diisi');
      return;
    }
    if (!form.end_date) {
      toast.error('Tanggal selesai event wajib diisi');
      return;
    }
    if (form.end_date < form.start_date) {
      toast.error('Tanggal selesai event tidak boleh lebih awal dari tanggal mulai');
      return;
    }
    if (!form.start_time || !form.end_time) {
      toast.error('Waktu mulai dan selesai wajib diisi');
      return;
    }
    if (form.start_date === form.end_date && form.end_time <= form.start_time) {
      toast.error('Untuk event pada hari yang sama, waktu selesai harus setelah waktu mulai');
      return;
    }

    // Validate registration dates if filled
    if (form.registration_start_at && form.registration_end_at) {
      if (form.registration_end_at <= form.registration_start_at) {
        toast.error('Batas akhir registrasi harus setelah waktu mulai registrasi');
        return;
      }
      
      // Registration end must be <= event end (end_date + end_time)
      const eventEndDateTime = new Date(`${form.end_date}T${form.end_time}:00`);
      const regEndDateTime = new Date(form.registration_end_at);
      
      if (regEndDateTime > eventEndDateTime) {
        toast.error('Batas akhir registrasi tidak boleh melebihi waktu selesai event');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        event_date: form.start_date,
      };

      if (!payload.registration_start_at) delete payload.registration_start_at;
      if (!payload.registration_end_at) delete payload.registration_end_at;
      if (!payload.code?.trim()) delete payload.code;

      if (isEdit) {
        await eventService.update(id, payload);
        toast.success('Event berhasil diperbarui');
      } else {
        await eventService.create(payload);
        toast.success('Event berhasil dibuat');
      }
      navigate('/events');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (isEdit ? 'Gagal memperbarui event' : 'Gagal membuat event');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan bg-slate-50/50 transition-all';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5';

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-xs font-semibold">Memuat data event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => navigate('/events')}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <CalendarRange className="w-5 h-5 text-brand-navy" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isEdit ? 'Edit Data Event' : 'Buat Event Baru'}
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            {isEdit
              ? 'Perbarui detail event, link registrasi publik, dan periode pelaksanaan.'
              : 'Buat event baru untuk mengelola kunjungan tamu dan membuka link registrasi publik.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card padding="p-6 md:p-8" className="space-y-5">
          {/* Nama Event */}
          <div>
            <label className={labelClass}>
              Nama Event <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Seminar Nasional Keamanan Siber 2026"
              className={inputClass}
              required
            />
          </div>

          {/* Kode / Slug Event */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Kode / Token Unik Event (Opsional)
              </span>
            </label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Contoh: seminar-cyber-2026 (otomatis dibuat bila kosong)"
              className={inputClass}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Digunakan untuk tautan publik: <code className="text-brand-navy font-semibold">/event/{form.code || '{kode}'}/register</code>
            </p>
          </div>

          {/* Deskripsi */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Deskripsi Event
              </span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Deskripsi singkat mengenai agenda, peserta, dan tujuan event..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          {/* Periode Tanggal Event (1 hari / beberapa hari) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Mulai <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Selesai <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Waktu Mulai & Selesai */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Waktu Mulai <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Waktu Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Periode Registrasi Publik */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-navy" />
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pengaturan Periode Pendaftaran Publik
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              Kosongkan jika pendaftaran publik dibuka kapan saja hingga event berakhir.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Buka Pendaftaran (Waktu)</label>
                <input
                  type="datetime-local"
                  name="registration_start_at"
                  value={form.registration_start_at}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tutup Pendaftaran (Waktu)</label>
                <input
                  type="datetime-local"
                  name="registration_end_at"
                  value={form.registration_end_at}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Lokasi Ruangan / Gedung
              </span>
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Contoh: Auditorium Lantai 3, Meeting Room Utama..."
              className={inputClass}
            />
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status Event</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => navigate('/events')}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={saving}
              icon={Save}
            >
              {isEdit ? 'Simpan Perubahan' : 'Buat Event'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EventFormPage;