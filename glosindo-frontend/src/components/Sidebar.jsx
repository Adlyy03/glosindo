import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Zap,
  Camera,
  UserCheck,
  History,
  Users,
  UserCog,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { LOGO, APP_NAME } from '../constants';

const navSections = [
  {
    title: 'UTAMA',
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        roles: ['admin', 'receptionist'],
        icon: LayoutDashboard,
        badge: null,
      },
      {
        label: 'Quick Check-In/Out',
        to: '/quick-check-in',
        roles: ['admin', 'receptionist'],
        icon: Zap,
        badge: 'Auto',
      },
    ]
  },
  {
    title: 'MANAJEMEN TAMU',
    items: [
      {
        label: 'Check-In Tamu',
        to: '/check-in',
        roles: ['admin', 'receptionist'],
        icon: Camera,
        badge: null,
      },
      {
        label: 'Tamu Aktif',
        to: '/active-visitors',
        roles: ['admin', 'receptionist'],
        icon: UserCheck,
        badge: null,
      },
      {
        label: 'Riwayat Kunjungan',
        to: '/visit-history',
        roles: ['admin', 'receptionist'],
        icon: History,
        badge: null,
      },
      {
        label: 'Data Tamu',
        to: '/visitors',
        roles: ['admin', 'receptionist'],
        icon: Users,
        badge: null,
      },
    ]
  },
  {
    title: 'SISTEM & PETUGAS',
    items: [
      {
        label: 'Kelola Petugas',
        to: '/users',
        roles: ['admin'],
        icon: UserCog,
        badge: 'Admin',
      },
      {
        label: 'Konfigurasi',
        to: '/settings',
        roles: ['admin'],
        icon: Settings,
        badge: 'Admin',
      },
    ]
  }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = async () => {
    await logout();
    toast.success('Berhasil logout');
    navigate('/login');
  };

  // Get user initials (max 2 letters)
  const getUserInitials = (name) => {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-white border-r border-slate-100 shadow-2xl lg:shadow-none
          transition-transform duration-300 ease-out w-[270px] flex flex-col justify-between select-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* SIMONIK Style Brand Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1 shadow-sm border border-slate-200/80 flex-shrink-0">
                <img src={LOGO} alt={APP_NAME} className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-[#2b3674] tracking-tight leading-tight">
                  GLOSINDO
                </h1>
                <p className="text-[11px] font-semibold text-[#8f9bba]">
                  Digital Guestbook
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Categorized with SIMONIK Lavender Active Theme) */}
          <div className="flex-1 px-4 py-4 space-y-5 overflow-y-auto">
            {navSections.map((section) => {
              const visibleItems = section.items.filter((item) => item.roles.includes(role));
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title}>
                  <p className="px-3.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#a3b1cc] mb-2">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => window.innerWidth < 1024 && onClose && onClose()}
                          className={({ isActive }) =>
                            `group flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 min-h-[46px]
                            ${
                              isActive
                                ? 'bg-[#edf0ff] text-[#4c65e8] font-bold shadow-xs'
                                : 'text-[#4a5568] hover:bg-slate-50 hover:text-[#2b3674]'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className="flex items-center gap-3">
                                <IconComponent
                                  className={`w-5 h-5 transition-colors ${
                                    isActive ? 'text-[#4c65e8]' : 'text-[#718096] group-hover:text-[#4c65e8]'
                                  }`}
                                />
                                <span className={isActive ? 'font-bold' : 'font-semibold'}>{item.label}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {item.badge && (
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                      isActive
                                        ? 'bg-white text-[#4c65e8] shadow-2xs'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                                {isActive && (
                                  <span className="w-2 h-2 rounded-full bg-[#4c65e8] shadow-xs" />
                                )}
                              </div>
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SIMONIK Style Bottom User Pill Card */}
        <div className="p-3.5 m-3.5 rounded-2xl bg-[#edf0ff] border border-blue-100/60 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-[#4c65e8] text-white font-extrabold text-xs flex items-center justify-center shadow-sm flex-shrink-0">
              {getUserInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-[#2b3674] truncate leading-snug">
                {user?.name || 'Petugas'}
              </p>
              <p className="text-[11px] text-[#8f9bba] font-medium capitalize truncate">
                {role || 'User'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white/60 rounded-xl transition-all cursor-pointer ml-1 flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
