import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import visitorService from '../services/visitorService';
import faceService from '../services/faceService';
import WebcamCapture from '../components/WebcamCapture';
import SuccessScreen from '../components/SplashOverlay';

const VisitorFormPage = ({ visitorToEdit, faceVectorPreset, onSuccess, onCancel }) => {
  const isEditing = Boolean(visitorToEdit?.id);

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

  // Update faceVector saat faceVectorPreset berubah
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
    
    // Check duplicate face before setting
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
    e.preventDefault();
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

      // Save face embedding vector if captured
      if (faceVector && savedVisitor?.id) {
        try {
          await faceService.saveEmbedding(savedVisitor.id, faceVector);
          toast.success('Vektor wajah biometrik tersimpan!');
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Profile Tamu' : 'Registrasi Tamu Baru'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Isi identitas diri tamu untuk pendaftaran buku tamu digital.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <SuccessScreen
          open={splashOpen}
          type="newvisitor"
          visitorName={splashVisitorName}
          meta={{}}
          onClose={() => setSplashOpen(false)}
        />
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Muhammad Adli"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Phone & Email Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Alamat Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tamu@perusahaan.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Instansi / Perusahaan
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="PT Glosindo Jaya / Instansi Pengunjung"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Photo Upload & Preview */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Foto Tamu (Opsional)
          </label>
          <div className="flex items-center gap-4">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                No Photo
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Face Biometric Status & Webcam Capture */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Biometrik Wajah AI</p>
                <p className="text-xs text-gray-500">
                  {faceVector
                    ? '✓ Vector 128-D terlampir'
                    : 'Belum ada vector biometrik wajah terlampir.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowWebcam(!showWebcam)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-colors"
            >
              {showWebcam ? 'Tutup Kamera' : faceVector ? 'Rekam Ulang' : 'Ambil Kamera'}
            </button>
          </div>

          {showWebcam && (
            <div className="mt-4 pt-4 border-t border-blue-200/60">
              <WebcamCapture onDescriptorCapture={handleDescriptorCapture} showButton={true} />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-all"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              'Simpan Data Tamu'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorFormPage;
