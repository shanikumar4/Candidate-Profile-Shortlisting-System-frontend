import useAuthStore from '../../store/authStore';

const Topbar = ({ title, subtitle, actions }) => {
  const { user } = useAuthStore();

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 220,
        width: 'calc(100% - 220px)',
        height: 56,
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
        zIndex: 100,
        display: 'flex', alignItems: 'center',
        padding: '0 20px',
        gap: 12,
      }}>


        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, minWidth: 0 }}>
          {/* Title spacer */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
                {title}
              </h1>
              {subtitle && (
                <span className="hidden sm:inline-block" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}>
                  — {subtitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions & Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} className="hidden sm:block" />

          {user && (
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, flexShrink: 0,
              cursor: 'pointer',
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 56, width: '100%', flexShrink: 0 }} />
    </>
  );
};

export default Topbar;
