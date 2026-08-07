import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import visitorService from '../services/visitorService';
import useAuthStore from '../store/authStore';
import VisitorTable from '../components/VisitorTable';
import VisitorFormPage from './VisitorFormPage';

const VisitorListPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Form Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [visitorToEdit, setVisitorToEdit] = useState(null);

  const { isAdmin } = useAuthStore();

  const loadVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await visitorService.getAll({ search, page });
      setVisitors(res.data?.data || []);
      setMeta(res.data);
    } catch (err) {
      toast.error('Gagal memuat data tamu');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const handleCreateNew = () => {
    setVisitorToEdit(null);
    setShowFormModal(true);
  };

  const handleEdit = (visitor) => {
    setVisitorToEdit(visitor);
    setShowFormModal(true);
  };

  const handleDelete = async (visitor) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data tamu "${visitor.name}"?`)) return;

    try {
      await visitorService.delete(visitor.id);
      toast.success(`Data tamu ${visitor.name} berhasil dihapus`);
      loadVisitors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus data tamu');
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setVisitorToEdit(null);
    loadVisitors();
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Data Master Tamu</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data direktori pengunjung dan profil biometrik wajah.</p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          + Tambah Tamu Baru
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Cari berdasarkan nama, email, nomor HP, atau perusahaan..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <VisitorTable
          visitors={visitors}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={isAdmin()}
        />

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-500">
              Menampilkan {meta.from}–{meta.to} dari total {meta.total} tamu
            </p>
            <div className="flex gap-1">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    p === meta.current_page
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Form Overlay */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <VisitorFormPage
              visitorToEdit={visitorToEdit}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowFormModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorListPage;
