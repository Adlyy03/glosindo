import { useState, useEffect } from 'react';
import { BookUser, Camera, ArrowLeft, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import FaceScanner from '../components/FaceScanner';
import Button from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const GuestVisitPage = () => {
  const [searchParams] = useSearchParams();
  const isKioskMode = searchParams.get('kiosk') === 'true';
  
  const [step, setStep] = useState('idle'); // idle | scanning | form-new | form-existing | success
  const [visitor, setVisitor] = useState(null); // matched visitor or null for new
  const [faceDescriptor, setFaceDescriptor] = useState(null); // Store face descriptor for new visitor
  const [formData, setFormData] = useState({
    purpose: '',
    name: '',
    phone: '',
    meet_person: '',
  });

  // Reset scanner after success
  const handleReset = () => {
    setStep('idle');
    setVisitor(null);
    setFaceDescriptor(null);
    setFormData({ purpose: '', name: '', phone: '', meet_person: '' });
  };

  // Start scanning when button clicked
  const handleStartScan = () => {
    setStep('scanning');
  };

  // Face matched = existing visitor
  const handleMatchFound = (matchedVisitor) => {
    setVisitor(matchedVisitor);
    setFaceDescriptor(null);
    setStep('form-existing');
  };

  // No match = new visitor, store descriptor
  const handleNoMatch = (descriptor) => {
    setVisitor(null);
    setFaceDescriptor(descriptor); // Save descriptor for later
    setStep('form-new');
  };

  // Submit new visitor
  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!formData.purpose || !formData.name || !formData.phone) {
      toast.error('Harap lengkapi semua data');
      return;
    }

    try {
      const response = await api.post('/public/guest-visit', {
        name: formData.name,
        phone: formData.phone,
        purpose: formData.purpose,
        face_descriptor: faceDescriptor, // Send face descriptor
      });

      // If face descriptor exists, save to face_embeddings
      if (faceDescriptor && response.data.data.visitor) {
        const visitorId = response.data.data.visitor.id;
        try {
          await api.post(`/visitors/${visitorId}/face-embedding`, {
            face_vector: faceDescriptor,
          });
        } catch (embError) {
          console.error('Face embedding save failed:', embError);
          // Continue anyway - visit was saved
        }
      }

      setStep('success');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  // Submit existing visitor check-in
  const handleSubmitExisting = async (e) => {
    e.preventDefault();
    if (!formData.purpose) {
      toast.error('Tujuan kunjungan wajib diisi');
      return;
    }

    try {
      await api.post('/public/guest-visit', {
        visitor_id: visitor.id || visitor.visitor_id,
        purpose: formData.purpose,
        meet_to: formData.meet_person || null,
      });
      setStep('success');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal check-in');
    }
  };

  // IDLE - Full screen button
  if (step === 'idle') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-brand-navy via-slate-800 to-brand-navy flex flex-col items-center justify-center p-8 animate-fadeIn">
        <div className="text-center space-y-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto shadow-2xl">
            <BookUser className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Kunjungan Tamu
          </h1>
          <Button
            variant="primary"
            size="xl"
            icon={Camera}
            onClick={handleStartScan}
            className="px-10 sm:px-12 py-5 sm:py-6 text-lg sm:text-xl font-bold shadow-2xl hover:scale-105 transition-transform"
          >
            Buku Tamu
          </Button>
        </div>
      </div>
    );
  }

  // SCANNING - Full screen camera
  if (step === 'scanning') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col overflow-hidden animate-fadeIn">
        {/* Minimal Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <span className="text-white font-bold text-xs sm:text-sm">Pemindaian Wajah</span>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={handleReset}
            className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm text-xs sm:text-sm px-3 py-1.5"
          >
            <span className="hidden sm:inline">Kembali</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Camera Full Screen */}
        <div className="flex-1 w-full h-full">
          <FaceScanner
            onMatchFound={handleMatchFound}
            onNoMatch={handleNoMatch}
            silentMode={false}
            fullscreen={true}
          />
        </div>
      </div>
    );
  }

  // FORM NEW VISITOR
  if (step === 'form-new') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
        <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 space-y-5 my-auto transform transition-all duration-300 scale-100">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Selamat Datang</h2>
          </div>

          <form onSubmit={handleSubmitNew} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nama Anda"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan text-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                No. Telepon <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan text-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tujuan Kunjungan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Keperluan Anda"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan text-slate-900 transition-all"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleReset}
                className="transition-all"
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="lg" fullWidth className="transition-all">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // FORM EXISTING VISITOR
  if (step === 'form-existing') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
        <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 space-y-5 my-auto transform transition-all duration-300 scale-100">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Selamat Datang Kembali</h2>
            <p className="text-slate-800 text-xl sm:text-2xl font-bold mt-2">{visitor?.name}</p>
          </div>

          <form onSubmit={handleSubmitExisting} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tujuan Kunjungan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Keperluan Anda"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan text-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ketemu Siapa? <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Nama atau divisi"
                value={formData.meet_person}
                onChange={(e) => setFormData({ ...formData, meet_person: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan text-slate-900 transition-all"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleReset}
                className="transition-all"
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="lg" fullWidth className="transition-all">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // SUCCESS - Alert modal
  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 flex flex-col items-center justify-center p-6 sm:p-8 animate-fadeIn">
        <div className="text-center space-y-6 max-w-md transform transition-all duration-300 scale-100">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2.5} />
          </div>
          <div className="px-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Selamat Datang!
            </h2>
            <p className="text-white text-2xl sm:text-3xl font-bold mt-3">
              {visitor ? visitor.name : formData.name}
            </p>
          </div>
          <Button
            variant="secondary"
            size="xl"
            icon={ArrowLeft}
            onClick={handleReset}
            className="px-10 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-2xl bg-slate-800 text-white hover:bg-slate-900 border-2 border-slate-800 transition-all"
          >
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default GuestVisitPage;
