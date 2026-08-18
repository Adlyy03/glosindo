import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarRange, Save, ArrowLeft, MapPin, Clock, FileText } from 'lucide-react';
import eventService from '../../services/eventService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const STATUS_OPTIONS = [
  { value: 'draft',     label: 'Draft' },
  { value: 'scheduled', label: 'Terjadwal' },
  { value: 'ongoing',   label: 'Berlangsung' },
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
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    status: 'scheduled',
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      eventService.getById(id)
        .then((res) => {
          const event = res.data?.data?.event;
          if (event) {
            setForm({
              name: event.name || '',
              description: event.description || '',
              event_date: event.event_date ? event.event_date.split('T')[0] : '',
              start_time: event.start_time?.slice(0, 5) || '',
              end_time: event.end_time?.slice(0, 5) || '',
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nama event wajib diisi'); return; }
    if (!form.event_date) { toast.error('Tanggal event wajib diisi'); return; }
    if (!form.start_time || !form.end_time) { toast.error('Waktu mulai dan selesai wajib diisi'); return; }
    if (form.end_time <= form.start_time) { toast.error('Waktu selesai harus lebih besar dari waktu mulai'); return; }

    setSaving(true);
    try {
      if (isEdit) {
        await eventService.update(id, form);
        toast.success('Event berhasil diperbarui');
      } else {
        await eventService.create(form);
        toast.success('Event berhasil dibuat');
      }
      navigate('/events');
    } catch (err) {
      const msg = err.response?.data?.message || (isEdit ? 'Gagal memperbarui event' : 'Gagal membuat event');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan bg-slate-50/50 transition-all";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5";

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
              {isEdit ? 'Edit Event' : 'Buat Event Baru'}
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            {isEdit ? 'Perbarui detail event yang sudah ada.' : 'Buat event baru untuk mengelola kunjungan tamu.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card padding="p-6 md:p-8" className="space-y-5">
          {/* Nama Event */}
          <div>
            <label className={labelClass}>Nama Event <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Training Karyawan Baru"
              className={inputClass}
              required
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Deskripsi</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Deskripsi singkat tentang event ini..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><CalendarRange className="w-3 h-3" /> Tanggal Event <span className="text-red-500">*</span></span>
            </label>
            <input
              type="date"
              name="event_date"
              value={form.event_date}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Waktu Mulai & Selesai */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Waktu Mulai <span className="text-red-500">*</span></span>
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
              <label className={labelClass}>Waktu Selesai <span className="text-red-500">*</span></label>
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

          {/* Lokasi */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Lokasi</span>
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Contoh: Meeting Room 1, Aula Utama..."
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
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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