import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, Terminal } from 'lucide-react';
import useAuthStore from '../store/authStore';
import * as authApi from '../api/auth';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      login(data.token, data.user);
      if (data.user.role === 'superadmin') {
        navigate('/superadmin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        /* Global Reset for this page */
        * { box-sizing: border-box; }
        
        .login-layout { 
          display: flex; 
          min-height: 100vh; 
          flex-direction: column; 
          position: relative;
          background-color: #0b0f19;
          overflow: hidden;
        }

        /* Ambient Glow Diffusion */
        .ambient-glow-1 {
          position: absolute;
          width: 900px;
          height: 900px;
          background: radial-gradient(circle, rgba(24, 226, 153, 0.04) 0%, transparent 60%);
          top: -200px;
          left: -200px;
          pointer-events: none;
          z-index: 1;
        }
        .ambient-glow-2 {
          position: absolute;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.03) 0%, transparent 60%);
          bottom: -100px;
          right: -100px;
          pointer-events: none;
          z-index: 1;
        }

        /* Fading Grid Pattern */
        .premium-grid {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          /* Mask to fade out the grid radially from top-left */
          mask-image: radial-gradient(circle at 10% 10%, rgba(0, 0, 0, 1) 0%, transparent 60%);
          -webkit-mask-image: radial-gradient(circle at 10% 10%, rgba(0, 0, 0, 1) 0%, transparent 60%);
        }

        /* Vignette */
        .vignette {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: radial-gradient(circle at center, transparent 40%, rgba(6, 8, 15, 0.8) 100%);
        }

        /* Flex Columns */
        .login-left, .login-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          z-index: 10;
        }
        .login-left { background-color: transparent; }
        .login-right { background-color: transparent; }
        @media (min-width: 768px) {
          .login-layout { flex-direction: row; }
          .login-left { width: 50%; flex: 0 0 50%; padding: 80px; border-right: 1px solid rgba(255, 255, 255, 0.06); }
          .login-right { width: 50%; flex: 0 0 50%; padding: 40px; align-items: center; }
        }

        /* Typography */
        .premium-headline {
          font-size: clamp(40px, 5vw, 68px);
          font-weight: 800;
          color: white;
          letter-spacing: -1.5px;
          line-height: 1.05;
          margin-bottom: 24px;
        }
        .premium-subheadline {
          font-size: 16px;
          color: #8b93a7;
          font-weight: 400;
          line-height: 1.6;
          max-width: 360px;
        }

        /* Glassmorphism Card (Restored to Solid Reference Color) */
        .premium-card {
          width: 100%;
          max-width: 380px;
          background: #121825;
          border-radius: 16px;
          padding: 32px;
        }

        /* Form Elements */
        .premium-label {
          display: block;
          color: #a1a9b8;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .premium-input-container {
          position: relative;
          margin-bottom: 24px;
        }
        .premium-input {
          width: 100%;
          height: 44px;
          background: #252d3d;
          border: 1px solid #2e3a50;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          padding: 0 16px 0 40px;
          outline: none;
          transition: border-color 0.2s;
        }
        .premium-input:focus {
          border-color: #18E299;
          box-shadow: 0 0 0 4px rgba(24, 226, 153, 0.1);
        }
        .premium-input::placeholder { color: #525d73; }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 13px;
          color: #525d73;
          pointer-events: none;
          transition: color 0.2s ease;
        }
        .premium-input:focus + .input-icon {
          color: rgba(24, 226, 153, 0.8);
        }

        /* Premium Button */
        .premium-button {
          width: 100%;
          height: 46px;
          background: #1dca74;
          color: #000;
          font-weight: 600;
          font-size: 15px;
          border-radius: 8px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(24, 226, 153, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #17b363;
          box-shadow: 0 6px 20px rgba(29, 202, 116, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
        .premium-button:active:not(:disabled) {
          transform: translateY(1px);
          box-shadow: 0 2px 8px rgba(29, 202, 116, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

      `}</style>
      
      <div className="login-layout">
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
        <div className="premium-grid" />
        <div className="vignette" />


        {/* ── Left panel ── */}
        <div className="login-left">
          <div style={{ maxWidth: 540, zIndex: 20 }}>
            {/* Logo */}
            <div style={{ marginBottom: 40 }}>
              <span style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.5px' }}>
                <span style={{ color: 'white' }}>Hire</span>
                <span style={{ color: '#18E299' }}>IQ</span>
              </span>
            </div>

            <h1 className="premium-headline">
              Hire smarter.<br />
              Decide faster.
            </h1>
            <p className="premium-subheadline hidden md:block">
              The AI-powered recruitment dashboard for high-performance teams.
            </p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div className="premium-card">
            
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8, letterSpacing: '-0.5px' }}>
              Sign in
            </h2>
            <p style={{ fontSize: 14, color: '#8b93a7', marginBottom: 40 }}>
              Enter your details to access the dashboard.
            </p>

            <form onSubmit={handleLogin}>
              
              <div className="premium-input-container">
                <label className="premium-label">
                  Email address<span style={{ color: '#e74c3c', marginLeft: 4 }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="premium-input"
                    placeholder="name@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={18} className="input-icon" />
                </div>
              </div>

              <div className="premium-input-container" style={{ marginBottom: 32 }}>
                <label className="premium-label">
                  Password<span style={{ color: '#e74c3c', marginLeft: 4 }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="premium-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <Lock size={18} className="input-icon" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="premium-button">
                <Zap size={18} fill="#040d09" />
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
