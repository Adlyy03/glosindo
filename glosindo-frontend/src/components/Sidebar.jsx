import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Camera,
  UserCheck,
  History,
  Users,
  UserCog,
  Settings,
  Shield,
  ChevronRight,
  X
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { LOGO, APP_NAME } from '../constants';

const navItems = [
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
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const role = user?.role;

  const visible = navItems.filter((item) => item.roles.includes(role));

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
          fixed top-0 left-0 h-full z-50 bg-white border-r border-slate-200/90 shadow-2xl lg:shadow-none
          transition-transform duration-300 ease-out w-72 flex flex-col justify-between select-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div>
          {/* Brand header */}
          <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-brand-navy to-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <img src={LOGO} alt={APP_NAME} className="h-9 w-9 object-contain" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-wide text-white leading-tight">
                  GLOSINDO
                </h1>
                <p className="text-[11px] text-cyan-200 font-medium tracking-wider uppercase">
                  Digital Guestbook
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="px-3 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Menu Utamal
            </p>

            {visible.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => window.innerWidth < 1024 && onClose && onClose()}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[48px]
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-navy to-slate-800 text-white shadow-md shadow-brand-navy/20'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <IconComponent
                          className={`w-5 h-5 transition-colors ${
                            isActive ? 'text-brand-cyan-light' : 'text-slate-400 group-hover:text-brand-navy'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isActive ? 'opacity-100 text-brand-cyan-light' : 'text-slate-400'
                          }`}
                        />
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User Role Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 m-3 rounded-2xl border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium">Pengguna Logged In</p>
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Petugas'}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
            <span className="text-slate-500 font-medium">Akses:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] flex items-center gap-1 ${
                role === 'admin'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              {role}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
