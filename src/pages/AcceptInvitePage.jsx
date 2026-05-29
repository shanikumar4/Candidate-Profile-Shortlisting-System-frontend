import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import * as authApi from '../api/auth';
import toast from 'react-hot-toast';

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // If already authenticated, they shouldn't be accepting an invite in this session.
  useEffect(() => {
    if (isAuthenticated) {
      toast('Please log out first or use an Incognito window to accept a new invite.', { icon: '⚠️' });
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!token) return toast.error('Invalid invite link');
    if (!email || !name || !password) return toast.error('Fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    
    setLoading(true);
    try {
      const data = await authApi.acceptInvite(token, email, name, password);
      toast.success('Account activated successfully!');
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept invite');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f19' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2>Invalid Invite Link</h2>
          <p style={{ color: '#8b93a7', marginTop: 12 }}>The token is missing from the URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f19' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#1a2235', borderRadius: 16, padding: 40, margin: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8, letterSpacing: '-0.5px' }}>
          Activate your account
        </h2>
        <p style={{ fontSize: 14, color: '#8b93a7', marginBottom: 32, lineHeight: 1.5 }}>
          You've been invited to join the team. Set up your profile to continue.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div>
            <label style={{ display: 'block', color: '#a1a9b8', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
              Invited Email Address<span style={{ color: '#e74c3c', marginLeft: 4 }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#525d73" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', height: 44, background: '#252d3d', border: '1px solid #2e3a50', borderRadius: 8,
                  color: 'white', fontSize: 14, fontFamily: "'Inter', sans-serif", padding: '0 16px 0 40px', outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#a1a9b8', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
              Full Name<span style={{ color: '#e74c3c', marginLeft: 4 }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#525d73" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  width: '100%', height: 44, background: '#252d3d', border: '1px solid #2e3a50', borderRadius: 8,
                  color: 'white', fontSize: 14, fontFamily: "'Inter', sans-serif", padding: '0 16px 0 40px', outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#a1a9b8', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
              Create Password<span style={{ color: '#e74c3c', marginLeft: 4 }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#525d73" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%', height: 44, background: '#252d3d', border: '1px solid #2e3a50', borderRadius: 8,
                  color: 'white', fontSize: 14, fontFamily: "'Inter', sans-serif", padding: '0 16px 0 40px', outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 46, background: '#1dca74', color: '#000', fontWeight: 600, fontSize: 15,
              borderRadius: 8, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              cursor: 'pointer', marginTop: 8
            }}
          >
            <CheckCircle size={18} fill="#000" />
            {loading ? 'Activating...' : 'Activate Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitePage;
