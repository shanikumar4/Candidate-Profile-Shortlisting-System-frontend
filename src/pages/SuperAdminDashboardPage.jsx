import { useState, useEffect } from 'react';
import { Building2, Plus, Users, Send, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import * as superAdminApi from '../api/superadmin';
import Topbar from '../components/layout/Topbar';
import toast from 'react-hot-toast';

const StatBadge = ({ label, value, color }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '12px 16px', background: 'var(--bg-elevated)',
    borderRadius: 8, border: '1px solid var(--border)', flex: 1, minWidth: 80,
  }}>
    <div style={{ fontSize: 20, fontWeight: 700, color: color || 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
      {value ?? '—'}
    </div>
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>
      {label}
    </div>
  </div>
);

const SuperAdminDashboardPage = ({ onMenuClick }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Company State
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [creating, setCreating] = useState(false);

  // Invite HR State
  const [invitingCompanyId, setInvitingCompanyId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Expanded company cards on mobile
  const [expandedCards, setExpandedCards] = useState({});

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.getCompanies();
      setCompanies(data);
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    setCreating(true);
    try {
      await superAdminApi.createCompany(newCompanyName.trim(), 'starter');
      toast.success('Company created!');
      setNewCompanyName('');
      setShowAddCompany(false);
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create company');
    } finally {
      setCreating(false);
    }
  };

  const handleInviteHR = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !invitingCompanyId) return;
    setInviting(true);
    try {
      const data = await superAdminApi.inviteUser(inviteEmail, invitingCompanyId, 'admin');
      await navigator.clipboard.writeText(data.inviteLink);
      toast.success('Invite created & link copied!');
      setInviteEmail('');
      setInvitingCompanyId(null);
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Remove this admin? This cannot be undone.')) return;
    try {
      await superAdminApi.deleteUser(userId);
      toast.success('Admin removed');
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove admin');
    }
  };

  const toggleCard = (id) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  const totalUsers = companies.reduce((acc, c) => acc + (c.userCount || 0), 0);

  return (
    <div className="page-enter">
      <Topbar
        title="Super Admin"
        subtitle="SaaS Tenant Management"
        onMenuClick={onMenuClick}
        actions={
          <button
            onClick={() => setShowAddCompany(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px',
              background: 'var(--accent)', color: '#000',
              border: 'none', borderRadius: 7,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={14} />
            <span className="hide-mobile">Add Company</span>
            <span className="show-mobile">Add</span>
          </button>
        }
      />

      <div className="page-container" style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatBadge label="Companies" value={companies.length} color="var(--accent)" />
          <StatBadge label="Total Users" value={totalUsers} color="var(--ai)" />
          <StatBadge label="Active" value={companies.filter(c => c.userCount > 0).length} color="var(--success)" />
        </div>

        {/* Create Company Form */}
        {showAddCompany && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--accent-border)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            boxShadow: '0 0 0 1px var(--accent-border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Create New Company
              </h3>
              <button
                onClick={() => setShowAddCompany(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                placeholder="Company Name"
                value={newCompanyName}
                onChange={e => setNewCompanyName(e.target.value)}
                autoFocus
                style={{
                  width: '100%', padding: '10px 14px', height: 42,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-strong)', borderRadius: 8,
                  color: 'var(--text-primary)', outline: 'none',
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-border)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
                required
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 1, height: 40,
                    background: 'var(--accent)', color: '#000',
                    border: 'none', borderRadius: 8,
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    opacity: creating ? 0.7 : 1,
                  }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCompany(false)}
                  style={{
                    flex: 1, height: 40,
                    background: 'transparent', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    fontWeight: 500, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
            ))}
          </div>
        ) : companies.length === 0 && !showAddCompany ? (
          /* Empty State */
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            border: '1px dashed var(--border)', borderRadius: 12,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--bg-elevated)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Building2 size={28} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>No companies yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              Get started by creating your first SaaS tenant.
            </p>
            <button
              onClick={() => setShowAddCompany(true)}
              style={{
                padding: '10px 24px', background: 'var(--accent)', color: '#000',
                border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Add Company
            </button>
          </div>
        ) : (
          /* Company Cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {companies.map(company => {
              const isExpanded = expandedCards[company._id] !== false; // default expanded
              const isInviting = invitingCompanyId === company._id;

              return (
                <div key={company._id} className="card" style={{ overflow: 'hidden' }}>
                  {/* Card Header */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                      {/* Icon */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 10,
                        background: 'var(--accent-dim)',
                        border: '1px solid var(--accent-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Building2 size={20} color="var(--accent)" />
                      </div>
                      {/* Info */}
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{
                          fontSize: 15, fontWeight: 700,
                          color: 'var(--text-primary)', marginBottom: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {company.name}
                        </h3>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{company.userCount}</span> user{company.userCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <button
                        onClick={() => setInvitingCompanyId(isInviting ? null : company._id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '7px 12px',
                          background: isInviting ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                          color: isInviting ? 'var(--accent)' : 'var(--text-primary)',
                          border: isInviting ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                          borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Users size={13} />
                        <span className="hide-mobile">Invite Admin</span>
                        <span className="show-mobile">Invite</span>
                      </button>
                      {/* Expand/Collapse toggle */}
                      <button
                        onClick={() => toggleCard(company._id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 32, height: 32,
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          borderRadius: 7, cursor: 'pointer',
                          color: 'var(--text-muted)',
                        }}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Invite Form */}
                  {isInviting && (
                    <div style={{ padding: '14px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                      <form onSubmit={handleInviteHR} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Invite Admin to {company.name}
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <input
                            type="email"
                            placeholder="Admin's email address"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            autoFocus
                            style={{
                              flex: 1, minWidth: 180, padding: '0 14px', height: 40,
                              background: 'var(--bg-base)',
                              border: '1px solid var(--border)', borderRadius: 8,
                              color: 'var(--text-primary)', outline: 'none',
                              fontFamily: 'var(--font-body)', fontSize: 14,
                            }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-border)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                            required
                          />
                          <button
                            type="submit"
                            disabled={inviting}
                            style={{
                              height: 40, padding: '0 16px',
                              background: 'var(--accent)', color: '#000',
                              border: 'none', borderRadius: 8,
                              fontWeight: 700, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 6,
                              fontSize: 13, opacity: inviting ? 0.7 : 1,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Send size={13} />
                            {inviting ? 'Sending...' : 'Generate Link'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Admin Users List */}
                  {isExpanded && (
                    <div style={{ padding: '14px 20px', background: 'var(--bg-base)' }}>
                      <div style={{
                        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10,
                      }}>
                        Active Company Admins
                      </div>

                      {!company.hrUsers?.length ? (
                        <div style={{
                          padding: '16px 0', textAlign: 'center',
                          color: 'var(--text-muted)', fontSize: 13,
                        }}>
                          No admins yet — invite one above.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {company.hrUsers.map(user => (
                            <div
                              key={user._id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                background: 'var(--bg-surface)',
                                borderRadius: 8,
                                border: '1px solid var(--border)',
                                gap: 10,
                                flexWrap: 'wrap',
                              }}
                            >
                              {/* User Info */}
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {user.name}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {user.email}
                                </div>
                              </div>

                              {/* Badges + Delete */}
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                                <span style={{
                                  padding: '3px 8px', borderRadius: 100,
                                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                                  background: user.status === 'active' ? 'var(--success-dim)' : 'var(--danger-dim)',
                                  color: user.status === 'active' ? 'var(--success)' : 'var(--danger)',
                                  border: user.status === 'active' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(248,113,113,0.3)',
                                }}>
                                  {user.status}
                                </span>
                                <span style={{
                                  padding: '3px 8px', borderRadius: 100,
                                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                                  background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                                  border: '1px solid var(--border)',
                                }}>
                                  {user.role}
                                </span>
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  title="Remove Admin"
                                  style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: 4, borderRadius: 4,
                                    transition: 'all 0.12s',
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-dim)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;
