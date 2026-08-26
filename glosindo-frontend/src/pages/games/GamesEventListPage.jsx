import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Trophy, Plus, Search, RefreshCw, Trash2, Eye, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import gamesEventService from '../../services/gamesEventService';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const STATUS_CONFIG = {
  draft: { label: 'Draft', variant: 'neutral' },
  active: { label: 'Aktif', variant: 'emerald', dot: true },
  completed: { label: 'Selesai', variant: 'neutral' },
};

const GamesEventListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisor = user?.role === 'supervisor';

  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await gamesEventService.getAll(params);
      const pagination = res.data?.data;
      setEvents(Array.isArray(pagination?.data) ? pagination.data : []);
      setMeta(pagination ?? null);
    } catch {
      toast.error('Gagal memuat daftar games event');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    try {
      await gamesEventService.delete(eventToDelete.id);
      toast.success('Games event berhasil dihapus');
      setDeleteModal(false);
      setEventToDelete(null);
      loadEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus games event');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (event, e) => {
    e.stopPropagation();
    setEventToDelete(event);
    setDeleteModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            Games Event
          </h1>
          <p className="text-neutral-600 mt-1">Kelola event games dengan kelompok & poin</p>
        </div>
        {!isSupervisor && (
          <Button onClick={() => navigate('/games/events/new')} icon={Plus}>
            Buat Games Event
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Cari Event</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Nama event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="active">Aktif</option>
              <option value="completed">Selesai</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={loadEvents} variant="outline" icon={RefreshCw} className="w-full">
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Event List */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Memuat games event...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 mb-4">Belum ada games event</p>
            {!isSupervisor && (
              <Button onClick={() => navigate('/games/events/new')} icon={Plus}>
                Buat Games Event Pertama
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Kelompok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Peserta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Total Poin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => navigate(`/games/events/${event.id}`)}
                    className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{event.name}</div>
                      {event.description && (
                        <div className="text-sm text-neutral-500 line-clamp-1">{event.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {dayjs(event.start_date).format('DD MMM YYYY')} - {dayjs(event.end_date).format('DD MMM YYYY')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {event.groups_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {event.participants_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-600">
                      {event.total_points || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={STATUS_CONFIG[event.status]?.variant} dot={STATUS_CONFIG[event.status]?.dot}>
                        {STATUS_CONFIG[event.status]?.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Eye}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/games/events/${event.id}`);
                          }}
                        >
                          Detail
                        </Button>
                        {!isSupervisor && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Pencil}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/games/events/${event.id}/edit`);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Trash2}
                              onClick={(e) => openDeleteModal(event, e)}
                              className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                            >
                              Hapus
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
            <div className="text-sm text-neutral-600">
              Halaman {meta.current_page} dari {meta.last_page}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={ChevronLeft}
                disabled={meta.current_page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={ChevronRight}
                disabled={meta.current_page === meta.last_page}
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => !deleting && setDeleteModal(false)}
        title="Hapus Games Event"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Yakin ingin menghapus games event <strong>{eventToDelete?.name}</strong>?
          </p>
          <p className="text-sm text-danger-600">
            Event dengan transaksi poin tidak bisa dihapus.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModal(false)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GamesEventListPage;
