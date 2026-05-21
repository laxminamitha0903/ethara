import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Key, User, Shield, Check } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('MEMBER'); // Default is Member
  const [submitting, setSubmitting] = useState(false);

  const { signup, triggerToast } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      triggerToast('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      triggerToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      triggerToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setSubmitting(true);
    const success = await signup(name, email, password, role);
    setSubmitting(false);

    if (success) {
      navigate('/dashboard');
    }
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
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us to start managing tasks seamlessly</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            {/* Premium Role Selection Cards */}
            <div className="form-group">
              <label className="form-label">Choose Your Role</label>
              <div className="role-selector-grid">
                <div 
                  className={`role-option-card ${role === 'MEMBER' ? 'active' : ''}`}
                  onClick={() => !submitting && setRole('MEMBER')}
                >
                  <div className="role-icon-box member-icon">
                    <User size={18} />
                  </div>
                  <div className="role-info">
                    <span className="role-name">Team Member</span>
                    <span className="role-desc">View projects & update assigned tasks</span>
                  </div>
                  {role === 'MEMBER' && <div className="active-badge"><Check size={10} /></div>}
                </div>

                <div 
                  className={`role-option-card ${role === 'ADMIN' ? 'active' : ''}`}
                  onClick={() => !submitting && setRole('ADMIN')}
                >
                  <div className="role-icon-box admin-icon">
                    <Shield size={18} />
                  </div>
                  <div className="role-info">
                    <span className="role-name">Administrator</span>
                    <span className="role-desc">Full control of projects, members & tasks</span>
                  </div>
                  {role === 'ADMIN' && <div className="active-badge"><Check size={10} /></div>}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Key className="input-icon" size={18} />
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <Key className="input-icon" size={18} />
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </>
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>

      <style>{`
        .role-selector-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .role-option-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          cursor: pointer;
          position: relative;
          transition: var(--trans-normal);
        }

        .role-option-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .role-option-card.active {
          background: rgba(99, 102, 241, 0.05);
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-neon);
        }

        .role-icon-box {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .member-icon {
          background: rgba(6, 182, 212, 0.1);
          color: var(--color-todo);
        }

        .admin-icon {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-danger);
        }

        .role-info {
          display: flex;
          flex-direction: column;
        }

        .role-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .role-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .active-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 5px var(--accent-primary);
        }
      `}</style>
    </div>
  );
};

export default Signup;
