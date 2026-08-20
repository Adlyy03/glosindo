import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Users, UserPlus, Search, RefreshCw, ChevronLeft, ChevronRight, CalendarRange, UserCheck } from 'lucide-react';
import visitorService from '../services/visitorService';
import useAuthStore from '../store/authStore';
import VisitorTable from '../components/VisitorTable';
import VisitorFormPage from './VisitorFormPage';
import ConfirmModal from '../components/ConfirmModal';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const VisitorListPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '' | 'regular' | 'event'
  const [page, setPage] = useState(1);

  // Form Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [visitorToEdit, setVisitorToEdit] = useState(null);
  
  // Confirm Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [visitorToDelete, setVisitorToDelete] = useState(null);

  const { isAdmin, user } = useAuthStore();
  const isSupervisor = user?.role === 'supervisor';

  const loadVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, page };
      if (typeFilter) params.type = typeFilter;
      const res = await visitorService.getAll(params);
      setVisitors(res.data?.data || []);
      setMeta(res.data);
    } catch {
      toast.error('Gagal memuat data tamu');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page]);

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
    setVisitorToDelete(visitor);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!visitorToDelete) return;

    try {
      await visitorService.delete(visitorToDelete.id);
      toast.success(`Data tamu ${visitorToDelete.name} berhasil dihapus`);
      loadVisitors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus data tamu');
    } finally {
      setVisitorToDelete(null);
      setShowConfirmModal(false);
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setVisitorToEdit(null);
    loadVisitors();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Data Direktori Tamu
            </h1>
            <Badge variant="navy">Master Database</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola profil lengkap seluruh tamu terdaftar, tamu biasa kantor, dan tamu/peserta event.
          </p>
        </div>

        {!isSupervisor && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreateNew}
            icon={UserPlus}
          >
            Daftar Tamu Baru
          </Button>
        )}
      </div>

      {/* Tabs Filter & Search Input Card */}
      <Card padding="p-4 md:p-5" className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 flex-wrap">
          <button
            onClick={() => { setTypeFilter(''); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              typeFilter === ''
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Semua Tamu
          </button>

          <button
            onClick={() => { setTypeFilter('regular'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              typeFilter === 'regular'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Tamu Biasa (Kantor)
          </button>

          <button
            onClick={() => { setTypeFilter('event'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              typeFilter === 'event'
                ? 'bg-brand-cyan text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            Tamu Event
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari berdasarkan nama, email, nomor HP, jabatan, atau perusahaan instansi..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan bg-slate-50/50"
          />
        </div>
      </Card>

      {/* Table Container Card */}
      <Card padding="p-0" className="overflow-hidden">
        <VisitorTable
          visitors={visitors}
          loading={loading}
          onEdit={!isSupervisor ? handleEdit : null}
          onDelete={!isSupervisor ? handleDelete : null}
          isAdmin={isAdmin()}
        />

        {/* Pagination Controls */}
        {meta && meta.last_page > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-500">
              Menampilkan {meta.from}–{meta.to} dari total {meta.total} tamu terdaftar
            </p>
            <div className="flex gap-1.5 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                icon={ChevronLeft}
              />
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    p === meta.current_page
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page === meta.last_page}
                onClick={() => setPage((prev) => Math.min(meta.last_page, prev + 1))}
                icon={ChevronRight}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Modal Form Overlay */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-3xl my-8">
            <VisitorFormPage
              visitorToEdit={visitorToEdit}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowFormModal(false)}
            />
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setVisitorToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Data Tamu"
        message={`Apakah Anda yakin ingin menghapus data tamu "${visitorToDelete?.name}"? Action ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default VisitorListPage;
