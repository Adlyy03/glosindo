import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Menu, LogOut, Clock, ShieldCheck, User } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { LOGO, APP_NAME } from '../constants';
import PublicRegistrationToggle from './PublicRegistrationToggle';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Berhasil logout');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger + Corporate Identity */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2.5 rounded-xl text-slate-600 hover:text-brand-navy hover:bg-slate-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 active:scale-95"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative p-1 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center">
              <img src={LOGO} alt={APP_NAME} className="h-8 w-8 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-bold text-brand-navy tracking-tight">
                  GLOSINDO
                </span>
                <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  Glide GuestBook
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block leading-tight font-medium">
                Global Media Pratama Solusindo
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Kiosk Clock */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-inner">
          <div className="flex items-center gap-2 text-brand-navy">
            <Clock className="w-4 h-4 text-brand-cyan" />
            <span className="text-sm font-bold tracking-wide font-mono">{currentTime}</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="text-xs font-medium text-slate-600">{currentDate}</span>
        </div>

        {/* Right: User Profile & Security Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Petugas'}</p>
              <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500 capitalize">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{user?.role || 'User'}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#4c65e8] text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/20 border border-blue-400/30">
              {user?.name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
