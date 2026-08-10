import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * ProtectedRoute — blocks unauthenticated users and optionally enforces role.
 * If the user is authenticated but lacks access, render a dedicated 403 page.
 * @param {string[]} allowedRoles - optional, e.g. ['admin']
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-sm border border-gray-200">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.789-2.894L13.789 4.894a2 2 0 00-3.578 0L3.282 16.106A2 2 0 005.071 19z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">403 Unauthorized</h1>
          <p className="mt-2 text-sm text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
