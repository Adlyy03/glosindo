import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Camera,
  User, Building2, Phone, Mail, Briefcase, RefreshCw, Sparkles,
  ArrowRight, ShieldCheck, UserCheck, XCircle, Info, CalendarRange
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import eventService from '../services/eventService';
import useFaceModels from '../hooks/useFaceModels';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { APP_NAME, LOGO } from '../constants';

dayjs.locale('id');

const PublicEventRegisterPage = () => {
  const { code } = useParams();

  // Event fetching states
  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [eventError, setEventError] = useState(null);

  // AI Face Model hook
  const { modelsLoaded, loading: modelsLoading, error: modelsError } = useFaceModels();

  // Face Scan & Match states
  // Steps: 'scan' | 'verifying' | 'already_registered' | 'form' | 'success'
  const [step, setStep] = useState('scan');
  const [scanningFace, setScanningFace] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [faceVector, setFaceVector] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [matchedVisitor, setMatchedVisitor] = useState(null);
  const [existingParticipant, setExistingParticipant] = useState(null);

  // Form input states
  const [visitorId, setVisitorId] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Registration success result
  const [registeredData, setRegisteredData] = useState(null);

  const webcamRef = useRef(null);

  // 1. Fetch Event Info
  const fetchEventInfo = async () => {
    setLoadingEvent(true);
    setEventError(null);
    try {
      const res = await eventService.getPublicEvent(code);
      setEvent(res.data.data);
    } catch (err) {
      const resp = err.response?.data;
      setEventError({
        statusCode: resp?.status_code || 'ERROR',
        message: resp?.message || 'Gagal memuat informasi event.',
        data: resp?.data,
      });
    } finally {
      setLoadingEvent(false);
    }
  };

  useEffect(() => {
    if (code) {
      fetchEventInfo();
    }
  }, [code]);

  // 2. Perform Face Scan and Backend Cross-Check
  const handleCaptureAndScan = async () => {
    if (!webcamRef.current) return;
    setScanningFace(true);

    try {
      // Wait for video ready with retry
      const video = webcamRef.current.video;
      if (!video) {
        throw new Error('Kamera belum siap. Mohon tunggu sebentar.');
      }

      // Retry up to 3 times with 500ms delay if video not ready
      let retries = 3;
      while (video.readyState !== 4 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retries--;
      }

      if (video.readyState !== 4) {
        throw new Error('Kamera belum siap. Refresh halaman dan coba lagi.');
      }

      if (!modelsLoaded) {
        throw new Error('Model AI wajah belum siap. Harap tunggu sebentar.');
      }

      // Add small delay to ensure frame capture
      await new Promise(resolve => setTimeout(resolve, 100));

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error('Gagal mengambil gambar. Pastikan kamera memiliki izin akses dan preview terlihat.');
      }

      setPhotoPreview(imageSrc);

      // Detect Face & compute 128-d descriptor
      const detection = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection || !detection.descriptor) {
        toast.error('Wajah tidak terdeteksi! Posisikan wajah tepat di depan kamera dengan pencahayaan cukup.');
        setScanningFace(false);
        return;
      }

      const vectorArray = Array.from(detection.descriptor);
      setFaceVector(vectorArray);

      // Step 2: Cross-check with database via Backend
      setStep('verifying');

      const checkRes = await eventService.checkFace(code, vectorArray);
      const resData = checkRes.data;

      if (resData.status === 'already_registered') {
        // Visitor already registered for this event
        setMatchedVisitor(resData.visitor);
        setExistingParticipant(resData.participant);
        setStep('already_registered');
        toast.error('Anda sudah terdaftar pada event ini!', { icon: '⚠️' });
      } else if (resData.status === 'found') {
        // Visitor found in database, but not yet participant
        const v = resData.visitor;
        setMatchedVisitor(v);
        setVisitorId(v.id);
        setName(v.name || '');
        setPhone(v.phone || '');
        setEmail(v.email || '');
        setCompany(v.company || '');
        setPosition(v.position || '');
        setStep('form');
        toast.success(`Wajah terdeteksi! Selamat datang kembali, ${v.name}.`, { icon: '👤' });
      } else {
        // New visitor (not found in database)
        setMatchedVisitor(null);
        setVisitorId(null);
        setStep('form');
        toast('Wajah terdeteksi. Silakan lengkapi form pendaftaran baru.', { icon: '📝' });
      }
    } catch (err) {
      console.error('Scan error:', err);
      toast.error(err.response?.data?.message || err.message || 'Gagal memproses pemindaian wajah');
      setStep('scan');
    } finally {
      setScanningFace(false);
    }
  };

  const handleResetScan = () => {
    setFaceVector(null);
    setPhotoPreview(null);
    setMatchedVisitor(null);
    setExistingParticipant(null);
    setVisitorId(null);
    setName('');
    setPhone('');
    setEmail('');
    setCompany('');
    setPosition('');
    setStep('scan');
  };

  // 3. Handle Submit Registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!faceVector) {
      toast.error('Wajib melakukan scan wajah terlebih dahulu');
      setStep('scan');
      return;
    }

    if (!name.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    if (!phone.trim()) {
      toast.error('Nomor HP / WhatsApp wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        visitor_id: visitorId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        company: company.trim() || null,
        position: position.trim() || null,
        face_vector: faceVector,
        photo: photoPreview,
      };

      const res = await eventService.registerPublic(code, payload);
      setRegisteredData(res.data.data);
      setStep('success');
      toast.success('Pendaftaran event berhasil!', { icon: '🎉' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mendaftar ke event';
      if (err.response?.data?.duplicate) {
        toast.error('Anda sudah terdaftar sebagai peserta pada event ini!');
        setStep('already_registered');
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Loading & Error States for Event
  // -------------------------------------------------------------
  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Memeriksa tautan pendaftaran event...</p>
        </div>
      </div>
    );
  }

  if (eventError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card padding="p-8" className="max-w-md w-full text-center space-y-5 border-rose-200">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {eventError.statusCode === 'NOT_FOUND' && 'Event Tidak Ditemukan'}
              {eventError.statusCode === 'EVENT_CANCELLED' && 'Event Dibatalkan'}
              {eventError.statusCode === 'REGISTRATION_NOT_OPEN' && 'Pendaftaran Belum Dibuka'}
              {eventError.statusCode === 'REGISTRATION_CLOSED' && 'Pendaftaran Ditutup'}
              {!['NOT_FOUND', 'EVENT_CANCELLED', 'REGISTRATION_NOT_OPEN', 'REGISTRATION_CLOSED'].includes(eventError.statusCode) && 'Pemberitahuan Event'}
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{eventError.message}</p>
          </div>
          <Button variant="outline" fullWidth onClick={fetchEventInfo} icon={RefreshCw}>
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Main Registration Interface
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs mb-2">
            <img src={LOGO} alt={APP_NAME} className="h-4 w-auto" />
            <span className="text-xs font-black text-brand-navy tracking-tight">{APP_NAME}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Registrasi Peserta Event
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Pindai wajah Anda untuk verifikasi biometrik dan kelengkapan data tamu acara perusahaan.
          </p>
        </div>

        {/* Event Detail Summary Card */}
        {event && (
          <Card padding="p-5" className="bg-gradient-to-r from-brand-navy via-slate-900 to-indigo-950 text-white border-none shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="cyan" dot>Event Terbuka</Badge>
                  {event.code && (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-cyan-200">
                      Code: {event.code}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold truncate text-white">{event.name}</h2>
                <p className="text-xs text-slate-300 line-clamp-2">{event.description || 'Acara Perusahaan PT GLOSINDO'}</p>
              </div>

              <div className="space-y-1 text-xs text-slate-200 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {dayjs(event.start_date).format('DD MMMM YYYY')}
                    {event.end_date && event.end_date !== event.start_date && ` – ${dayjs(event.end_date).format('DD MMM YYYY')}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{event.start_time?.slice(0, 5)} – {event.end_time?.slice(0, 5)} WIB</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate max-w-[160px]">{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* ─── STEP 1: SCAN WAJAH ─── */}
        {step === 'scan' && (
          <Card padding="p-6 md:p-8" className="space-y-6">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                Langkah 1: Pemindaian Wajah (Face Biometric)
              </div>
              <h3 className="text-lg font-bold text-slate-900">Posisikan Wajah di Depan Kamera</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Sistem akan mencocokkan biometrik Anda ke database untuk mengenali profil Anda secara otomatis.
              </p>
            </div>

            {/* Camera Viewport with Oval Guide */}
            <div className="relative max-w-sm mx-auto overflow-hidden rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-xl aspect-[4/3] flex items-center justify-center">
              {modelsLoading ? (
                <div className="p-6 text-center text-white space-y-3">
                  <div className="w-10 h-10 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold">Memuat model AI deteksi wajah...</p>
                </div>
              ) : modelsError ? (
                <div className="p-6 text-center text-rose-300 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
                  <p className="text-xs font-bold">Model AI Wajah Gagal Dimuat</p>
                  <p className="text-[11px] text-slate-400">{modelsError}</p>
                </div>
              ) : (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: 'user',
                      width: 640,
                      height: 480,
                    }}
                    onUserMedia={() => setVideoReady(true)}
                    onUserMediaError={() => setVideoReady(false)}
                    className="w-full h-full object-cover transform -scale-x-100"
                  />

                  {/* Face Guide Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-60 border-2 border-dashed border-cyan-400/80 rounded-[45%] animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
                  </div>

                  {/* Scan Badge */}
                  <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-[11px] font-semibold text-cyan-300 border border-cyan-500/30">
                      Pastikan wajah berada dalam bingkai
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="max-w-sm mx-auto">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={Camera}
                loading={scanningFace || modelsLoading}
                disabled={modelsLoading || !videoReady || !modelsLoaded || Boolean(modelsError)}
                onClick={handleCaptureAndScan}
                className="bg-brand-navy hover:bg-slate-800 text-white font-black shadow-md text-sm py-3.5"
              >
                {scanningFace ? 'Menganalisis Biometrik...' : !videoReady ? 'Memuat Kamera...' : 'Pindai & Verifikasi Wajah'}
              </Button>
            </div>
          </Card>
        )}

        {/* ─── STEP 2: VERIFYING ─── */}
        {step === 'verifying' && (
          <Card padding="p-12" className="text-center space-y-4">
            <div className="w-14 h-14 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Memverifikasi Data Biometrik...</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Mencocokkan vektor wajah dengan database tamu dan memeriksa status partisipasi event.
            </p>
          </Card>
        )}

        {/* ─── CASE: ALREADY REGISTERED ─── */}
        {step === 'already_registered' && (
          <Card padding="p-8" className="text-center space-y-6 border-amber-200">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <UserCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="amber" dot>Status Terdaftar</Badge>
              <h3 className="text-xl font-extrabold text-slate-900">
                Anda Sudah Terdaftar Pada Event Ini
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Data Anda telah tercatat sebagai peserta resmi untuk acara{' '}
                <strong className="text-slate-900">{event?.name}</strong>. Anda tidak perlu mendaftar ulang.
              </p>
            </div>

            {/* Profile Snapshot */}
            {matchedVisitor && (
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Face" className="w-12 h-12 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-brand-navy text-white flex items-center justify-center font-bold">
                      {matchedVisitor.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{matchedVisitor.name}</p>
                    <p className="text-slate-500">{matchedVisitor.company || 'Pribadi'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor Telepon</span>
                    <span className="font-semibold">{matchedVisitor.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span className="font-semibold">{matchedVisitor.email || '—'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleResetScan} icon={RefreshCw}>
                Scan Wajah Lain
              </Button>
            </div>
          </Card>
        )}

        {/* ─── STEP 3: FORM REGISTRASI ─── */}
        {step === 'form' && (
          <Card padding="p-6 md:p-8" className="space-y-6">
            {/* Notification based on match state */}
            {matchedVisitor ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500 text-white flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-900">
                    Wajah Teridentifikasi! Data Ditemukan.
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                    Sistem mendeteksi profil <strong>{matchedVisitor.name}</strong>. Periksa data Anda di bawah dan klik konfirmasi untuk mendaftar event.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-600 text-white flex-shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-cyan-900">
                    Data Wajah Baru Terdeteksi
                  </p>
                  <p className="text-[11px] text-cyan-700 mt-0.5 leading-relaxed">
                    Biometrik wajah Anda berhasil dipindai. Silakan lengkapi formulir pendaftaran peserta baru berikut.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo Preview Thumbnail & Re-scan Button */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Captured Face"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
                    />
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900">Biometrik Wajah Terverifikasi</p>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 128-D Embedding Siap
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetScan}
                  icon={RefreshCw}
                  className="text-xs"
                >
                  Ulangi Scan
                </Button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda..."
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Alamat Email (Opsional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@perusahaan.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Instansi / Perusahaan (Opsional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="PT Nama Perusahaan / Umum"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jabatan / Posisi (Opsional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Contoh: Manager / Direktur / Staff"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={submitting}
                  icon={ArrowRight}
                  className="bg-brand-navy hover:bg-slate-800 text-white font-extrabold text-sm py-3.5 shadow-md"
                >
                  {submitting ? 'Memproses Pendaftaran...' : 'Konfirmasi & Daftar Peserta Event'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* ─── STEP 4: SUCCESS CONFIRMATION ─── */}
        {step === 'success' && registeredData && (
          <Card padding="p-8" className="space-y-6 border-emerald-200 text-center animate-scaleIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <Badge variant="emerald" dot>Pendaftaran Diterima</Badge>
              <h2 className="text-2xl font-black text-slate-900">Registrasi Berhasil!</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Terima kasih telah mendaftar. Data Anda telah tercatat sebagai peserta acara.
              </p>
            </div>

            {/* Registration Ticket Card */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-left space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Registrasi</p>
                  <p className="text-base font-mono font-extrabold text-brand-navy">
                    REG-EVT-{registeredData.registration_id}
                  </p>
                </div>
                <Badge variant="navy">Official Pass</Badge>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Peserta:</span>
                  <span className="font-bold text-slate-900">{registeredData.participant?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Event:</span>
                  <span className="font-bold text-brand-cyan truncate max-w-[200px]">{registeredData.event?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu Acara:</span>
                  <span className="font-medium">
                    {dayjs(registeredData.event?.start_date).format('DD MMM YYYY')} ({registeredData.event?.start_time?.slice(0, 5)} WIB)
                  </span>
                </div>
                {registeredData.event?.location && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lokasi:</span>
                    <span className="font-medium truncate max-w-[180px]">{registeredData.event?.location}</span>
                  </div>
                )}
                {registeredData.participant?.company && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Instansi:</span>
                    <span className="font-medium">{registeredData.participant?.company}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 text-center">
                <p className="text-[11px] text-slate-500">
                  Saat hari H, Anda dapat langsung melakukan <strong>Check-In melalui Express Face Scan</strong> di resepsionis.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="outline" onClick={handleResetScan} icon={RefreshCw}>
                Daftarkan Peserta Lain
              </Button>
            </div>
          </Card>
        )}

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-400">
          Sistem Buku Tamu & Registrasi Event Digital &copy; {new Date().getFullYear()} {APP_NAME}. Dilindungi Enkripsi Biometrik.
        </p>
      </div>
    </div>
  );
};

export default PublicEventRegisterPage;
