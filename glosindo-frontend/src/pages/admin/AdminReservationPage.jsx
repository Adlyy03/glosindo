import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Plus,
  Search,
  Copy,
  Share2,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Power,
  RefreshCw,
  ExternalLink,
  UserCheck,
  Building2,
  Phone,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import reservationService from '../../services/reservationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const AdminReservationPage = () => {
  const [activeTab, setActiveTab] = useState('invitations'); // 'invitations' | 'reservations'
  
  // Data states
  const [stats, setStats] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [invitationSearch, setInvitationSearch] = useState('');
  const [invitationType, setInvitationType] = useState('all');
  const [invitationStatus, setInvitationStatus] = useState('all');

  const [reservationSearch, setReservationSearch] = useState('');
  const [reservationStatus, setReservationStatus] = useState('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    type: 'personal',
    company_name: '',
    guest_name: '',
    purpose: '',
    meet_to: '',
    scheduled_date: '',
    scheduled_time: '09:00',
    quota: 1,
    expires_at: '',
    notes: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadInvitations(), loadReservations()]);
    } catch (err) {
      console.error('Failed to load reservation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await reservationService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Stats fetch error:', err);
    }
  };

  const loadInvitations = async () => {
    try {
      const params = {};
      if (invitationType !== 'all') params.type = invitationType;
      if (invitationStatus !== 'all') params.status = invitationStatus;
      if (invitationSearch.trim()) params.search = invitationSearch.trim();

      const res = await reservationService.getInvitations(params);
      setInvitations(res.data?.data || []);
    } catch (err) {
      toast.error('Gagal memuat daftar undangan');
    }
  };

  const loadReservations = async () => {
    try {
      const params = {};
      if (reservationStatus !== 'all') params.status = reservationStatus;
      if (reservationSearch.trim()) params.search = reservationSearch.trim();

      const res = await reservationService.getReservations(params);
      setReservations(res.data?.data || []);
    } catch (err) {
      toast.error('Gagal memuat daftar reservasi');
    }
  };

  const handleOpenCreateModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      type: 'personal',
      company_name: '',
      guest_name: '',
      purpose: 'Kunjungan Kerja / Meeting',
      meet_to: '',
      scheduled_date: today,
      scheduled_time: '09:00',
      quota: 1,
      expires_at: '',
      notes: '',
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      toast.error('Nama instansi / perusahaan wajib diisi');
      return;
    }
    if (!formData.scheduled_date) {
      toast.error('Tanggal kunjungan wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        quota: formData.type === 'personal' ? 1 : parseInt(formData.quota, 10) || 1,
      };

      const res = await reservationService.createInvitation(payload);
      if (res.success) {
        toast.success('Link undangan reservasi berhasil dibuat!');
        setShowCreateModal(false);
        await Promise.all([loadInvitations(), loadStats()]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal membuat link undangan';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (invitation) => {
    try {
      const res = await reservationService.toggleInvitationStatus(invitation.id);
      if (res.success) {
        toast.success(res.message);
        loadInvitations();
        loadStats();
      }
    } catch (err) {
      toast.error('Gagal mengubah status undangan');
    }
  };

  const handleDeleteInvitation = async (invitation) => {
    if (!window.confirm(`Hapus link undangan untuk "${invitation.company_name}"?`)) return;

    try {
      const res = await reservationService.deleteInvitation(invitation.id);
      if (res.success) {
        toast.success('Link undangan berhasil dihapus');
        loadInvitations();
        loadStats();
      }
    } catch (err) {
      toast.error('Gagal menghapus link undangan');
    }
  };

  const handleCancelReservation = async (resv) => {
    if (!window.confirm(`Batalkan reservasi tamu "${resv.visitor_name}" (${resv.reservation_code})?`)) return;

    try {
      const res = await reservationService.deleteReservation(resv.id);
      if (res.success) {
        toast.success('Reservasi berhasil dibatalkan');
        loadReservations();
        loadStats();
      }
    } catch (err) {
      toast.error('Gagal membatalkan reservasi');
    }
  };

  const handleCopyLink = (token) => {
    const url = `${window.location.origin}/reservasi/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link reservasi berhasil disalin ke clipboard!', { icon: '📋' });
  };

  const handleShareWhatsApp = (invitation) => {
    const url = `${window.location.origin}/reservasi/${invitation.token}`;
    const dateFormatted = new Date(invitation.scheduled_date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const greeting = invitation.guest_name ? `Yth. Bpk/Ibu ${invitation.guest_name},` : 'Kepada Yth. Tamu Kunjungan,';
    const message = 
`${greeting}

Anda diundang untuk melakukan kunjungan ke kantor GLOSINDO.

Rincian Undangan:
- Instansi: ${invitation.company_name}
- Tanggal Kunjungan: ${dateFormatted}
- Jam: ${invitation.scheduled_time || '09:00'} WIB
- Keperluan: ${invitation.purpose || 'Kunjungan Resmi'}
${invitation.meet_to ? `- Menemui: ${invitation.meet_to}\n` : ''}
Untuk mempercepat proses masuk tanpa perlu antre di resepsionis, mohon lakukan pra-registrasi dan pendaftaran biometrik wajah mandiri melalui link resmi berikut:
${url}

Terima kasih.
PT Glosindo Digital Systems`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleViewDetail = async (invitation) => {
    try {
      const res = await reservationService.getInvitation(invitation.id);
      if (res.success) {
        setSelectedInvitation(res.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      toast.error('Gagal memuat rincian tamu undangan');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <LinkIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Undangan Reservasi</h1>
            <Badge variant="blue">Pre-Registration</Badge>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Buat link undangan kunjungan personal atau massal dengan registrasi biometrik wajah. Tamu otomatis disetujui (Auto Approved) dan langsung check-in instan saat tiba di kiosk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Buat Undangan Baru
          </Button>
        </div>
      </div>

      {/* Metrics Row (Strictly Real Data, No Slop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="p-4 border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reservasi</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.total_reservations ?? '-'}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Tercatat di sistem</span>
        </Card>

        <Card className="p-4 border border-slate-200/80">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Disetujui</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{stats?.approved_reservations ?? '-'}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Siap check-in</span>
        </Card>

        <Card className="p-4 border border-slate-200/80">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Sisa Kuota</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats?.unregistered_quota ?? '-'}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Belum registrasi</span>
        </Card>

        <Card className="p-4 border border-slate-200/80">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Sudah Check-In</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats?.checked_in ?? '-'}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Sedang di lokasi</span>
        </Card>

        <Card className="p-4 border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Check-Out</p>
          <p className="text-2xl font-black text-slate-700 mt-1">{stats?.checked_out ?? '-'}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Kunjungan selesai</span>
        </Card>

        <Card className="p-4 border border-slate-200/80">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Kedaluwarsa</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{stats?.expired ?? '-'}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Lewat jadwal / batal</span>
        </Card>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('invitations')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'invitations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Link Undangan Reservasi ({invitations.length})
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'reservations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Daftar Tamu Terdaftar ({reservations.length})
        </button>
      </div>

      {/* TAB 1: INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari instansi, nama tamu, atau tujuan..."
                  value={invitationSearch}
                  onChange={(e) => setInvitationSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadInvitations()}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <select
                  value={invitationType}
                  onChange={(e) => {
                    setInvitationType(e.target.value);
                  }}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="personal">Personal (1 Tamu)</option>
                  <option value="mass">Massal (Group/Instansi)</option>
                </select>

                <select
                  value={invitationStatus}
                  onChange={(e) => {
                    setInvitationStatus(e.target.value);
                  }}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                  <option value="expired">Kedaluwarsa</option>
                </select>

                <Button variant="secondary" size="sm" onClick={loadInvitations} className="h-9">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Filter
                </Button>
              </div>
            </div>
          </Card>

          {/* Invitations Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Instansi / Tamu</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Tipe</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Jadwal Kunjungan</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Kuota & Pendaftar</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-slate-500 text-sm">
                        Memuat data undangan reservasi...
                      </td>
                    </tr>
                  ) : invitations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-slate-500 text-sm">
                        Tidak ada data undangan ditemukan. Klik tombol <strong>Buat Undangan Baru</strong> di atas untuk membuat link.
                      </td>
                    </tr>
                  ) : (
                    invitations.map((inv) => {
                      const isExpired = inv.is_expired;
                      const isFull = inv.quota > 0 && inv.used_count >= inv.quota;

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3.5">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 text-sm">{inv.company_name}</p>
                              {inv.guest_name && (
                                <p className="text-xs text-slate-500">Tamu: {inv.guest_name}</p>
                              )}
                              <p className="text-xs text-slate-400">Keperluan: {inv.purpose || '-'}</p>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <Badge color={inv.type === 'personal' ? 'blue' : 'purple'}>
                              {inv.type === 'personal' ? 'Personal' : 'Massal'}
                            </Badge>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="text-xs space-y-0.5">
                              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(inv.scheduled_date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {inv.scheduled_time || '09:00'} WIB
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span>{inv.used_count} terdaftar</span>
                                <span className="text-slate-400">kuota {inv.quota}</span>
                              </div>
                              <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isFull ? 'bg-amber-500' : 'bg-blue-600'
                                  }`}
                                  style={{
                                    width: `${Math.min(100, (inv.used_count / Math.max(1, inv.quota)) * 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {!inv.is_active ? (
                              <Badge color="gray">Nonaktif</Badge>
                            ) : isExpired ? (
                              <Badge color="red">Kedaluwarsa</Badge>
                            ) : isFull ? (
                              <Badge color="yellow">Kuota Penuh</Badge>
                            ) : (
                              <Badge color="green">Aktif</Badge>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Copy Link */}
                              <button
                                onClick={() => handleCopyLink(inv.token)}
                                title="Salin Link Reservasi"
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              {/* WhatsApp Share */}
                              <button
                                onClick={() => handleShareWhatsApp(inv)}
                                title="Bagikan via WhatsApp"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>

                              {/* View Registered Guests */}
                              <button
                                onClick={() => handleViewDetail(inv)}
                                title="Lihat Tamu Terdaftar"
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Toggle Active/Inactive */}
                              <button
                                onClick={() => handleToggleStatus(inv)}
                                title={inv.is_active ? 'Nonaktifkan Link' : 'Aktifkan Link'}
                                className={`p-1.5 rounded-lg transition ${
                                  inv.is_active
                                    ? 'text-amber-600 hover:bg-amber-50'
                                    : 'text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                <Power className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteInvitation(inv)}
                                title="Hapus Link"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: REGISTERED GUESTS */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode reservasi, nama, telepon, atau instansi..."
                  value={reservationSearch}
                  onChange={(e) => setReservationSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadReservations()}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <select
                  value={reservationStatus}
                  onChange={(e) => setReservationStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="APPROVED">Disetujui (Menunggu Check-In)</option>
                  <option value="CHECKED_IN">Sudah Check-In</option>
                  <option value="CHECKED_OUT">Sudah Check-Out</option>
                  <option value="EXPIRED">Kedaluwarsa</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>

                <Button variant="secondary" size="sm" onClick={loadReservations} className="h-9">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Filter
                </Button>
              </div>
            </div>
          </Card>

          {/* Reservations Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Kode & Tamu</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Kontak & Instansi</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Tujuan & Penerima</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Jadwal Kunjungan</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Biometrik Wajah</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-slate-500 text-sm">
                        Memuat data tamu reservasi...
                      </td>
                    </tr>
                  ) : reservations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-slate-500 text-sm">
                        Belum ada tamu yang mendaftar melalui link reservasi.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((resv) => {
                      const statusConfig = {
                        APPROVED: { color: 'blue', label: 'Disetujui' },
                        CHECKED_IN: { color: 'green', label: 'Checked-In' },
                        CHECKED_OUT: { color: 'gray', label: 'Checked-Out' },
                        EXPIRED: { color: 'red', label: 'Kedaluwarsa' },
                        CANCELLED: { color: 'red', label: 'Dibatalkan' },
                      };
                      const conf = statusConfig[resv.status] || { color: 'gray', label: resv.status };

                      return (
                        <tr key={resv.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {resv.reservation_code}
                            </span>
                            <p className="font-bold text-slate-900 text-sm mt-1">{resv.visitor_name}</p>
                          </td>

                          <td className="px-4 py-3.5 text-xs space-y-0.5">
                            <p className="font-medium text-slate-700">{resv.visitor_company || '-'}</p>
                            <p className="text-slate-500">{resv.visitor_phone}</p>
                            {resv.visitor_email && <p className="text-slate-400">{resv.visitor_email}</p>}
                          </td>

                          <td className="px-4 py-3.5 text-xs space-y-0.5">
                            <p className="font-medium text-slate-800">{resv.purpose}</p>
                            <p className="text-slate-500">Menemui: {resv.meet_to}</p>
                          </td>

                          <td className="px-4 py-3.5 text-xs space-y-0.5">
                            <p className="font-medium text-slate-700">
                              {new Date(resv.scheduled_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-slate-500">{resv.scheduled_time || '09:00'} WIB</p>
                            {resv.checked_in_at && (
                              <p className="text-emerald-600 font-semibold text-[11px]">
                                In: {new Date(resv.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            {resv.has_face_registered ? (
                              <Badge color="green">
                                <ShieldCheck className="w-3 h-3 mr-1 inline" />
                                Terdaftar
                              </Badge>
                            ) : (
                              <Badge color="gray">Manual / Foto</Badge>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <Badge color={conf.color}>{conf.label}</Badge>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            {resv.status === 'APPROVED' && (
                              <button
                                onClick={() => handleCancelReservation(resv)}
                                title="Batalkan Reservasi"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: BUAT UNDANGAN BARU */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Buat Link Undangan Reservasi</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Tipe Undangan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'personal', quota: 1 })}
                    className={`p-3 text-left border-2 rounded-xl transition ${
                      formData.type === 'personal'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <p className="font-bold text-sm">Personal (1 Tamu)</p>
                    <p className="text-xs text-slate-500 mt-0.5">Link khusus untuk 1 tamu/pejabat tertentu</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'mass', quota: 10 })}
                    className={`p-3 text-left border-2 rounded-xl transition ${
                      formData.type === 'mass'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <p className="font-bold text-sm">Massal (Banyak Tamu)</p>
                    <p className="text-xs text-slate-500 mt-0.5">Link grup untuk rombongan instansi/vendor</p>
                  </button>
                </div>
              </div>

              {/* Company / Instansi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Instansi / Perusahaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Telekomunikasi Indonesia / Dinas Kominfo"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Guest Name (If Personal) */}
              {formData.type === 'personal' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nama Tamu Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Bambang Wijaya"
                    value={formData.guest_name}
                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Schedule Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Tanggal Kunjungan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Jam Kunjungan
                  </label>
                  <input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quota (If Mass) */}
              {formData.type === 'mass' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Kuota Pendaftar Maksimal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={formData.quota}
                    onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Batas maksimal tamu yang dapat mendaftar melalui link ini.</p>
                </div>
              )}

              {/* Purpose & Meet To */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Keperluan / Tujuan Kunjungan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Diskusi Kerjasama Proyek / Audit Tahunan"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Staf / Pejabat yang Ditemui
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ibu Rina (Direktur Operasional) / Tim IT"
                  value={formData.meet_to}
                  onChange={(e) => setFormData({ ...formData, meet_to: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Catatan / Instruksi Tambahan (Opsional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Contoh: Harap membawa kartu identitas fisik saat kedatangan."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Memproses...' : 'Terbitkan Link'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL TAMU TERDAFTAR PADA UNDANGAN */}
      {showDetailModal && selectedInvitation && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Rincian Tamu Terdaftar</h3>
                <p className="text-xs text-slate-500">
                  {selectedInvitation.company_name} • Kuota {selectedInvitation.used_count}/{selectedInvitation.quota} terisi
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Link Publik:</span>
                  <button
                    onClick={() => handleCopyLink(selectedInvitation.token)}
                    className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Salin Link
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jadwal Kunjungan:</span>
                  <span className="font-medium text-slate-800">
                    {new Date(selectedInvitation.scheduled_date).toLocaleDateString('id-ID', { dateStyle: 'full' })} ({selectedInvitation.scheduled_time || '09:00'} WIB)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Pendaftar ({selectedInvitation.reservations?.length || 0})
                </h4>

                {(!selectedInvitation.reservations || selectedInvitation.reservations.length === 0) ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic bg-slate-50 rounded-xl">
                    Belum ada tamu yang mendaftar melalui link ini.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {selectedInvitation.reservations.map((r) => (
                      <div key={r.id} className="p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/50">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-slate-900">{r.visitor_name}</p>
                            <span className="font-mono text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                              {r.reservation_code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{r.visitor_phone} • {r.visitor_email || 'Tanpa email'}</p>
                        </div>

                        <div className="text-right space-y-1">
                          <Badge color={r.status === 'CHECKED_IN' ? 'green' : 'blue'}>
                            {r.status === 'CHECKED_IN' ? 'Checked-In' : 'Disetujui'}
                          </Badge>
                          <p className="text-[10px] text-slate-400">
                            {new Date(r.approved_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservationPage;

