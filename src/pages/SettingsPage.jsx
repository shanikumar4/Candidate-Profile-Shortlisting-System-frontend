import { useEffect, useState } from 'react';
import { Users, Settings, Shield, Plus, Check, CheckCircle2 } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import TagInput from '../components/ui/TagInput';
import { SkeletonTable } from '../components/ui/Skeleton';
import { getUsers, inviteUser, updateUser } from '../api/auth';
import { getCompany, updateCompany } from '../api/bias';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const SettingsPage = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteDepartment, setInviteDepartment] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [teamSkills, setTeamSkills] = useState([]);
  const [savingSkills, setSavingSkills] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const loadData = async () => {
    try {
      const [u, c] = await Promise.all([getUsers(), getCompany()]);
      setUsers(u.users || []);
      setCompany(c.company);
      setTeamSkills(c.company?.teamSkills || []);
      setCompanyName(c.company?.name || '');
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    loadData(); 
    if (user?.role === 'superadmin') setInviteRole('admin');
    else if (user?.role === 'hr') setInviteRole('manager');
    else setInviteRole('hr');
  }, [user]);

  const handleInvite = async () => {
    if (!inviteEmail) { toast.error('Email required'); return; }
    if (inviteRole === 'manager' && !inviteDepartment.trim()) { toast.error('Department required for managers'); return; }
    
    setInviting(true);
    try {
      const res = await inviteUser(inviteEmail, inviteRole, inviteRole === 'manager' ? inviteDepartment.trim() : undefined);
      setInviteLink(res.inviteLink);
      toast.success('Invite created!');
      setInviteEmail('');
      setInviteDepartment('');
      loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Invite failed'); }
    finally { setInviting(false); }
  };

  const handleUpdateUser = async (id, data) => {
    try {
      await updateUser(id, data);
      toast.success('User updated');
      loadData();
    } catch { toast.error('Update failed'); }
  };

  const handleSaveCompany = async () => {
    setSavingSkills(true);
    try {
      await updateCompany({ teamSkills });
      toast.success('Company settings saved');
    } catch { toast.error('Save failed'); }
    finally { setSavingSkills(false); }
  };

  const getRoleStyle = (role) => {
    if (role === 'admin') return { bg: 'var(--accent-dim)', color: 'var(--accent)', border: 'var(--accent-border)' };
    if (role === 'manager') return { bg: 'var(--warning-dim)', color: 'var(--warning)', border: 'var(--warning)' };
    return { bg: 'var(--ai-dim)', color: 'var(--ai)', border: 'var(--ai-border)' };
  };

  const getStatusStyle = (status) => {
    if (status === 'active') return { bg: 'var(--success-dim)', color: 'var(--success)' };
    if (status === 'pending') return { bg: 'var(--warning-dim)', color: 'var(--warning)' };
    return { bg: 'var(--danger-dim)', color: 'var(--danger)' };
  };

  return (
    <div className="page-enter">
      <Topbar title="Settings" subtitle="Team management and company configuration" onMenuClick={onMenuClick} />

      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto', width: '100%' }}>

        {/* Company Settings */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company Configuration</span>
          </div>
          <div style={{ padding: '24px 24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ maxWidth: 400 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Company Name
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 14, fontWeight: 500 }}>
                {companyName}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={14} /> Current Team Skills
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6, maxWidth: 600 }}>
                Add your existing team's skills. AI will use this to calculate a "Team Fit" score — how well each candidate fills skill gaps on your team.
              </p>
              <div style={{ maxWidth: 600 }}>
                <TagInput
                  tags={teamSkills}
                  onChange={setTeamSkills}
                  placeholder="React, Node.js, PostgreSQL..."
                  id="team-skills"
                  disabled={user?.role === 'manager'}
                />
              </div>
            </div>
            {user?.role !== 'manager' && (
              <div>
                <Button icon={<Check size={16} />} onClick={handleSaveCompany} loading={savingSkills}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Team Management */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team Members</span>
            </div>
            {user?.role !== 'manager' && (
              <Button size="sm" icon={<Plus size={14} />} onClick={() => setInviteModal(true)}>
                Invite User
              </Button>
            )}
          </div>

          {loading ? <SkeletonTable rows={4} /> : (
            <table className="hiq-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rs = getRoleStyle(u.role);
                  const ss = getStatusStyle(u.status);
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--bg-overlay)', border: '1px solid var(--border-strong)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-primary)', fontSize: 13, fontWeight: 700,
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="primary-text">{u.name}</div>
                            <div className="secondary-text">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 12, fontWeight: 500, color: ss.color, display: 'flex', alignItems: 'center', gap: 6
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                          <span style={{ textTransform: 'capitalize' }}>{u.status}</span>
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td>
                        {u._id !== user?._id && user?.role === 'admin' && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            {u.status === 'active' ? (
                              <Button variant="danger" size="sm" onClick={() => handleUpdateUser(u._id, { status: 'disabled' })}>
                                Disable
                              </Button>
                            ) : u.status === 'disabled' ? (
                              <Button variant="ghost" size="sm" onClick={() => handleUpdateUser(u._id, { status: 'active' })}>
                                Enable
                              </Button>
                            ) : null}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={inviteModal}
        onClose={() => { setInviteModal(false); setInviteLink(''); setInviteEmail(''); setInviteDepartment(''); }}
        title="Invite Team Member"
        footer={!inviteLink ? (
          <>
            <Button variant="ghost" onClick={() => setInviteModal(false)}>Cancel</Button>
            <Button loading={inviting} icon={<Plus size={14} />} onClick={handleInvite}>Send Invite</Button>
          </>
        ) : null}
      >
        {inviteLink ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--success)' }}>Invite created!</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
              Share this link with the invitee. It will let them set their name and password.
            </p>
            <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 13, wordBreak: 'break-all', marginBottom: 16, color: 'var(--text-primary)' }}>
              {inviteLink}
            </div>
            <Button size="md" onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Copied!'); }}>
              Copy Link
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input
              label="Email address"
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              required
            />
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Role</label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                aria-label="Select role"
                style={{
                  width: '100%', height: 38, padding: '0 12px',
                  border: '1px solid var(--border-strong)', borderRadius: 6,
                  background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                  fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
                  transition: 'border-color 0.12s'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-border)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
              >
                {user?.role === 'superadmin' && <option value="admin">Admin</option>}
                {user?.role === 'admin' && (
                  <>
                    <option value="hr">HR</option>
                    <option value="manager">Manager</option>
                  </>
                )}
                {user?.role === 'hr' && <option value="manager">Manager</option>}
              </select>
            </div>
            {inviteRole === 'manager' && (
              <Input
                label="Department"
                value={inviteDepartment}
                onChange={e => setInviteDepartment(e.target.value)}
                placeholder="e.g. Engineering, Sales, Marketing"
                required
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SettingsPage;
