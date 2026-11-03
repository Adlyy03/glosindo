import React, { useEffect, useState } from 'react';
import { Eye, User } from 'lucide-react';
import visitorService from '../../services/visitorService';
import VisitorDetailModal from '../../components/VisitorDetailModal';
import { getStorageUrl } from '../../services/api';

const ReceptionistVisitorPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [visitorToView, setVisitorToView] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await visitorService.getAll({ page: 1 });
        setVisitors(response.data?.data || []);
      } catch (err) {
        setError('Gagal memuat data tamu.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleView = (visitor) => {
    setVisitorToView(visitor);
    setShowDetailModal(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Data Tamu</h1>
        <p className="mt-2 text-sm text-gray-600">Lihat daftar tamu dan rincian profil yang terdaftar untuk kegiatan check-in harian.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Tamu</h2>
          <span className="text-xs font-semibold text-gray-500">Total: {visitors.length} Tamu</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Memuat daftar tamu...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : visitors.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">Belum ada data tamu.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visitors.map((visitor) => (
              <div
                key={visitor.id}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors gap-3"
              >
                <div
                  onClick={() => handleView(visitor)}
                  className="flex items-center gap-3.5 cursor-pointer min-w-0"
                >
                  {visitor.photo ? (
                    <img
                      src={getStorageUrl(visitor.photo)}
                      alt={visitor.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 ${
                      visitor.photo ? 'hidden' : 'flex'
                    }`}
                  >
                    {visitor.name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                      {visitor.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {visitor.company || 'Pribadi'} · {visitor.phone || visitor.email || 'Tanpa kontak'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      visitor.face_embedding
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {visitor.face_embedding ? 'Biometrik Aktif' : 'Belum Wajah'}
                  </span>
                  <button
                    onClick={() => handleView(visitor)}
                    className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Lihat Detail Tamu"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visitor Detail Modal */}
      <VisitorDetailModal
        isOpen={showDetailModal}
        visitorId={visitorToView?.id}
        initialVisitor={visitorToView}
        onClose={() => {
          setShowDetailModal(false);
          setVisitorToView(null);
        }}
      />
    </div>
  );
};

export default ReceptionistVisitorPage;
