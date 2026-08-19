import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * FeatureGate — redirect if feature disabled for current user
 */
const FeatureGate = ({ featureId, children }) => {
  const { user, isFeatureDisabled } = useAuthStore();

  if (isFeatureDisabled(featureId)) {
    const ROUTE_PRIORITY = [
      { path: '/dashboard', featureId: 'dashboard' },
      { path: '/check-in', featureId: 'checkin' },
      { path: '/active-visitors', featureId: 'active_visitors' },
      { path: '/visit-history', featureId: 'visit_history' },
      { path: '/visitors', featureId: 'visitors' },
      { path: '/events', featureId: 'events' },
      { path: '/users', featureId: null, roles: ['admin'] },
      { path: '/settings', featureId: null, roles: ['admin'] },
    ];

    const firstAvailable = ROUTE_PRIORITY.find((route) => {
      if (route.roles && !route.roles.includes(user?.role)) return false;
      if (route.featureId && isFeatureDisabled(route.featureId)) return false;
      return true;
    });

    return <Navigate to={firstAvailable?.path || '/dashboard'} replace />;
  }

  return children;
};

export default FeatureGate;
