import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Trophy,
  Users,
  Target,
  QrCode,
  History,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Camera,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Trash2,
  Medal,
  Award,
  Flame,
  ShieldCheck,
  Building,
  UserPlus,
  Printer,
  ChevronDown
} from 'lucide-react';
import gamesEventService from '../../services/gamesEventService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import QrisStandeeModal from './QrisStandeeModal';
import GamesPointScannerModal from './GamesPointScannerModal';

const GROUP_COLORS = {
  red: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-600', fill: '#e11d48' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-600', fill: '#2563eb' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-600', fill: '#059669' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', badge: 'bg-amber-500', fill: '#d97706' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-600', fill: '#7c3aed' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', badge: 'bg-cyan-600', fill: '#0891b2' },
};

const getGroupColorTheme = (colorName) => {
  return GROUP_COLORS[colorName] || GROUP_COLORS.blue;
};

const GamesEventSection = ({ eventId, gameEventId, eventName, isSupervisor }) => {
  const [gameEvent, setGameEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  // Rankings & Dashboard Stats
  const [groupRankings, setGroupRankings] = useState([]);
  const [participantRankings, setParticipantRankings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [rankingMode, setRankingMode] = useState('groups'); // 'groups' | 'participants'

  // Selected Group for Roster View
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupParticipants, setGroupParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // QRIS & Standee Modals
  const [standeeModalOpen, setStandeeModalOpen] = useState(false);
  const [selectedQrData, setSelectedQrData] = useState(null);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  // Create Group Modal
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('blue');
  const [submittingGroup, setSubmittingGroup] = useState(false);

  // Create QR Poin Modal
  const [showAddQrModal, setShowAddQrModal] = useState(false);
  const [newPointValue, setNewPointValue] = useState(25);
  const [newPointTitle, setNewPointTitle] = useState('');
  const [submittingQr, setSubmittingQr] = useState(false);

  // Add Participant to Group Modal
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartPhone, setNewPartPhone] = useState('');
  const [newPartEmail, setNewPartEmail] = useState('');
  const [submittingPart, setSubmittingPart] = useState(false);

  // Copied token notification
  const [copiedToken, setCopiedToken] = useState(null);

  // Mobile navigation tab: 'leaderboard' | 'groups' | 'qris' | 'history'
  const [mobileTab, setMobileTab] = useState('leaderboard');

  // Load Game Event linked to this standard event or by gameEventId
  const loadGameEventData = useCallback(async () => {
    if (!eventId && !gameEventId) return;
    setLoading(true);
    try {
      let ge = null;
      if (gameEventId) {
        const res = await gamesEventService.getById(gameEventId);
        ge = res.data?.data;
      } else if (eventId) {
        const res = await gamesEventService.getByEventId(eventId);
        ge = res.data?.data;
      }
      setGameEvent(ge);

      if (ge?.id) {
        // Load rankings, groups, and transactions concurrently
        const [rankRes, partRankRes, txRes] = await Promise.allSettled([
          gamesEventService.getGroupRankings(ge.id),
          gamesEventService.getParticipantRankings(ge.id, { limit: 15 }),
          gamesEventService.getTransactions(ge.id, { limit: 12 }),
        ]);

        if (rankRes.status === 'fulfilled') {
          const list = rankRes.value.data?.data || [];
          setGroupRankings(list);
          if (list.length > 0 && !selectedGroup) {
            setSelectedGroup(list[0]);
          }
        }
        if (partRankRes.status === 'fulfilled') {
          setParticipantRankings(partRankRes.value.data?.data || []);
        }
        if (txRes.status === 'fulfilled') {
          setTransactions(txRes.value.data?.data || []);
        }
      }
    } catch (err) {
      console.error('Error loading game event:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId, gameEventId]);

  useEffect(() => {
    loadGameEventData();
  }, [loadGameEventData]);

  // Load participants when selectedGroup changes
  useEffect(() => {
    if (!gameEvent?.id || !selectedGroup?.id) {
      setGroupParticipants([]);
      return;
    }
    setLoadingParticipants(true);
    gamesEventService.getGroupParticipants(gameEvent.id, selectedGroup.id)
      .then((res) => {
        setGroupParticipants(res.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingParticipants(false));
  }, [gameEvent?.id, selectedGroup?.id]);

  // Initialize/Link Game Event for this Event
  const handleInitializeGames = async () => {
    setInitializing(true);
    try {
      const res = await gamesEventService.linkToEvent(eventId, {
        name: `Games: ${eventName || 'Event'}`,
      });
      toast.success('Sistem Games & Poin Kelompok berhasil diaktifkan!');
      setGameEvent(res.data?.data);
      loadGameEventData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengaktifkan sistem games');
    } finally {
      setInitializing(false);
    }
  };

  // Add Group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !gameEvent?.id) return;
    setSubmittingGroup(true);
    try {
      await gamesEventService.createGroup(gameEvent.id, {
        name: newGroupName.trim(),
        color: newGroupColor,
      });
      toast.success(`Kelompok "${newGroupName}" berhasil dibuat`);
      setShowAddGroupModal(false);
      setNewGroupName('');
      loadGameEventData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat kelompok');
    } finally {
      setSubmittingGroup(false);
    }
  };

  // Add QR Poin
  const handleCreatePointQr = async (e) => {
    e.preventDefault();
    if (!gameEvent?.id) return;
    setSubmittingQr(true);
    try {
      await gamesEventService.createPointQr(gameEvent.id, {
        point_value: parseInt(newPointValue),
        title: newPointTitle.trim() || `Pos Poin ${newPointValue}`,
      });
      toast.success(`QR Poin +${newPointValue} berhasil dibuat`);
      setShowAddQrModal(false);
      setNewPointTitle('');
      loadGameEventData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat QR poin');
    } finally {
      setSubmittingQr(false);
    }
  };

  // Add Participant to Selected Group
  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newPartName.trim() || !newPartPhone.trim() || !selectedGroup?.id) return;
    setSubmittingPart(true);
    try {
      await gamesEventService.addParticipant(gameEvent.id, selectedGroup.id, {
        name: newPartName.trim(),
        phone: newPartPhone.trim(),
        email: newPartEmail.trim() || null,
      });
      toast.success(`Peserta "${newPartName}" ditambahkan ke ${selectedGroup.name}`);
      setShowAddPartModal(false);
      setNewPartName('');
      setNewPartPhone('');
      setNewPartEmail('');
      // Reload roster & rankings
      const res = await gamesEventService.getGroupParticipants(gameEvent.id, selectedGroup.id);
      setGroupParticipants(res.data?.data || []);
      loadGameEventData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan peserta');
    } finally {
      setSubmittingPart(false);
    }
  };

  // Generate and View QRIS Standee
  const handleViewStandee = async (qr) => {
    try {
      const res = await gamesEventService.generatePointQr(gameEvent.id, qr.id);
      setSelectedQrData({
        ...res.data?.data,
        title: qr.title || `Pos Poin ${qr.point_value}`,
        description: qr.description,
      });
      setStandeeModalOpen(true);
    } catch (err) {
      toast.error('Gagal memuat QR Code standee');
    }
  };

  // Toggle QR Status
  const handleToggleQrStatus = async (qr) => {
    const nextStatus = qr.status === 'active' ? 'inactive' : 'active';
    try {
      await gamesEventService.updatePointQrStatus(gameEvent.id, qr.id, { status: nextStatus });
      toast.success(`QR Poin sekarang ${nextStatus === 'active' ? 'Aktif' : 'Nonaktif'}`);
      loadGameEventData();
    } catch (err) {
      toast.error('Gagal mengubah status QR');
    }
  };

  // Copy Group Link
  const handleCopyGroupLink = (token) => {
    const url = `${window.location.origin}/games/register/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    toast.success('Tautan registrasi kelompok berhasil disalin');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-500">Memuat Sistem Games & Poin Kelompok...</p>
      </div>
    );
  }

  // If no game event linked yet, show attractive Onboarding / Activation Card
  if (!gameEvent) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-brand-navy to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Fitur Tambahan: Kompetisi Games & Sistem Poin Kelompok</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Aktifkan Sistem Games & Poin QRIS untuk Event Ini
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Kelola kompetisi interaktif di dalam event. Buat beberapa kelompok dengan anggota yang berbeda-beda, generate standee QRIS poin per pos permainan, dan pantau klasemen podium secara realtime!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <p className="font-bold text-sm text-white">Kelompok & Peserta Berbeda</p>
            <p className="text-xs text-slate-400">Tiap kelompok memiliki anggota, warna tim, dan akumulasi skor masing-masing.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <p className="font-bold text-sm text-white">Standee QRIS & Kamera HP</p>
            <p className="text-xs text-slate-400">Cetak standee QR pos dan peserta cukup scan menggunakan kamera browser.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <p className="font-bold text-sm text-white">Leaderboard & Podium Otomatis</p>
            <p className="text-xs text-slate-400">Podium juara 1, 2, 3 terhitung otomatis dari total poin transaksi kelompok.</p>
          </div>
        </div>

        <div className="pt-2">
          {!isSupervisor && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleInitializeGames}
              loading={initializing}
              icon={Sparkles}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg"
            >
              Aktifkan Games & Poin Kelompok Sekarang
            </Button>
          )}
        </div>
      </div>
    );
  }

  const groups = gameEvent.groups || [];
  const pointQrs = gameEvent.pointQrCodes || [];
  const totalPoints = gameEvent.total_points || 0;
  const totalParticipants = gameEvent.total_participants || 0;

  return (
    <div className="space-y-6">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & QUICK METRICS BANNER (RESPONSIVE)        */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {gameEvent.name}
            </h2>
            <Badge variant="emerald" dot>Kompetisi Aktif</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Sistem perolehan poin games antar-kelompok dengan teknologi scan QRIS langsung di web & server.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="primary"
            size="md"
            icon={Camera}
            onClick={() => setScannerModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-sm"
          >
            Scan QRIS Poin
          </Button>

          {!isSupervisor && (
            <>
              <Button
                variant="outline"
                size="md"
                icon={Plus}
                onClick={() => setShowAddGroupModal(true)}
              >
                Tambah Kelompok
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={QrCode}
                onClick={() => setShowAddQrModal(true)}
              >
                Buat QR Poin
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="md"
            icon={RefreshCw}
            onClick={loadGameEventData}
            title="Refresh Data Games"
          />
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Kelompok</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-black text-slate-900">{groups.length}</p>
            <Users className="w-5 h-5 text-blue-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Peserta Games</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-black text-slate-900">{totalParticipants}</p>
            <UserPlus className="w-5 h-5 text-emerald-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Poin Terkumpul</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-black text-amber-600">{totalPoints.toLocaleString()}</p>
            <Sparkles className="w-5 h-5 text-amber-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pos QRIS Aktif</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-black text-slate-900">
              {pointQrs.filter((q) => q.status === 'active').length}
            </p>
            <QrCode className="w-5 h-5 text-purple-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MOBILE APP SEGMENTED TABS (VISIBLE ON MOBILE ONLY)    */}
      {/* ======================================================== */}
      <div className="flex lg:hidden bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          onClick={() => setMobileTab('leaderboard')}
          className={`flex-1 py-2 text-center rounded-xl transition-all ${
            mobileTab === 'leaderboard'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setMobileTab('groups')}
          className={`flex-1 py-2 text-center rounded-xl transition-all ${
            mobileTab === 'groups'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Kelompok ({groups.length})
        </button>
        <button
          onClick={() => setMobileTab('qris')}
          className={`flex-1 py-2 text-center rounded-xl transition-all ${
            mobileTab === 'qris'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pos QRIS ({pointQrs.length})
        </button>
        <button
          onClick={() => setMobileTab('history')}
          className={`flex-1 py-2 text-center rounded-xl transition-all ${
            mobileTab === 'history'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Log Scan
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN WORKSPACE: LEADERBOARD & GROUP ROSTER            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PODIUM & STANDINGS (7 COLS ON DESKTOP) */}
        <div
          className={`lg:col-span-7 space-y-6 ${
            mobileTab !== 'leaderboard' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Podium Top 3 */}
          <div className="bg-gradient-to-b from-slate-900 to-brand-navy rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black tracking-tight text-white">
                  Podium Klasemen Kelompok
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-300/90 tracking-wider uppercase">
                Skor Realtime
              </span>
            </div>

            {groupRankings.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                Belum ada transaksi poin. Scan QR poin untuk mencetak skor pertama!
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
                {/* 2nd Place */}
                <div className="flex flex-col items-center order-1">
                  <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-md mb-2">
                    2
                  </div>
                  <div className="w-full bg-white/10 backdrop-blur-xs rounded-2xl p-3 text-center border border-white/20 h-28 flex flex-col justify-between">
                    <p className="text-xs font-black truncate text-white">
                      {groupRankings[1]?.group_name || '—'}
                    </p>
                    <p className="text-lg font-black text-slate-200">
                      {groupRankings[1]?.total_points || 0}
                      <span className="text-[10px] font-normal text-slate-400 block">Poin</span>
                    </p>
                  </div>
                </div>

                {/* 1st Place (Gold / Highest) */}
                <div className="flex flex-col items-center order-2 -mt-4">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg mb-2 ring-4 ring-amber-300/30 animate-pulse">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="w-full bg-gradient-to-t from-amber-500/20 to-amber-500/10 rounded-2xl p-3 text-center border-2 border-amber-400/50 h-36 flex flex-col justify-between shadow-lg">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                        Juara 1
                      </span>
                      <p className="text-sm font-black truncate text-white">
                        {groupRankings[0]?.group_name || '—'}
                      </p>
                    </div>
                    <p className="text-2xl font-black text-amber-300">
                      {groupRankings[0]?.total_points || 0}
                      <span className="text-[10px] font-normal text-slate-300 block">Poin</span>
                    </p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center order-3">
                  <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow-md mb-2">
                    3
                  </div>
                  <div className="w-full bg-white/10 backdrop-blur-xs rounded-2xl p-3 text-center border border-white/20 h-24 flex flex-col justify-between">
                    <p className="text-xs font-black truncate text-white">
                      {groupRankings[2]?.group_name || '—'}
                    </p>
                    <p className="text-base font-black text-amber-200">
                      {groupRankings[2]?.total_points || 0}
                      <span className="text-[10px] font-normal text-slate-400 block">Poin</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Standings Table (with toggle Groups / Individuals) */}
          <Card padding="p-0" className="overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Tabel Klasemen Perolehan Poin
                </h3>
                <p className="text-xs text-slate-500">Peringkat per kelompok dan kontributor individu</p>
              </div>

              {/* Toggle Groups / Top Scorers */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setRankingMode('groups')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    rankingMode === 'groups'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Kelompok
                </button>
                <button
                  onClick={() => setRankingMode('participants')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    rankingMode === 'participants'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Top Peserta
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {rankingMode === 'groups' ? (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="px-4 py-3 text-center w-12">#</th>
                      <th className="px-4 py-3">Nama Kelompok</th>
                      <th className="px-4 py-3 text-center">Anggota</th>
                      <th className="px-4 py-3 text-right">Total Poin</th>
                      <th className="px-4 py-3 text-right hidden sm:table-cell">Rata-rata/Org</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {groupRankings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Belum ada data kelompok.
                        </td>
                      </tr>
                    ) : (
                      groupRankings.map((grp, idx) => {
                        const theme = getGroupColorTheme(grp.color);
                        return (
                          <tr
                            key={grp.group_id}
                            onClick={() => {
                              setSelectedGroup({ id: grp.group_id, name: grp.group_name });
                              setMobileTab('groups');
                            }}
                            className="hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
                            <td className="px-4 py-3 text-center font-bold">
                              {idx === 0 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black">
                                  1
                                </span>
                              ) : idx === 1 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black">
                                  2
                                </span>
                              ) : idx === 2 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black">
                                  3
                                </span>
                              ) : (
                                <span className="text-slate-400">{idx + 1}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${theme.badge}`} />
                                <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {grp.group_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-600">
                              {grp.participants_count || 0}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-black text-sm text-amber-600">
                                {grp.total_points || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-slate-500 font-semibold hidden sm:table-cell">
                              {grp.avg_points_per_participant ? Math.round(grp.avg_points_per_participant) : 0}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="px-4 py-3 text-center w-12">#</th>
                      <th className="px-4 py-3">Nama Peserta</th>
                      <th className="px-4 py-3">Kelompok</th>
                      <th className="px-4 py-3 text-right">Poin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {participantRankings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">
                          Belum ada perolehan poin per peserta.
                        </td>
                      </tr>
                    ) : (
                      participantRankings.map((p, idx) => (
                        <tr key={p.participant_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {p.participant_name}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-semibold">
                            {p.group_name}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-amber-600">
                            {p.total_points}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: KELOMPOK & ROSTER ANGGOTA (5 COLS ON DESKTOP) */}
        <div
          className={`lg:col-span-5 space-y-6 ${
            mobileTab !== 'groups' ? 'hidden lg:block' : 'block'
          }`}
        >
          <Card padding="p-0" className="overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Daftar Kelompok & Anggota
                </h3>
                <p className="text-xs text-slate-500">
                  Setiap kelompok memiliki anggota dan poin yang berbeda
                </p>
              </div>
              {!isSupervisor && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  onClick={() => setShowAddGroupModal(true)}
                >
                  Kelompok
                </Button>
              )}
            </div>

            {/* Group Pills Horizontal List */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
              {groups.map((grp) => {
                const isSelected = selectedGroup?.id === grp.id;
                const theme = getGroupColorTheme(grp.color);
                return (
                  <button
                    key={grp.id}
                    onClick={() => setSelectedGroup(grp)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : `${theme.bg} ${theme.text} hover:opacity-80 border ${theme.border}`
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-amber-400' : theme.badge}`} />
                    <span>{grp.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-black/10'}`}>
                      {grp.participants_count || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Group Roster View */}
            {selectedGroup ? (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{selectedGroup.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Total Anggota: {groupParticipants.length} orang
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedGroup.register_token && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={copiedToken === selectedGroup.register_token ? Check : Copy}
                        onClick={() => handleCopyGroupLink(selectedGroup.register_token)}
                        title="Salin Link Registrasi Kelompok"
                      >
                        Link
                      </Button>
                    )}
                    {!isSupervisor && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={UserPlus}
                        onClick={() => setShowAddPartModal(true)}
                      >
                        Tambah Anggota
                      </Button>
                    )}
                  </div>
                </div>

                {/* Participant Roster List */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {loadingParticipants ? (
                    <p className="text-center py-6 text-xs text-slate-400">Memuat anggota...</p>
                  ) : groupParticipants.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500 space-y-1">
                      <p className="font-bold">Belum ada anggota di {selectedGroup.name}</p>
                      <p>Tambahkan peserta manual atau bagikan link pendaftaran kelompok.</p>
                    </div>
                  ) : (
                    groupParticipants.map((part) => (
                      <div
                        key={part.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-colors text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{part.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {part.phone || 'Tanpa telepon'} {part.email ? `• ${part.email}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            {part.total_points || 0} Poin
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <p className="p-8 text-center text-xs text-slate-400">
                Pilih kelompok untuk melihat daftar anggotanya.
              </p>
            )}
          </Card>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. SISTEM QRIS POIN POS GAMES (GRID OF CARDS)            */}
      {/* ======================================================== */}
      <div className={`space-y-4 ${mobileTab !== 'qris' ? 'hidden lg:block' : 'block'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <QrCode className="w-5 h-5 text-rose-600" />
              Sistem QRIS Poin Pos Games
            </h3>
            <p className="text-xs text-slate-500">
              Cetak standee atau tampilkan QRIS poin pada setiap pos tantangan event
            </p>
          </div>
          {!isSupervisor && (
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => setShowAddQrModal(true)}
            >
              Buat Pos QRIS
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pointQrs.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-xs text-slate-500">
              Belum ada pos QR poin. Klik tombol "Buat Pos QRIS" untuk membuat pos pertama!
            </div>
          ) : (
            pointQrs.map((qr) => (
              <div
                key={qr.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                      +{qr.point_value} POIN
                    </span>
                    <button
                      onClick={() => !isSupervisor && handleToggleQrStatus(qr)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                        qr.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {qr.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                    {qr.title || `Pos Poin ${qr.point_value}`}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    Token: {qr.token?.slice(0, 12)}...
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sudah di-scan: <strong className="text-slate-800">{qr.scan_count || 0} kali</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    icon={Printer}
                    onClick={() => handleViewStandee(qr)}
                  >
                    Standee QRIS
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. LOG SCAN TRANSAKSI REALTIME                           */}
      {/* ======================================================== */}
      <div className={`space-y-4 ${mobileTab !== 'history' ? 'hidden lg:block' : 'block'}`}>
        <Card padding="p-0" className="overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                Riwayat Transaksi Poin Terkini
              </h3>
              <p className="text-xs text-slate-500">Log waktu scan QRIS poin oleh peserta</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total {transactions.length} Aktivitas
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">
                Belum ada transaksi scan poin.
              </p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center flex-shrink-0">
                      +{tx.points}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {tx.participant?.name || 'Peserta'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Kelompok: <strong className="text-blue-700">{tx.group?.name || 'Tim'}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 text-[11px] text-slate-400">
                    <p className="font-semibold text-slate-700">
                      {new Date(tx.scanned_at || tx.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} WIB
                    </p>
                    <p>{new Date(tx.scanned_at || tx.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* 6. MODALS                                                */}
      {/* ======================================================== */}
      
      {/* Modal QRIS Standee */}
      <QrisStandeeModal
        isOpen={standeeModalOpen}
        onClose={() => setStandeeModalOpen(false)}
        qrData={selectedQrData}
        eventName={eventName || gameEvent?.name}
      />

      {/* Modal Scanner QR Kamera Live */}
      <GamesPointScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
        eventId={gameEvent?.id}
        onScanSuccess={() => {
          loadGameEventData();
        }}
      />

      {/* Modal Tambah Kelompok */}
      <Modal
        isOpen={showAddGroupModal}
        onClose={() => setShowAddGroupModal(false)}
        title="Tambah Kelompok Games"
        size="sm"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Kelompok / Tim:
            </label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Contoh: Tim Rajawali, Kelompok Merah..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Warna Tim:
            </label>
            <div className="grid grid-cols-6 gap-2">
              {['red', 'blue', 'emerald', 'amber', 'purple', 'cyan'].map((col) => {
                const theme = GROUP_COLORS[col];
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewGroupColor(col)}
                    className={`h-9 rounded-xl border-2 transition-all flex items-center justify-center ${theme.bg} ${
                      newGroupColor === col ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-transparent'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${theme.badge}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddGroupModal(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingGroup}
            >
              Simpan Kelompok
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah QR Poin */}
      <Modal
        isOpen={showAddQrModal}
        onClose={() => setShowAddQrModal(false)}
        title="Buat Pos QR Poin Baru"
        size="sm"
      >
        <form onSubmit={handleCreatePointQr} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Judul Pos / Nama Tantangan:
            </label>
            <input
              type="text"
              value={newPointTitle}
              onChange={(e) => setNewPointTitle(e.target.value)}
              placeholder="Contoh: Pos 1 - Yel-yel & Semangat"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nilai Poin yang Didapatkan:
            </label>
            <select
              value={newPointValue}
              onChange={(e) => setNewPointValue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {[10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200, 250, 500].map((v) => (
                <option key={v} value={v}>
                  +{v} Poin
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddQrModal(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingQr}
            >
              Generate QRIS Poin
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah Peserta ke Kelompok */}
      <Modal
        isOpen={showAddPartModal}
        onClose={() => setShowAddPartModal(false)}
        title={`Tambah Anggota ke ${selectedGroup?.name || 'Kelompok'}`}
        size="sm"
      >
        <form onSubmit={handleAddParticipant} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Peserta:
            </label>
            <input
              type="text"
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
              placeholder="Nama anggota"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor WhatsApp / HP:
            </label>
            <input
              type="tel"
              value={newPartPhone}
              onChange={(e) => setNewPartPhone(e.target.value)}
              placeholder="0812xxxxxxxx"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email (Opsional):
            </label>
            <input
              type="email"
              value={newPartEmail}
              onChange={(e) => setNewPartEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddPartModal(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingPart}
            >
              Simpan Anggota
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default GamesEventSection;
