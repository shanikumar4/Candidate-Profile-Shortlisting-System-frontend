import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layout
import Sidebar from './components/layout/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import JobsListPage from './pages/JobsListPage';
import JobDetailPage from './pages/JobDetailPage';
import AllCandidatesPage from './pages/AllCandidatesPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import BiasReportPage from './pages/BiasReportPage';
import SettingsPage from './pages/SettingsPage';
import PublicApplicationForm from './pages/PublicApplicationForm';
import AcceptInvitePage from './pages/AcceptInvitePage';
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage';

const AppLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ position: 'relative', zIndex: 10, marginLeft: 220, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {typeof children === 'function' ? children({}) : children}
      </main>
    </div>
  );
};

// Auth guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public-only guard (redirect logged-in users away from login)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return user?.role === 'superadmin' ? <Navigate to="/superadmin" replace /> : <Navigate to="/dashboard" replace />;
  }
  return children;
};

// SuperAdmin guard
const SuperAdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'superadmin') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            borderRadius: 8,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-modal)',
          },
          success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/accept-invite" element={<PublicRoute><AcceptInvitePage /></PublicRoute>} />
        <Route path="/apply/:slug" element={<PublicApplicationForm />} />

        {/* SuperAdmin routes */}
        <Route path="/superadmin" element={
          <SuperAdminRoute>
            <AppLayout>
              {({ onMenuClick }) => <SuperAdminDashboardPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </SuperAdminRoute>
        } />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {user?.role === 'superadmin' ? <Navigate to="/superadmin" replace /> : (
              <AppLayout>
                {({ onMenuClick }) => <DashboardPage onMenuClick={onMenuClick} />}
              </AppLayout>
            )}
          </ProtectedRoute>
        } />
        <Route path="/jobs" element={
          <ProtectedRoute>
            <AppLayout>
              {({ onMenuClick }) => <JobsListPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/jobs/:id" element={
          <ProtectedRoute>
            <AppLayout>
              {({ onMenuClick }) => <JobDetailPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/candidates" element={
          <ProtectedRoute>
            <AppLayout>
              {({ onMenuClick }) => <AllCandidatesPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/candidates/:id" element={
          <ProtectedRoute>
            <AppLayout>
              {({ onMenuClick }) => <CandidateProfilePage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AppLayout>
              {({ onMenuClick }) => <AnalyticsPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/bias" element={
          <ProtectedRoute>
            <AppLayout>
              {({ onMenuClick }) => <BiasReportPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout>
              {({ onMenuClick }) => <SettingsPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
