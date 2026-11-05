import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import * as faceapi from 'face-api.js';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import FeatureGate from './components/FeatureGate';
import {
  LandingPage,
  LoginPage,
  DashboardPage,
  CheckInCameraPage,
  CheckInPage,
  QuickCheckInPage,
  ActiveVisitorPage,
  VisitHistoryPage,
  VisitorListPage,
  GuestVisitPage,
  PublicGuestRegisterPage,
  PublicEventRegisterPage,
  EventListPage,
  EventFormPage,
  EventDetailPage,
  GamesEventListPage,
  GamesEventFormPage,
  GamesEventDetailPage,
  GamesPublicRegisterPage,
  GamesScanPointPage,
  ReceptionistCheckInPage,
  ReceptionistActivePage,
  ReceptionistHistoryPage,
  ReceptionistVisitorPage,
  AdminUsersPage,
  AdminSettingsPage,
  AdminReservationPage,
  PublicReservationPage,
} from './pages';
import PwaOfflineBanner from './components/PwaOfflineBanner';

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

const DefaultRedirect = () => {
  const navigate = useNavigate();
  const { user, isFeatureDisabled } = useAuthStore();

  useEffect(() => {
    const firstAvailable = ROUTE_PRIORITY.find((route) => {
      if (route.roles && !route.roles.includes(user?.role)) return false;
      if (route.featureId && isFeatureDisabled(route.featureId)) return false;
      return true;
    });
    navigate(firstAvailable?.path || '/dashboard', { replace: true });
  }, [navigate, user, isFeatureDisabled]);

  return null;
};

function App() {
  const { isAuthenticated, restoreSession } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api.js models on app init (lightweight tiny models)
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log('Face-api.js tiny biometric models loaded successfully');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Failed to load face-api.js models:', error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '15px',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)',
            fontWeight: '600',
          },
          success: {
            iconTheme: {
              primary: '#0ea5e9',
              secondary: '#ffffff',
            },
            style: {
              border: '2px solid #0ea5e9',
              backgroundColor: '#f0f9ff',
              color: '#1e3a8a',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
            style: {
              border: '2px solid #ef4444',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
            },
          },
          loading: {
            iconTheme: {
              primary: '#1e3a8a',
              secondary: '#ffffff',
            },
            style: {
              border: '2px solid #1e3a8a',
              backgroundColor: '#eff6ff',
              color: '#1e3a8a',
            },
          },
        }}
      />

      <PwaOfflineBanner />

      <Routes>
        {/* Public Landing & Marketing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/beranda" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />

        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <DefaultRedirect /> : <LoginPage />}
        />
        <Route path="/register" element={<PublicGuestRegisterPage />} />
        <Route path="/guest-register" element={<PublicGuestRegisterPage />} />
        <Route path="/guest/register" element={<PublicGuestRegisterPage />} />
        <Route path="/registrasi-tamu" element={<PublicGuestRegisterPage />} />
        <Route path="/guest-registration" element={<PublicGuestRegisterPage />} />

        {/* Public Event Registration routes */}
        <Route path="/event/:code/register" element={<PublicEventRegisterPage />} />
        <Route path="/events/:code/register" element={<PublicEventRegisterPage />} />

        {/* Public Games Routes */}
        <Route path="/games/register/:token" element={<GamesPublicRegisterPage />} />
        <Route path="/games/scan-point" element={<GamesScanPointPage />} />

        {/* Public Pre-Registration Reservation */}
        <Route path="/reservasi/:token" element={<PublicReservationPage />} />

        {/* Guest Visit Kiosk - Admin / Staff Authenticated Only */}
        <Route
          path="/guest-visit"
          element={isAuthenticated ? <GuestVisitPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/kunjungan-tamu"
          element={isAuthenticated ? <GuestVisitPage /> : <Navigate to="/login" replace />}
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className={`transition-all duration-300 flex-1 flex flex-col ${sidebarOpen ? 'lg:pl-[270px]' : 'lg:pl-0'}`}>
                  <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/dashboard" element={<FeatureGate featureId="dashboard"><DashboardPage /></FeatureGate>} />
                      <Route path="/check-in" element={<FeatureGate featureId="checkin"><CheckInCameraPage /></FeatureGate>} />
                      <Route path="/check-in/manual" element={<FeatureGate featureId="checkin"><CheckInPage /></FeatureGate>} />
                      <Route path="/quick-check-in" element={<FeatureGate featureId="checkin"><QuickCheckInPage /></FeatureGate>} />
                      <Route path="/active-visitors" element={<FeatureGate featureId="active_visitors"><ActiveVisitorPage /></FeatureGate>} />
                      <Route path="/visit-history" element={<FeatureGate featureId="visit_history"><VisitHistoryPage /></FeatureGate>} />
                      <Route path="/visitors" element={<FeatureGate featureId="visitors"><VisitorListPage /></FeatureGate>} />
                      <Route path="/reservations/invitations" element={<AdminReservationPage />} />
                      <Route path="/reservations" element={<AdminReservationPage />} />
                      {/* Events */}
                      <Route path="/events" element={<FeatureGate featureId="events"><EventListPage /></FeatureGate>} />
                      <Route path="/events/new" element={<FeatureGate featureId="events"><EventFormPage /></FeatureGate>} />
                      <Route path="/events/:id" element={<FeatureGate featureId="events"><EventDetailPage /></FeatureGate>} />
                      <Route path="/events/:id/edit" element={<FeatureGate featureId="events"><EventFormPage /></FeatureGate>} />
                      {/* Games Events */}
                      <Route path="/games/events" element={<GamesEventListPage />} />
                      <Route path="/games/events/new" element={<GamesEventFormPage />} />
                      <Route path="/games/events/:id" element={<GamesEventDetailPage />} />
                      <Route path="/games/events/:id/edit" element={<GamesEventFormPage />} />
                      <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
                        <Route path="/receptionist/check-in" element={<ReceptionistCheckInPage />} />
                        <Route path="/receptionist/active" element={<ReceptionistActivePage />} />
                        <Route path="/receptionist/history" element={<ReceptionistHistoryPage />} />
                        <Route path="/receptionist/visitors" element={<ReceptionistVisitorPage />} />
                      </Route>
                      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/users" element={<AdminUsersPage />} />
                        <Route path="/settings" element={<AdminSettingsPage />} />
                      </Route>
                      <Route path="/" element={<DefaultRedirect />} />
                      <Route path="*" element={<DefaultRedirect />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
