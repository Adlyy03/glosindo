import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  CalendarRange,
  Clock,
  MapPin,
  Building2,
  User,
  Phone,
  Mail,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock
} from 'lucide-react';
import eventService from '../services/eventService';
import { LOGO, APP_NAME } from '../constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const PublicEventRegisterPage = () => {
  const { code } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setErrorStatus(null);
      setErrorMessage('');
      try {
        const res = await eventService.getPublicEvent(code);
        setEvent(res.data?.data);
      } catch (err) {
        const data = err.response?.data;
        const statusCode = data?.status_code || 'ERROR';
        const msg = data?.message || 'Gagal memuat informasi event.';
        setErrorStatus(statusCode);
        setErrorMessage(msg);
        if (data?.data) {
          setEvent(data.data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchEvent();
    }
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    if (!phone.trim()) {
      toast.error('Nomor WhatsApp / HP wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        company: company.trim() || null,
        position: position.trim() || null,
      };

      const res = await eventService.registerPublic(code, payload);
      setSuccessData(res.data?.data);
      setIsSuccess(true);
      toast.success('Pendaftaran event berhasil!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal melakukan pendaftaran event.';
      toast.error(msg, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan bg-slate-50/60 transition-all placeholder:text-slate-400';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5';

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-slate-800 font-bold text-base">Memuat Informasi Event...</h2>
          <p className="text-slate-400 text-xs mt-1">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // Error / Closed / Cancelled Screen
  if (errorStatus && !isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50/40 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {errorStatus === 'NOT_FOUND' && 'Event Tidak Ditemukan'}
              {errorStatus === 'EVENT_CANCELLED' && 'Event Dibatalkan'}
              {errorStatus === 'REGISTRATION_NOT_OPEN' && 'Pendaftaran Belum Dibuka'}
              {errorStatus === 'REGISTRATION_CLOSED' && 'Pendaftaran Sudah Ditutup'}
              {errorStatus === 'ERROR' && 'Pendaftaran Tidak Tersedia'}
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{errorMessage}</p>
          </div>

          {event && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-left text-xs space-y-1.5 text-slate-600 font-medium">
              <p className="font-bold text-slate-900 text-sm">{event.name}</p>
              {event.start_date && (
                <p className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  Tanggal: {dayjs(event.start_date).format('DD MMMM YYYY')}
                </p>
              )}
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors w-full"
            >
              Kembali ke Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success Screen
  if (isSuccess && successData) {
    const { participant, event: regEvent } = successData;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50/40 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-lg w-full bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-2xl space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Pendaftaran Berhasil!
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Data Anda telah terdaftar sebagai peserta resmi. Silakan simpan bukti pendaftaran ini.
            </p>
          </div>

          {/* Registration Card */}
          <div className="bg-gradient-to-br from-brand-navy to-blue-900 rounded-2xl p-5 text-white shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  Event
                </span>
                <h3 className="text-base font-extrabold text-white leading-snug">
                  {regEvent?.name || event?.name}
                </h3>
              </div>
              <Badge variant="emerald" className="text-[10px] uppercase font-bold">
                Terdaftar
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-slate-300 font-semibold uppercase">Nama Peserta</p>
                <p className="font-bold text-white mt-0.5">{participant?.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-300 font-semibold uppercase">Nomor HP</p>
                <p className="font-bold text-white mt-0.5">{participant?.phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-300 font-semibold uppercase">Perusahaan / Instansi</p>
                <p className="font-bold text-white mt-0.5">{participant?.company || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-300 font-semibold uppercase">Jabatan</p>
                <p className="font-bold text-white mt-0.5">{participant?.position || '-'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-cyan-300" />
                {regEvent?.start_date ? dayjs(regEvent.start_date).format('DD MMM YYYY') : '-'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-300" />
                {regEvent?.start_time?.slice(0, 5)} - {regEvent?.end_time?.slice(0, 5)} WIB
              </span>
            </div>
          </div>

          {/* Instruction */}
          <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Saat tiba di lokasi pada hari H, sebutkan nama atau nomor telepon Anda ke resepsionis untuk melakukan proses check-in kehadiran.
            </p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => {
                setIsSuccess(false);
                setName('');
                setPhone('');
                setEmail('');
                setCompany('');
                setPosition('');
              }}
              className="text-xs font-bold text-brand-navy hover:underline"
            >
              Daftarkan Peserta Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Registration Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50/40 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6 animate-fadeIn">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs mb-1">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            <span className="text-xs font-bold text-slate-700">Registrasi Tamu & Peserta Event</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Form Pendaftaran Event
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Isi formulir berikut untuk mendaftar sebagai peserta resmi kegiatan ini.
          </p>
        </div>

        {/* Event Info Card */}
        {event && (
          <div className="bg-gradient-to-r from-brand-navy to-blue-900 rounded-3xl p-6 text-white shadow-lg space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-1">
                  Event Terpilih
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">{event.name}</h2>
              </div>
              <Badge variant="emerald" dot className="text-xs font-bold">
                Pendaftaran Dibuka
              </Badge>
            </div>

            {event.description && (
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                {event.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-300 uppercase">Tanggal</p>
                  <p className="font-bold text-white">
                    {dayjs(event.start_date).format('DD MMM YYYY')}
                    {event.end_date && event.end_date !== event.start_date && (
                      <span> - {dayjs(event.end_date).format('DD MMM YYYY')}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-300 uppercase">Waktu</p>
                  <p className="font-bold text-white">
                    {event.start_time?.slice(0, 5)} - {event.end_time?.slice(0, 5)} WIB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-300 uppercase">Lokasi</p>
                  <p className="font-bold text-white truncate max-w-[140px]">
                    {event.location || 'Di Lokasi Perusahaan'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Event Name (Locked) */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Nama Event (Otomatis)
                </span>
              </label>
              <input
                type="text"
                value={event?.name || ''}
                readOnly
                disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 bg-slate-100 cursor-not-allowed"
              />
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Nama Lengkap <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className={inputClass}
                required
              />
            </div>

            {/* Nomor HP & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Nomor WhatsApp / HP <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email (Opsional)
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: budi@company.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Perusahaan & Jabatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Perusahaan / Instansi
                  </span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Contoh: PT ABC Indonesia"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Jabatan / Posisi
                  </span>
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Manager Operasional"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={submitting}
                icon={ArrowRight}
                className="py-3.5 font-extrabold text-sm"
              >
                Daftar Sebagai Peserta Event
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} {APP_NAME}. Sistem Registrasi Tamu & Event Terintegrasi.
        </div>
      </div>
    </div>
  );
};

export default PublicEventRegisterPage;
