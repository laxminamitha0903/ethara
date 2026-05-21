import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  LogOut, 
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <div className="logo-area">
          <span className="logo-flash">⚡</span>
          <span className="logo-text">ETHARA</span>
        </div>
        <div className="role-tag">
          {user.role === 'ADMIN' ? (
            <span className="admin-badge">
              <ShieldAlert size={12} /> ADMIN
            </span>
          ) : (
            <span className="member-badge">
              <UserIcon size={12} /> MEMBER
            </span>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/projects" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FolderKanban size={20} />
          <span>Projects</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-widget">
          <div className="avatar-placeholder">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
        </div>

        <button onClick={logout} className="logout-btn" title="Sign Out">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      <style>{`
        .sidebar-container {
          width: 260px;
          background: rgba(16, 17, 24, 0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          min-height: 100vh;
          position: sticky;
          top: 0;
          z-index: 100;
          transition: var(--trans-normal);
        }

        .sidebar-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-flash {
          font-size: 1.75rem;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.6));
          animation: pulseGlow 3s infinite;
        }

        .logo-text {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          background: var(--grad-main);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .role-tag {
          display: flex;
        }

        .admin-badge {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-full);
          padding: 0.2rem 0.6rem;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          letter-spacing: 0.05em;
        }

        .member-badge {
          background: rgba(6, 182, 212, 0.1);
          color: var(--color-todo);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: var(--radius-full);
          padding: 0.2rem 0.6rem;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          letter-spacing: 0.05em;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--text-muted);
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-sm);
          text-decoration: none;
          font-weight: 500;
          transition: var(--trans-normal);
          border: 1px solid transparent;
        }

        .nav-item:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.03);
          border-color: var(--border-light);
          padding-left: 1.5rem;
        }

        .nav-item.active {
          color: #fff;
          background: rgba(99, 102, 241, 0.08);
          border-color: var(--border-glow);
          box-shadow: var(--shadow-neon);
          font-weight: 600;
          position: relative;
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 25%;
          height: 50%;
          width: 3px;
          background: var(--accent-primary);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 10px var(--accent-primary);
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }

        .user-profile-widget {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
        }

        .avatar-placeholder {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--grad-main);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-family: var(--font-heading);
          color: #fff;
          font-size: 1rem;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: var(--color-danger);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          font-family: var(--font-heading);
          font-weight: 600;
          transition: var(--trans-normal);
          width: 100%;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.08);
          border-color: var(--color-danger);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 768px) {
          .sidebar-container {
            width: 100%;
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid var(--border-light);
            padding: 1rem;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }

          .sidebar-header {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
            flex-direction: row;
            align-items: center;
          }

          .sidebar-nav {
            flex-direction: row;
            gap: 0.5rem;
            margin-left: 1rem;
            margin-right: 1rem;
            flex: 0;
          }

          .nav-item {
            padding: 0.5rem 0.75rem;
          }

          .nav-item:hover {
            padding-left: 0.75rem;
          }

          .nav-item.active::before {
            display: none;
          }

          .sidebar-footer {
            margin-top: 0;
            border-top: none;
            padding-top: 0;
            flex-direction: row;
            gap: 0.5rem;
            align-items: center;
          }

          .user-profile-widget {
            display: none;
          }

          .logout-btn {
            width: auto;
            padding: 0.5rem;
          }

          .logout-btn span {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
