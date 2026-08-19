import React, { useEffect, useState } from 'react';
import { UserPlus, Edit2, Trash2, Shield, Search, Settings, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const AVAILABLE_FEATURES = [
  { id: 'dashboard', label: 'Dashboard', description: 'Akses halaman dashboard' },
  { id: 'checkin', label: 'Check-In Tamu', description: 'Check-in tamu baru' },
  { id: 'active_visitors', label: 'Tamu Aktif', description: 'Lihat tamu yang sedang di lokasi' },
  { id: 'visit_history', label: 'Riwayat Kunjungan', description: 'Lihat log kunjungan' },
  { id: 'visitors', label: 'Data Tamu', description: 'Kelola database tamu' },
  { id: 'events', label: 'Manajemen Event', description: 'Kelola event perusahaan' },
  { id: 'quick_checkin', label: 'Quick Check-In Event', description: 'Quick scan di halaman event' },
];

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [currentUserFeatures, setCurrentUserFeatures] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data?.data || response.data || []);
    } catch (err) {
      toast.error('Gagal memuat data petugas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'receptionist',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'receptionist',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Update - password optional
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await userService.updateUser(editingUser.id, updateData);
        toast.success('Petugas berhasil diperbarui');
      } else {
        // Create - password required
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password minimal 6 karakter');
          return;
        }
        await userService.createUser(formData);
        toast.success('Petugas berhasil ditambahkan');
      }

      handleCloseModal();
      loadUsers();
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal menyimpan data';
      toast.error(message);
      console.error(err);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Hapus petugas ${user.name}?`)) return;

    try {
      await userService.deleteUser(user.id);
      toast.success('Petugas berhasil dihapus');
      loadUsers();
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal menghapus petugas';
      toast.error(message);
      console.error(err);
    }
  };

  const handleOpenFeaturesModal = (user) => {
    setCurrentUserFeatures({
      userId: user.id,
      userName: user.name,
      role: user.role,
      disabled: user.disabled_features || [],
    });
    setShowFeaturesModal(true);
  };

  const handleCloseFeaturesModal = () => {
    setShowFeaturesModal(false);
    setCurrentUserFeatures(null);
  };

  const handleToggleFeature = (featureId) => {
    setCurrentUserFeatures((prev) => {
      const disabled = prev.disabled || [];
      const isDisabled = disabled.includes(featureId);
      return {
        ...prev,
        disabled: isDisabled
          ? disabled.filter((id) => id !== featureId)
          : [...disabled, featureId],
      };
    });
  };

  const handleSaveFeatures = async () => {
    try {
      await userService.updateUser(currentUserFeatures.userId, {
        disabled_features: currentUserFeatures.disabled,
      });
      toast.success('Akses fitur berhasil diperbarui');
      handleCloseFeaturesModal();
      loadUsers();
    } catch (err) {
      toast.error('Gagal memperbarui akses fitur');
      console.error(err);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'red', label: 'Admin' },
      receptionist: { color: 'blue', label: 'Resepsionis' },
      supervisor: { color: 'green', label: 'Supervisor' },
    };
    const config = roleConfig[role] || { color: 'gray', label: role };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6" />
          <h1 className="text-2xl md:text-3xl font-bold">Kelola Petugas</h1>
        </div>
        <p className="text-sm text-purple-100">
          Manajemen akun admin, resepsionis, dan supervisor sistem
        </p>
      </div>

      {/* Actions Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Tambah Petugas
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data petugas
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenFeaturesModal(user)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Kelola Akses Fitur"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingUser ? 'Edit Petugas' : 'Tambah Petugas Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password {editingUser && '(kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={6}
                  required={!editingUser}
                />
                <p className="text-xs text-slate-500 mt-1">Minimal 6 karakter</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="receptionist">Resepsionis</option>
                  <option value="supervisor">Supervisor</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.role === 'admin' && 'Akses penuh sistem'}
                  {formData.role === 'receptionist' && 'Operasional check-in/out'}
                  {formData.role === 'supervisor' && 'Monitoring & laporan'}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  {editingUser ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Akses Fitur */}
      {showFeaturesModal && currentUserFeatures && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Kelola Akses Fitur</h3>
                <p className="text-sm text-slate-500">
                  {currentUserFeatures.userName} ({currentUserFeatures.role})
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {AVAILABLE_FEATURES.map((feature) => {
                const isDisabled = currentUserFeatures.disabled.includes(feature.id);
                return (
                  <div
                    key={feature.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition ${
                      isDisabled
                        ? 'border-red-200 bg-red-50'
                        : 'border-emerald-200 bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isDisabled
                            ? 'bg-red-100 text-red-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {isDisabled ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{feature.label}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{feature.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFeature(feature.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                        isDisabled
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {isDisabled ? 'Aktifkan' : 'Nonaktifkan'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseFeaturesModal}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="button" onClick={handleSaveFeatures} className="flex-1">
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

