import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { updateProfile } from '../../api/auth';
import { LogOut, Menu } from 'lucide-react';

const Topbar = ({ title, subtitle, actions, onMenuClick }) => {
  const { user, updateUser, logout } = useAuthStore();

  const [profileModal, setProfileModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit-profile' | 'change-password'
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleOpenProfile = () => {
    setModalMode('view');
    setProfileModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const data = {};
      if (modalMode === 'edit-profile') {
        data.name = name;
      } else if (modalMode === 'change-password') {
        data.password = password;
        data.currentPassword = currentPassword;
      }

      const res = await updateProfile(data);
      updateUser(res.user);
      toast.success('Profile updated successfully');
      setModalMode('view');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div
        className="topbar-responsive"
        style={{
          position: 'fixed',
          top: 0,
          left: 'var(--sidebar-width)',
          width: 'calc(100% - var(--sidebar-width))',
          height: 'var(--topbar-height)',
          background: 'rgba(14, 17, 23, 0.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 12,
        }}
      >
        {/* Hamburger menu button — visible on tablet/mobile */}
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="menu-toggle-btn"
          style={{ marginRight: 4 }}
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, minWidth: 0 }}>
          {/* Title */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <h1 style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {title}
            </h1>
            {subtitle && (
              <span
                className="hide-mobile"
                style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  fontWeight: 400,
                  whiteSpace: 'nowrap',
                }}
              >
                — {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Actions & Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {actions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {actions}
            </div>
          )}

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} className="hide-mobile" />

          {user && (
            <button
              onClick={handleOpenProfile}
              aria-label="Open profile"
              title={user.name}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--ai))',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontSize: 13,
                fontWeight: 800,
                flexShrink: 0,
                cursor: 'pointer',
                boxShadow: '0 0 0 2px var(--accent-border)',
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </button>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <Modal isOpen={profileModal} onClose={() => setProfileModal(false)} title="My Profile">
        {modalMode === 'view' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Avatar card */}
            <div style={{
              padding: 24,
              background: 'var(--bg-base)',
              borderRadius: 10,
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--ai))',
                color: '#000', fontSize: 26, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 4px var(--accent-border)',
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{user?.email}</div>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--accent)',
                }}>
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Button
                variant="secondary"
                onClick={() => { setName(user?.name || ''); setModalMode('edit-profile'); }}
                style={{ justifyContent: 'center' }}
              >
                Edit Profile
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setPassword(''); setCurrentPassword(''); setModalMode('change-password'); }}
                style={{ justifyContent: 'center' }}
              >
                Change Password
              </Button>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="ghost"
                icon={<LogOut size={16} />}
                onClick={() => { setProfileModal(false); logout(); }}
                style={{ color: 'var(--danger)' }}
              >
                Logout
              </Button>
            </div>
          </div>
        )}

        {modalMode === 'edit-profile' && (
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Update your profile information.</div>
            <Input
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button type="button" variant="secondary" onClick={() => setModalMode('view')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}

        {modalMode === 'change-password' && (
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Enter your current password and a new password.</div>
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button type="button" variant="secondary" onClick={() => setModalMode('view')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={updating}>
                {updating ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Spacer for fixed topbar */}
      <div style={{ height: 'var(--topbar-height)', width: '100%', flexShrink: 0 }} />
    </>
  );
};

export default Topbar;
