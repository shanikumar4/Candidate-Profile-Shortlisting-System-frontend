import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, BarChart2,
  Shield, Settings, LogOut
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const TENANT_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/candidates', label: 'Candidates', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/bias', label: 'Bias Report', icon: Shield, roles: ['admin', 'manager'] },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const SUPER_ADMIN_NAV_ITEMS = [
  { to: '/superadmin', label: 'Companies', icon: Briefcase },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navItems = user?.role === 'superadmin' 
    ? SUPER_ADMIN_NAV_ITEMS 
    : TENANT_NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <>

      {/* Sidebar Component */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '220px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo section at top */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--text-primary)' }}>Hire</span>
            <span style={{ color: 'var(--accent)' }}>IQ</span>
          </span>
        </div>

        {/* Nav list */}
        <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  height: 36, padding: '0 10px',
                  borderRadius: 6,
                  marginBottom: 2,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  fontWeight: isActive ? 500 : 400,
                  fontSize: 14,
                  textDecoration: 'none',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: 0 }}>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom user section */}
        <div style={{
          padding: '16px 16px 20px',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 8,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            aria-label="Sign out"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', height: 32, padding: '0 10px',
              background: 'none', border: 'none',
              borderRadius: 6,
              color: 'var(--text-muted)',
              fontSize: 13, fontWeight: 400,
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-dim)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <LogOut size={14} strokeWidth={1.5} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
