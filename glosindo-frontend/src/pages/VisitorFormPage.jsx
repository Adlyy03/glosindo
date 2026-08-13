import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Building, Camera, CheckCircle2, AlertCircle, X, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import visitorService from '../services/visitorService';
import faceService from '../services/faceService';
import WebcamCapture from '../components/WebcamCapture';
import SuccessScreen from '../components/SplashOverlay';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const VisitorFormPage = ({ visitorToEdit, faceVectorPreset, onSuccess, onCancel }) => {
  const isEditing = Boolean(visitorToEdit?.id);

  const [currentStep, setCurrentStep] = useState(1);

  const [name, setName] = useState(visitorToEdit?.name || '');
  const [phone, setPhone] = useState(visitorToEdit?.phone || '');
  const [email, setEmail] = useState(visitorToEdit?.email || '');
  const [company, setCompany] = useState(visitorToEdit?.company || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [faceVector, setFaceVector] = useState(faceVectorPreset || null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [splashOpen, setSplashOpen] = useState(false);
  const [splashVisitorName, setSplashVisitorName] = useState('');

  // Update faceVector saat faceVectorPreset berubah — PRESERVED LOGIC
  useEffect(() => {
    setFaceVector(faceVectorPreset || null);
  }, [faceVectorPreset]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDescriptorCapture = async (descriptor) => {
    const vectorArray = Array.from(descriptor);
    
    // Check duplicate face before setting — PRESERVED LOGIC
    try {
      const result = await faceService.checkDuplicate(vectorArray);
      
      if (result.duplicate) {
        const existingVisitor = result.visitor;
        toast.error(
          `Wajah sudah terdaftar atas nama: ${existingVisitor.name}${existingVisitor.company ? ` (${existingVisitor.company})` : ''}`,
          { duration: 5000 }
        );
        setShowWebcam(false);
        return;
      }
      
      setFaceVector(vectorArray);
      setShowWebcam(false);
      toast.success('Descriptor biometrik wajah berhasil ditangkap!');
    } catch (err) {
      console.error('Duplicate check error:', err);
      toast.error('Gagal memeriksa duplikasi wajah. Coba lagi.');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama tamu wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (phone) formData.append('phone', phone.trim());
      if (email) formData.append('email', email.trim());
      if (company) formData.append('company', company.trim());
      if (photoFile) formData.append('photo', photoFile);
      if (faceVector && Array.isArray(faceVector) && faceVector.length === 128) {
        faceVector.forEach((value) => {
          formData.append('face_vector[]', value);
        });
      }

      let savedVisitor;
      if (isEditing) {
        const res = await visitorService.update(visitorToEdit.id, formData);
        savedVisitor = res.data;
        toast.success(`Data tamu ${name} berhasil diperbarui`);
      } else {
        const res = await visitorService.create(formData);
        savedVisitor = res.data;
        toast.success(`Tamu baru ${name} berhasil terdaftar`);
        setSplashVisitorName(name);
        setSplashOpen(true);
      }

      // Save face embedding vector if captured — PRESERVED LOGIC
      if (faceVector && savedVisitor?.id) {
        try {
          await faceService.saveEmbedding(savedVisitor.id, faceVector);
          toast.success('Vektor biometrik wajah tersimpan!');
        } catch (embedErr) {
          console.error('Failed saving face vector:', embedErr);
          toast.error('Tamu tersimpan, namun vektor biometrik wajah gagal tersimpan.');
        }
      }

      onSuccess?.(savedVisitor);
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.name?.[0] || 'Gagal menyimpan data tamu';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card padding="p-6 md:p-8" className="max-w-3xl mx-auto border-2 border-slate-200/90 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              {isEditing ? 'Edit Profil Tamu' : 'Form Registrasi Tamu Baru'}
            </h2>
            <Badge variant="cyan">Registrasi Kiosk</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Lengkapi data identitas dan rekaman biometrik wajah tamu.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Multi-Step Indicator Bar */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2.5 cursor-pointer select-none ${
            currentStep >= 1 ? 'text-brand-navy font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold transition-colors ${
              currentStep === 1
                ? 'bg-brand-navy text-white shadow-md'
                : currentStep > 1
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            1
          </div>
          <span className="text-xs md:text-sm hidden sm:inline">Data Diri</span>
        </div>

        <div className="flex-1 h-0.5 bg-slate-200 mx-3" />

        <div
          onClick={() => name.trim() && setCurrentStep(2)}
          className={`flex items-center gap-2.5 cursor-pointer select-none ${
            currentStep >= 2 ? 'text-brand-navy font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold transition-colors ${
              currentStep === 2
                ? 'bg-brand-navy text-white shadow-md'
                : currentStep > 2
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            2
          </div>
          <span className="text-xs md:text-sm hidden sm:inline">Biometrik Wajah</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SuccessScreen
          open={splashOpen}
          type="newvisitor"
          visitorName={splashVisitorName}
          meta={{}}
          onClose={() => setSplashOpen(false)}
        />

        {/* STEP 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Adli"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan bg-slate-50/50"
                />
              </div>
            </div>

            {/* Phone & Email Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Nomor Telepon / WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tamu@perusahaan.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Instansi / Perusahaan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="PT Glosindo Jaya / Instansi Pengunjung"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan bg-slate-50/50"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (!name.trim()) {
                    toast.error('Nama tamu wajib diisi terlebih dahulu');
                    return;
                  }
                  setCurrentStep(2);
                }}
                icon={ArrowRight}
              >
                Lanjut ke Biometrik Wajah
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Biometric & Photo */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Photo Upload & Preview */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Foto Profil Tamu (Opsional)
              </label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-cyan shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-medium">
                    No Photo
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-navy/10 file:text-brand-navy hover:file:bg-brand-navy/20 cursor-pointer"
                />
              </div>
            </div>

            {/* Face Biometric Camera Component */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-navy text-white flex items-center justify-center flex-shrink-0">
                    <Camera className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Rekam AI Biometrik Wajah</h4>
                    <p className="text-xs text-slate-500">
                      {faceVector
                        ? '✓ Vector 128-D biometrik berhasil direkam'
                        : 'Belum ada rekaman biometrik terlampir.'}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant={showWebcam ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => setShowWebcam(!showWebcam)}
                >
                  {showWebcam ? 'Tutup Kamera' : faceVector ? 'Rekam Ulang' : 'Buka Kamera'}
                </Button>
              </div>

              {showWebcam && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <WebcamCapture onDescriptorCapture={handleDescriptorCapture} showButton={true} />
                </div>
              )}
            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(1)}
                icon={ArrowLeft}
              >
                Kembali
              </Button>

              <Button
                type="submit"
                variant="emerald"
                size="lg"
                loading={submitting}
                icon={CheckCircle2}
              >
                Simpan Data Tamu
              </Button>
            </div>
          </div>
        )}
      </form>
    </Card>
  );
};

export default VisitorFormPage;
