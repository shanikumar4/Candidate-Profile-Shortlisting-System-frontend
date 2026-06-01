import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { warmServer } from './api/index';
import {
  LayoutDashboard, Users, Briefcase, BarChart2, Settings, Menu
} from 'lucide-react';

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

// Bottom nav items for mobile
const BOTTOM_NAV = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/candidates', label: 'People', icon: Users },
  { to: '/analytics', label: 'Stats', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const BottomNav = ({ user }) => {
  const location = useLocation();
  const items = user?.role === 'superadmin'
    ? [{ to: '/superadmin', label: 'Companies', icon: Briefcase }]
    : BOTTOM_NAV;

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {items.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

const AppLayout = ({ children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="app-main">
        {typeof children === 'function'
          ? children({ onMenuClick: () => setSidebarOpen(true) })
          : children}
      </main>
      <BottomNav user={user} />
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

  // Pre-warm the Render free-tier backend silently on first mount
  useEffect(() => { warmServer(); }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 13,
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
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
            <AppLayout user={user}>
              {({ onMenuClick }) => <SuperAdminDashboardPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </SuperAdminRoute>
        } />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {user?.role === 'superadmin' ? <Navigate to="/superadmin" replace /> : (
              <AppLayout user={user}>
                {({ onMenuClick }) => <DashboardPage onMenuClick={onMenuClick} />}
              </AppLayout>
            )}
          </ProtectedRoute>
        } />
        <Route path="/jobs" element={
          <ProtectedRoute>
            <AppLayout user={user}>
              {({ onMenuClick }) => <JobsListPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/jobs/:id" element={
          <ProtectedRoute>
            <AppLayout user={user}>
              {({ onMenuClick }) => <JobDetailPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/candidates" element={
          <ProtectedRoute>
            <AppLayout user={user}>
              {({ onMenuClick }) => <AllCandidatesPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/candidates/:id" element={
          <ProtectedRoute>
            <AppLayout user={user}>
              {({ onMenuClick }) => <CandidateProfilePage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AppLayout user={user}>
              {({ onMenuClick }) => <AnalyticsPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/bias" element={
          <ProtectedRoute>
            <AppLayout user={user}>
              {({ onMenuClick }) => <BiasReportPage onMenuClick={onMenuClick} />}
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout user={user}>
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
