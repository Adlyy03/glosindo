import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  Trophy, ArrowLeft, Users, Target, TrendingUp, History, Plus, Copy, Check,
  Download, QrCode, Trash2, Pencil, Eye
} from 'lucide-react';
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

const GamesEventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisor = user?.role === 'supervisor';

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('groups'); // groups, point-qr, dashboard, transactions

  const loadEvent = async () => {
    setLoading(true);
    try {
      const res = await gamesEventService.getById(id);
      setEvent(res.data.data);
    } catch (err) {
      toast.error('Gagal memuat detail event');
      navigate('/games/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Memuat detail...</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/games/events')}>
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-500" />
              {event.name}
            </h1>
            <p className="text-neutral-600 mt-1">
              {dayjs(event.start_date).format('DD MMM YYYY')} - {dayjs(event.end_date).format('DD MMM YYYY')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_CONFIG[event.status]?.variant} dot={STATUS_CONFIG[event.status]?.dot}>
            {STATUS_CONFIG[event.status]?.label}
          </Badge>
          {!isSupervisor && (
            <Button variant="outline" icon={Pencil} onClick={() => navigate(`/games/events/${id}/edit`)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Kelompok</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{event.groups_count || 0}</p>
            </div>
            <Users className="w-10 h-10 text-navy-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Peserta</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{event.participants_count || 0}</p>
            </div>
            <Users className="w-10 h-10 text-emerald-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Poin</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{event.total_points || 0}</p>
            </div>
            <Target className="w-10 h-10 text-amber-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Transaksi</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{event.transactions_count || 0}</p>
            </div>
            <History className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="p-0">
        <div className="border-b border-neutral-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'groups'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Kelompok
            </button>
            <button
              onClick={() => setActiveTab('point-qr')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'point-qr'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <QrCode className="w-4 h-4 inline mr-2" />
              QR Poin
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'transactions'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              Transaksi
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'groups' && <GroupsTab eventId={id} isSupervisor={isSupervisor} />}
          {activeTab === 'point-qr' && <PointQrTab eventId={id} isSupervisor={isSupervisor} />}
          {activeTab === 'dashboard' && <DashboardTab eventId={id} />}
          {activeTab === 'transactions' && <TransactionsTab eventId={id} />}
        </div>
      </Card>
    </div>
  );
};

// Groups Tab Component
const GroupsTab = ({ eventId, isSupervisor }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewParticipantsModal, setViewParticipantsModal] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [copiedToken, setCopiedToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [eventId]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await gamesEventService.getGroups(eventId);
      setGroups(res.data.data || []);
    } catch (err) {
      toast.error('Gagal memuat kelompok');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Nama kelompok wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      await gamesEventService.createGroup(eventId, { name: newGroupName });
      toast.success('Kelompok berhasil dibuat');
      setCreateModal(false);
      setNewGroupName('');
      loadGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat kelompok');
    } finally {
      setSubmitting(false);
    }
  };

  const showQrModal = async (group) => {
    setSelectedGroup(group);
    try {
      const res = await gamesEventService.generateGroupQr(eventId, group.id);
      setQrData(res.data.data);
      setQrModal(true);
    } catch (err) {
      toast.error('Gagal generate QR');
    }
  };

  const loadParticipants = async (group) => {
    setViewParticipantsModal(group);
    try {
      const res = await gamesEventService.getGroupParticipants(eventId, group.id);
      setParticipants(res.data.data || []);
    } catch (err) {
      toast.error('Gagal memuat peserta');
      setParticipants([]);
    }
  };

  useEffect(() => {
    if (viewParticipantsModal) {
      loadParticipants(viewParticipantsModal);
    }
  }, [viewParticipantsModal]);

  const copyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(url);
      toast.success('Link disalin!');
      setTimeout(() => setCopiedToken(null), 2000);
    });
  };

  const downloadQr = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = qrData.qr_code;
    link.download = `QR-Register-${selectedGroup?.name}.png`;
    link.click();
  };

  if (loading) {
    return <div className="text-center py-8 text-neutral-600">Memuat kelompok...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daftar Kelompok</h3>
        {!isSupervisor && (
          <Button size="sm" icon={Plus} onClick={() => setCreateModal(true)}>
            Tambah Kelompok
          </Button>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          Belum ada kelompok. Tambahkan kelompok pertama.
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{group.name}</h4>
                  <p className="text-sm text-neutral-600 mt-1">
                    Peserta: <span className="font-medium">{group.participants_count || 0}</span> | 
                    Poin: <span className="font-medium text-amber-600">{group.total_points || 0}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" icon={QrCode} onClick={() => showQrModal(group)}>
                    QR Register
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Eye}
                    onClick={() => setViewParticipantsModal(group)}
                  >
                    Lihat Peserta
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => !submitting && setCreateModal(false)}
        title="Tambah Kelompok"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Nama Kelompok</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Contoh: Kelompok Merah"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-navy-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCreateModal(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleCreateGroup} loading={submitting}>
              Buat Kelompok
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR Modal */}
      <Modal
        isOpen={qrModal}
        onClose={() => setQrModal(false)}
        title={`QR Register - ${selectedGroup?.name}`}
        maxWidth="md"
      >
        {qrData && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={qrData.qr_code} alt="QR Code" className="w-64 h-64" />
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 mb-2">Link Registrasi:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrData.url}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  icon={copiedToken === qrData.url ? Check : Copy}
                  onClick={() => copyLink(qrData.url)}
                >
                  {copiedToken === qrData.url ? 'Tersalin' : 'Copy'}
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setQrModal(false)}>
                Tutup
              </Button>
              <Button icon={Download} onClick={downloadQr}>
                Download QR
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Participants Modal */}
      <Modal
        isOpen={!!viewParticipantsModal}
        onClose={() => setViewParticipantsModal(null)}
        title={`Peserta - ${viewParticipantsModal?.name}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {participants.length === 0 ? (
            <p className="text-center text-neutral-500 py-8">Belum ada peserta</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Nama</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">HP</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {participants.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2 text-sm">{p.name}</td>
                      <td className="px-4 py-2 text-sm">{p.phone}</td>
                      <td className="px-4 py-2 text-sm">{p.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setViewParticipantsModal(null)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Point QR Tab Component
const PointQrTab = ({ eventId, isSupervisor }) => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [pointValue, setPointValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const POINT_VALUES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  useEffect(() => {
    loadQrCodes();
  }, [eventId]);

  const loadQrCodes = async () => {
    setLoading(true);
    try {
      const res = await gamesEventService.getPointQrs(eventId);
      setQrCodes(res.data.data || []);
    } catch (err) {
      toast.error('Gagal memuat QR poin');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQr = async () => {
    if (!pointValue) {
      toast.error('Pilih nilai poin');
      return;
    }
    setSubmitting(true);
    try {
      await gamesEventService.createPointQr(eventId, { point_value: parseInt(pointValue) });
      toast.success('QR poin berhasil dibuat');
      setCreateModal(false);
      setPointValue('');
      loadQrCodes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat QR poin');
    } finally {
      setSubmitting(false);
    }
  };

  const showQrModal = async (qr) => {
    setSelectedQr(qr);
    try {
      const res = await gamesEventService.generatePointQr(eventId, qr.id);
      setQrData(res.data.data);
      setQrModal(true);
    } catch (err) {
      toast.error('Gagal generate QR');
    }
  };

  const downloadQr = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = qrData.qr_code;
    link.download = `QR-Point-${qrData.point_value}.png`;
    link.click();
  };

  const toggleStatus = async (qr) => {
    const newStatus = qr.status === 'active' ? 'inactive' : 'active';
    try {
      await gamesEventService.updatePointQrStatus(eventId, qr.id, { status: newStatus });
      toast.success(`QR ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`);
      loadQrCodes();
    } catch (err) {
      toast.error('Gagal update status');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-neutral-600">Memuat QR poin...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daftar QR Poin</h3>
        {!isSupervisor && (
          <Button size="sm" icon={Plus} onClick={() => setCreateModal(true)}>
            Buat QR Poin
          </Button>
        )}
      </div>

      {qrCodes.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          Belum ada QR poin. Tambahkan QR poin pertama.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {qrCodes.map((qr) => (
            <Card key={qr.id} className="p-4 text-center">
              <div className={`text-3xl font-bold mb-2 ${qr.status === 'active' ? 'text-amber-600' : 'text-neutral-400'}`}>
                {qr.point_value}
              </div>
              <p className="text-sm text-neutral-600 mb-3">Poin</p>
              <Badge variant={qr.status === 'active' ? 'emerald' : 'neutral'} className="mb-3">
                {qr.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </Badge>
              <p className="text-xs text-neutral-500 mb-3">Scan: {qr.scan_count || 0}x</p>
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" onClick={() => showQrModal(qr)} className="text-xs">
                  Lihat QR
                </Button>
                {!isSupervisor && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleStatus(qr)}
                    className="text-xs"
                  >
                    {qr.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => !submitting && setCreateModal(false)}
        title="Buat QR Poin"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Nilai Poin</label>
            <select
              value={pointValue}
              onChange={(e) => setPointValue(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-navy-500"
            >
              <option value="">Pilih nilai poin</option>
              {POINT_VALUES.map((val) => (
                <option key={val} value={val}>
                  {val} Poin
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCreateModal(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleCreateQr} loading={submitting}>
              Buat QR
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR Display Modal */}
      <Modal
        isOpen={qrModal}
        onClose={() => setQrModal(false)}
        title={`QR ${selectedQr?.point_value} Poin`}
        maxWidth="md"
      >
        {qrData && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={qrData.qr_code} alt="QR Code" className="w-64 h-64" />
            </div>
            <div className="bg-amber-50 p-4 rounded-lg text-center">
              <p className="text-sm text-neutral-600">Nilai Poin</p>
              <p className="text-4xl font-bold text-amber-600">{qrData.point_value}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setQrModal(false)}>
                Tutup
              </Button>
              <Button icon={Download} onClick={downloadQr}>
                Download QR
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ eventId }) => {
  const [stats, setStats] = useState(null);
  const [groupRankings, setGroupRankings] = useState([]);
  const [participantRankings, setParticipantRankings] = useState([]);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [eventId, selectedGroupFilter]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, groupsRes, participantsRes] = await Promise.all([
        gamesEventService.getStats(eventId),
        gamesEventService.getGroupRankings(eventId),
        gamesEventService.getParticipantRankings(eventId, selectedGroupFilter ? { group_id: selectedGroupFilter } : {}),
      ]);
      setStats(statsRes.data.data);
      setGroupRankings(groupsRes.data.data || []);
      setParticipantRankings(participantsRes.data.data || []);
    } catch (err) {
      toast.error('Gagal memuat dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-neutral-600">Memuat dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Kelompok</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{stats?.total_groups || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Peserta</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{stats?.total_participants || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Total Poin</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats?.total_points || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Transaksi</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{stats?.total_transactions || 0}</p>
        </Card>
      </div>

      {/* Group Rankings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🏆 Ranking Kelompok</h3>
        {groupRankings.length === 0 ? (
          <p className="text-center text-neutral-500 py-8">Belum ada data ranking</p>
        ) : (
          <div className="space-y-2">
            {groupRankings.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    group.rank === 1 ? 'bg-amber-500 text-white' :
                    group.rank === 2 ? 'bg-neutral-400 text-white' :
                    group.rank === 3 ? 'bg-amber-700 text-white' :
                    'bg-neutral-200 text-neutral-700'
                  }`}>
                    {group.rank}
                  </div>
                  <div>
                    <p className="font-semibold">{group.name}</p>
                    <p className="text-sm text-neutral-600">
                      {group.total_participants || 0} peserta • {group.transaction_count || 0} transaksi
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">{group.total_points || 0}</p>
                  <p className="text-xs text-neutral-500">poin</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Participant Rankings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">👤 Ranking Peserta</h3>
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-navy-500"
          >
            <option value="">Semua Kelompok</option>
            {groupRankings.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        {participantRankings.length === 0 ? (
          <p className="text-center text-neutral-500 py-8">Belum ada data ranking</p>
        ) : (
          <div className="space-y-2">
            {participantRankings.slice(0, 10).map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    participant.rank === 1 ? 'bg-amber-500 text-white' :
                    participant.rank === 2 ? 'bg-neutral-400 text-white' :
                    participant.rank === 3 ? 'bg-amber-700 text-white' :
                    'bg-neutral-200 text-neutral-700'
                  }`}>
                    {participant.rank}
                  </div>
                  <div>
                    <p className="font-semibold">{participant.name}</p>
                    <p className="text-sm text-neutral-600">
                      {participant.event_group?.name} • {participant.transaction_count || 0} transaksi
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-600">{participant.total_points || 0}</p>
                  <p className="text-xs text-neutral-500">poin</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// Transactions Tab Component
const TransactionsTab = ({ eventId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, [eventId, page]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await gamesEventService.getTransactions(eventId, { page });
      const pagination = res.data.data;
      setTransactions(Array.isArray(pagination?.data) ? pagination.data : []);
    } catch (err) {
      toast.error('Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-neutral-600">Memuat transaksi...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Riwayat Transaksi Poin</h3>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">Belum ada transaksi poin</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Peserta</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Kelompok</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Poin</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {dayjs(tx.scanned_at).format('DD/MM/YY HH:mm')}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                    {tx.participant?.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {tx.event_group?.name}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-amber-600">
                    +{tx.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GamesEventDetailPage;
