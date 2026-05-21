import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Key, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { login, triggerToast } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast('Please fill in all fields', 'error');
      return;
    }

    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  // Helper to load demo credentials
  const loadDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@ethara.com');
      setPassword('admin123');
    } else {
      setEmail('member@ethara.com');
      setPassword('member123');
    }
    triggerToast(`Loaded demo ${role} credentials. Click Sign In!`, 'info');
  };

  return (
    <div className="auth-page">
      <div className="auth-background-glow"></div>
      
      <div className="auth-container">
        <div className="auth-logo">
          <span className="logo-flash">⚡</span>
          <span className="logo-text">ETHARA</span>
        </div>
        
        <div className="glass-card auth-card">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to manage your tasks & projects</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Key className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
          </p>
        </div>

        {/* Demo Fast-Login Drawer */}
        <div className="glass-card demo-credentials-card">
          <h3 className="demo-title">⚡ Quick Evaluator Logins</h3>
          <p className="demo-subtitle">Select a demo role to fill credentials automatically</p>
          <div className="demo-actions">
            <button 
              onClick={() => loadDemo('admin')} 
              className="btn-secondary demo-btn admin-demo"
            >
              <span>🔑 Admin Demo</span>
            </button>
            <button 
              onClick={() => loadDemo('member')} 
              className="btn-secondary demo-btn member-demo"
            >
              <span>👤 Member Demo</span>
            </button>
          </div>
          <p className="demo-note">* Demo accounts are automatically seeded on fresh database initialization.</p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-deep);
          position: relative;
          overflow: hidden;
          padding: 2rem 1.5rem;
        }

        .auth-background-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          filter: blur(80px);
          z-index: 1;
        }

        .auth-container {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          z-index: 2;
          animation: fadeIn 0.4s ease-out;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .auth-card {
          padding: 2.25rem 2rem;
          border-color: rgba(255, 255, 255, 0.08);
        }

        .auth-title {
          font-size: 1.8rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 0.25rem;
          background: linear-gradient(135deg, #fff 40%, var(--text-muted) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .auth-subtitle {
          color: var(--text-muted);
          text-align: center;
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-dark);
          pointer-events: none;
        }

        .form-input {
          padding-left: 2.75rem;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: transparent;
          border: none;
          color: var(--text-dark);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          border-radius: 4px;
        }

        .password-toggle:hover {
          color: var(--text-muted);
        }

        .auth-submit-btn {
          width: 100%;
          justify-content: center;
          margin-top: 1rem;
          padding: 0.85rem;
        }

        .auth-footer-text {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 1.5rem;
        }

        .auth-link {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 600;
          transition: var(--trans-fast);
        }

        .auth-link:hover {
          color: var(--accent-secondary);
          text-decoration: underline;
        }

        /* Demo panel styling */
        .demo-credentials-card {
          padding: 1.25rem;
          border-color: var(--border-glow);
          background: rgba(16, 17, 24, 0.4);
        }

        .demo-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.15rem;
        }

        .demo-subtitle {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }

        .demo-actions {
          display: flex;
          gap: 0.75rem;
        }

        .demo-btn {
          flex: 1;
          padding: 0.5rem;
          font-size: 0.82rem;
          justify-content: center;
          background: rgba(255, 255, 255, 0.02);
        }

        .demo-btn:hover {
          background: rgba(99, 102, 241, 0.05);
        }

        .admin-demo:hover {
          border-color: var(--color-danger);
        }

        .member-demo:hover {
          border-color: var(--color-todo);
        }

        .demo-note {
          font-size: 0.65rem;
          color: var(--text-dark);
          text-align: center;
          margin-top: 0.5rem;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spinner 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
