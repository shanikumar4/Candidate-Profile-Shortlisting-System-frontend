import { useState, useEffect } from 'react';
import { Building2, Plus, Users, Send, Trash2 } from 'lucide-react';
import * as superAdminApi from '../api/superadmin';
import toast from 'react-hot-toast';

const SuperAdminDashboardPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Company State
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  
  // Invite HR State
  const [invitingCompanyId, setInvitingCompanyId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.getCompanies();
      setCompanies(data);
    } catch (err) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName) return;
    try {
      await superAdminApi.createCompany(newCompanyName, 'starter');
      toast.success('Company created!');
      setNewCompanyName('');
      setShowAddCompany(false);
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create company');
    }
  };

  const handleInviteHR = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !invitingCompanyId) return;
    try {
      const data = await superAdminApi.inviteUser(inviteEmail, invitingCompanyId, 'admin');
      
      // Copy to clipboard
      await navigator.clipboard.writeText(data.inviteLink);
      toast.success('Invite created and link copied to clipboard!');
      
      setInviteEmail('');
      setInvitingCompanyId(null);
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this admin? This action cannot be undone.')) return;
    try {
      await superAdminApi.deleteUser(userId);
      toast.success('Admin removed successfully');
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove admin');
    }
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Loading super admin dashboard...</div>;

  return (
    <div style={{ padding: '40px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            SaaS Tenant Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Overview of all registered companies and their active administrators.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddCompany(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', background: 'var(--accent)', color: '#000',
            border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Add Company
        </button>
      </div>

      {showAddCompany && (
        <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Create New Company</h3>
          <form onSubmit={handleCreateCompany} style={{ display: 'flex', gap: 16 }}>
            <input
              type="text"
              placeholder="Company Name"
              value={newCompanyName}
              onChange={e => setNewCompanyName(e.target.value)}
              style={{
                flex: 1, padding: '0 16px', height: 40, background: 'var(--bg-elevated)',
                border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none'
              }}
              required
            />
            <button type="submit" style={{
              height: 40, padding: '0 24px', background: 'var(--text-primary)', color: 'var(--bg-base)',
              border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer'
            }}>
              Create
            </button>
            <button type="button" onClick={() => setShowAddCompany(false)} style={{
              height: 40, padding: '0 24px', background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border)', borderRadius: 8, fontWeight: 500, cursor: 'pointer'
            }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {companies.map(company => (
          <div key={company._id} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={24} color="var(--accent)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{company.name}</h3>
                  <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                    <span>Total Users: <span style={{ color: 'var(--text-secondary)' }}>{company.userCount}</span></span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setInvitingCompanyId(company._id === invitingCompanyId ? null : company._id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                  border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer'
                }}
              >
                <Users size={14} /> Invite Admin
              </button>
            </div>

            {/* Invite Form */}
            {invitingCompanyId === company._id && (
              <div style={{ padding: '20px 24px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <form onSubmit={handleInviteHR} style={{ display: 'flex', gap: 16 }}>
                  <input
                    type="email"
                    placeholder="Admin's Email Address"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    style={{
                      flex: 1, padding: '0 16px', height: 40, background: 'var(--bg-base)',
                      border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none'
                    }}
                    required
                  />
                  <button type="submit" style={{
                    height: 40, padding: '0 20px', background: 'var(--accent)', color: '#000',
                    border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <Send size={14} /> Generate Link
                  </button>
                </form>
              </div>
            )}

            {/* HR List */}
            <div style={{ padding: '16px 24px', background: 'var(--bg-base)' }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Active Company Admins
              </h4>
              {company.hrUsers?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No admins active yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {company.hrUsers?.map(user => (
                    <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 500 }}>{user.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                          background: user.status === 'active' ? 'rgba(24, 226, 153, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                          color: user.status === 'active' ? 'var(--accent)' : '#e74c3c'
                        }}>
                          {user.status}
                        </span>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                          background: 'var(--bg-elevated)', color: 'var(--text-secondary)'
                        }}>
                          {user.role}
                        </span>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          title="Remove Admin"
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {companies.length === 0 && !showAddCompany && (
          <div style={{ textAlign: 'center', padding: 80, border: '1px dashed var(--border)', borderRadius: 12 }}>
            <Building2 size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>No companies yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Get started by creating your first SaaS tenant.</p>
            <button
              onClick={() => setShowAddCompany(true)}
              style={{
                padding: '10px 20px', background: 'var(--text-primary)', color: 'var(--bg-base)',
                border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer'
              }}
            >
              Add Company
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default SuperAdminDashboardPage;
