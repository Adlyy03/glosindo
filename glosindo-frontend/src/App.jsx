import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CheckInCameraPage from './pages/CheckInCameraPage';
import CheckInPage from './pages/CheckInPage';
import QuickCheckInPage from './pages/QuickCheckInPage';
import ActiveVisitorPage from './pages/ActiveVisitorPage';
import VisitHistoryPage from './pages/VisitHistoryPage';
import VisitorListPage from './pages/VisitorListPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import ReceptionistCheckInPage from './pages/receptionist/ReceptionistCheckInPage';
import ReceptionistActivePage from './pages/receptionist/ReceptionistActivePage';
import ReceptionistHistoryPage from './pages/receptionist/ReceptionistHistoryPage';
import ReceptionistVisitorPage from './pages/receptionist/ReceptionistVisitorPage';

function App() {
  const { isAuthenticated, restoreSession } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

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
          duration: 3000,
          style: { fontSize: '14px', borderRadius: '10px' },
        }}
      />

      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className={`transition-all duration-300 flex-1 flex flex-col ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
                  <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/quick-check-in" element={<QuickCheckInPage />} />
                      <Route path="/check-in" element={<CheckInCameraPage />} />
                      <Route path="/check-in/manual" element={<CheckInPage />} />
                      <Route path="/active-visitors" element={<ActiveVisitorPage />} />
                      <Route path="/visit-history" element={<VisitHistoryPage />} />
                      <Route path="/visitors" element={<VisitorListPage />} />
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
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
