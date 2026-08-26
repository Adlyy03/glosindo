import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trophy, CheckCircle, AlertCircle } from 'lucide-react';
import gamesEventService from '../../services/gamesEventService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const GamesPublicRegisterPage = () => {
  const { token } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadGroupInfo();
  }, [token]);

  const loadGroupInfo = async () => {
    setLoading(true);
    try {
      const res = await gamesEventService.getGroupInfo(token);
      setGroupInfo(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Link registrasi tidak valid');
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
    if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor HP wajib diisi';
    if (formData.phone && !/^[0-9]{10,15}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Nomor HP tidak valid';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await gamesEventService.register(token, formData);
      setRegisteredData(res.data.data);
      setSuccess(true);
      toast.success('Registrasi berhasil!');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      }
      toast.error(err.response?.data?.message || 'Gagal registrasi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Memuat informasi...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Link Tidak Valid</h2>
            <p className="text-neutral-600">
              Link registrasi tidak ditemukan atau sudah tidak aktif.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (success && registeredData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Registrasi Berhasil!</h2>
            <div className="bg-emerald-50 rounded-lg p-4 mt-6 text-left">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-neutral-600">Nama</p>
                  <p className="font-medium text-neutral-900">{registeredData.participant_name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Kelompok</p>
                  <p className="font-medium text-emerald-700">{registeredData.group_name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Event</p>
                  <p className="font-medium text-neutral-900">{registeredData.event_name}</p>
                </div>
              </div>
            </div>
            <p className="text-neutral-600 mt-6">
              Kamu sudah terdaftar! Sekarang kamu bisa scan QR poin untuk mendapatkan poin.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Registrasi Games Event</h1>
          <div className="bg-navy-50 rounded-lg p-4 mt-4">
            <p className="text-sm text-neutral-600">Event</p>
            <p className="font-semibold text-navy-900 text-lg">{groupInfo.event_name}</p>
            <p className="text-sm text-neutral-600 mt-2">Kelompok</p>
            <p className="font-semibold text-emerald-700 text-lg">{groupInfo.group_name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Nama Lengkap <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent ${
                errors.name ? 'border-danger-500' : 'border-neutral-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Nomor HP <span className="text-danger-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent ${
                errors.phone ? 'border-danger-500' : 'border-neutral-300'
              }`}
            />
            {errors.phone && <p className="mt-1 text-sm text-danger-600">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Email (Opsional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent ${
                errors.email ? 'border-danger-500' : 'border-neutral-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-danger-600">{errors.email}</p>}
          </div>

          <Button type="submit" className="w-full" loading={submitting}>
            Daftar Sekarang
          </Button>
        </form>

        <p className="text-xs text-center text-neutral-500 mt-6">
          Dengan mendaftar, kamu akan otomatis masuk ke kelompok {groupInfo.group_name}
        </p>
      </Card>
    </div>
  );
};

export default GamesPublicRegisterPage;
