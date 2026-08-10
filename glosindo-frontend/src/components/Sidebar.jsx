import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    roles: ['admin', 'receptionist'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Quick Check-In/Out',
    to: '/quick-check-in',
    roles: ['admin', 'receptionist'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: 'Check-In Tamu',
    to: '/check-in',
    roles: ['admin', 'receptionist'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    label: 'Tamu Aktif',
    to: '/active-visitors',
    roles: ['admin', 'receptionist'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Riwayat Kunjungan',
    to: '/visit-history',
    roles: ['admin', 'receptionist'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Data Tamu',
    to: '/visitors',
    roles: ['admin', 'receptionist'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: 'Kelola Petugas',
    to: '/users',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Konfigurasi',
    to: '/settings',
    roles: ['admin'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.894 3.31.713 2.417 2.257a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.894 1.543-.713 3.31-2.257 2.417a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.894-3.31-.713-2.417-2.257a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.894-1.543.713-3.31 2.257-2.417a1.724 1.724 0 002.573-1.066z" />
      </svg>
    ),
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const role = user?.role;

  const visible = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose} 
        />
      )}
      
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 bg-white border-r border-gray-200 shadow-lg
          transition-transform duration-300 ease-in-out w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
      {/* Brand header */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100 bg-blue-700">
        <span className="text-white font-bold text-lg tracking-wide">GLOSINDO</span>
      </div>

      <nav className="py-4 px-3">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => window.innerWidth < 1024 && onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors
              ${isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Role badge at bottom */}
      <div className="absolute bottom-4 left-3 right-3">
        <div className="px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Login sebagai</p>
          <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
            ${role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
            {role}
          </span>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
