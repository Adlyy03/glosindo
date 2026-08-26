import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trophy, ArrowLeft, Save } from 'lucide-react';
import gamesEventService from '../../services/gamesEventService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const GamesEventFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'draft',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const res = await gamesEventService.getById(id);
      const event = res.data.data;
      setFormData({
        name: event.name || '',
        description: event.description || '',
        start_date: event.start_date || '',
        end_date: event.end_date || '',
        status: event.status || 'draft',
      });
    } catch (err) {
      toast.error('Gagal memuat data event');
      navigate('/games/events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama event wajib diisi';
    if (!formData.start_date) newErrors.start_date = 'Tanggal mulai wajib diisi';
    if (!formData.end_date) newErrors.end_date = 'Tanggal selesai wajib diisi';
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'Tanggal selesai harus setelah tanggal mulai';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEdit) {
        await gamesEventService.update(id, formData);
        toast.success('Games event berhasil diupdate');
      } else {
        await gamesEventService.create(formData);
        toast.success('Games event berhasil dibuat');
      }
      navigate('/games/events');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      }
      toast.error(err.response?.data?.message || 'Gagal menyimpan games event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/games/events')}>
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            {isEdit ? 'Edit Games Event' : 'Buat Games Event'}
          </h1>
          <p className="text-neutral-600 mt-1">
            {isEdit ? 'Update informasi games event' : 'Buat games event baru dengan kelompok & poin'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Nama Event <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Games 17 Agustus 2024"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent ${
                errors.name ? 'border-danger-500' : 'border-neutral-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Deskripsi singkat tentang games event..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tanggal Mulai <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent ${
                  errors.start_date ? 'border-danger-500' : 'border-neutral-300'
                }`}
              />
              {errors.start_date && <p className="mt-1 text-sm text-danger-600">{errors.start_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tanggal Selesai <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent ${
                  errors.end_date ? 'border-danger-500' : 'border-neutral-300'
                }`}
              />
              {errors.end_date && <p className="mt-1 text-sm text-danger-600">{errors.end_date}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Status <span className="text-danger-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Aktif</option>
              <option value="completed">Selesai</option>
            </select>
            <p className="mt-1 text-sm text-neutral-500">
              Status 'Aktif' diperlukan agar peserta bisa registrasi dan scan poin
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <Button type="button" variant="outline" onClick={() => navigate('/games/events')}>
              Batal
            </Button>
            <Button type="submit" icon={Save} loading={submitting}>
              {isEdit ? 'Update Event' : 'Buat Event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default GamesEventFormPage;
