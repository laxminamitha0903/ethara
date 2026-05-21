import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  Calendar,
  Layers
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { apiFetch, triggerToast, user } = useAuth();

  const fetchDashboardData = async () => {
    try {
      const res = await apiFetch('/api/dashboard');
      if (res.ok) {
        const stats = await res.json();
        setData(stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      triggerToast('Could not fetch dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!data) {
    return (
      <div className="glass-card error-card">
        <h3>Could not load data</h3>
        <button onClick={fetchDashboardData} className="btn-primary" style={{ marginTop: '1rem' }}>
          Retry Loading
        </button>
      </div>
    );
  }

  const { summary, taskStatusBreakdown, myTasks, overdueTasksList } = data;

  // Formatting date for due dates
  const formatDate = (dateStr) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  // Custom SVG Chart Calculation
  const maxTasksCount = Math.max(
    taskStatusBreakdown.todo,
    taskStatusBreakdown.inProgress,
    taskStatusBreakdown.review,
    taskStatusBreakdown.completed,
    1 // Avoid division by zero
  );

  const getPriorityClass = (priority) => {
    return priority.toLowerCase();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'TODO': return 'To Do';
      case 'IN_PROGRESS': return 'In Progress';
      case 'REVIEW': return 'Under Review';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="dashboard-page fade-in">
      <div className="welcome-header">
        <div className="welcome-text">
          <h1>Welcome back, {user.name}</h1>
          <p>Here is your team's progress and task breakdown for today.</p>
        </div>
        <div className="date-widget">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-grid">
        <div className="glass-card metric-card interactive">
          <div className="metric-content">
            <span className="metric-label">Active Projects</span>
            <span className="metric-value">{summary.projectsCount}</span>
            <span className="metric-sub">Joined & owned</span>
          </div>
          <div className="metric-icon-wrapper cyan">
            <FolderKanban size={24} />
          </div>
        </div>

        <div className="glass-card metric-card interactive">
          <div className="metric-content">
            <span className="metric-label">Total Scope</span>
            <span className="metric-value">{summary.totalTasks}</span>
            <span className="metric-sub">Tasks in projects</span>
          </div>
          <div className="metric-icon-wrapper indigo">
            <Layers size={24} />
          </div>
        </div>

        <div className="glass-card metric-card interactive">
          <div className="metric-content">
            <span className="metric-label">Completion Velocity</span>
            <span className="metric-value">{summary.completionRate}%</span>
            <span className="metric-sub">Finished tasks</span>
          </div>
          {/* Custom SVG Ring */}
          <div className="svg-ring-container">
            <svg width="60" height="60" viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle"
                strokeDasharray={`${summary.completionRate}, 100`}
                stroke="url(#purpleGrad)"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <defs>
                <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <TrendingUp className="ring-center-icon" size={14} />
          </div>
        </div>

        <div className={`glass-card metric-card interactive ${summary.overdueCount > 0 ? 'overdue-glow' : ''}`}>
          <div className="metric-content">
            <span className="metric-label">Overdue Alerts</span>
            <span className="metric-value text-red">{summary.overdueCount}</span>
            <span className="metric-sub">Require immediate attention</span>
          </div>
          <div className={`metric-icon-wrapper red ${summary.overdueCount > 0 ? 'pulse-alert' : ''}`}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Main Charts & Lists Grid */}
      <div className="dashboard-panels-layout">
        {/* Status Breakdown SVG Chart */}
        <div className="glass-card chart-panel">
          <div className="panel-header">
            <h3>Task Status Breakdown</h3>
            <span className="panel-sub">Current state metrics</span>
          </div>
          
          <div className="chart-wrapper">
            <div className="bar-chart-row">
              <span className="chart-label">To Do</span>
              <div className="bar-track">
                <div 
                  className="bar-fill todo-grad" 
                  style={{ width: `${(taskStatusBreakdown.todo / maxTasksCount) * 100}%` }}
                >
                  <span className="bar-count">{taskStatusBreakdown.todo}</span>
                </div>
              </div>
            </div>

            <div className="bar-chart-row">
              <span className="chart-label">In Progress</span>
              <div className="bar-track">
                <div 
                  className="bar-fill progress-grad" 
                  style={{ width: `${(taskStatusBreakdown.inProgress / maxTasksCount) * 100}%` }}
                >
                  <span className="bar-count">{taskStatusBreakdown.inProgress}</span>
                </div>
              </div>
            </div>

            <div className="bar-chart-row">
              <span className="chart-label">In Review</span>
              <div className="bar-track">
                <div 
                  className="bar-fill review-grad" 
                  style={{ width: `${(taskStatusBreakdown.review / maxTasksCount) * 100}%` }}
                >
                  <span className="bar-count">{taskStatusBreakdown.review}</span>
                </div>
              </div>
            </div>

            <div className="bar-chart-row">
              <span className="chart-label">Completed</span>
              <div className="bar-track">
                <div 
                  className="bar-fill completed-grad" 
                  style={{ width: `${(taskStatusBreakdown.completed / maxTasksCount) * 100}%` }}
                >
                  <span className="bar-count">{taskStatusBreakdown.completed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Assigned Tasks Widget */}
        <div className="glass-card list-panel">
          <div className="panel-header">
            <h3>My Pending Tasks</h3>
            <span className="panel-sub">Assigned to me</span>
          </div>

          <div className="list-content">
            {myTasks.length === 0 ? (
              <div className="empty-state">
                <CheckSquare size={28} className="empty-icon text-muted" />
                <p>No pending tasks assigned to you!</p>
              </div>
            ) : (
              myTasks.map(task => (
                <div key={task.id} className="task-item-row">
                  <div className="task-item-details">
                    <span className="task-item-title">{task.title}</span>
                    <div className="task-item-meta">
                      <span className="task-item-project">{task.project.name}</span>
                      <span className="dot">•</span>
                      <span className={`badge ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                    </div>
                  </div>
                  <div className="task-item-right">
                    <span className="task-item-due">
                      <Calendar size={12} /> {formatDate(task.dueDate)}
                    </span>
                    <Link to={`/projects/${task.projectId}`} className="task-go-btn" title="View Board">
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Alert Listing */}
        <div className="glass-card list-panel span-full">
          <div className="panel-header alert-panel-header">
            <div className="panel-header-title">
              <AlertTriangle className="text-red" size={20} />
              <h3>Overdue Alert Board</h3>
            </div>
            <span className="panel-sub text-red">Require urgent follow-up</span>
          </div>

          <div className="table-wrapper">
            {overdueTasksList.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <CheckSquare size={32} className="empty-icon text-completed" />
                <p style={{ color: 'var(--color-completed)' }}>Excellent! Zero overdue tasks in your scope.</p>
              </div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Project</th>
                    <th>Assignee</th>
                    <th>Due Date</th>
                    <th>Severity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueTasksList.map(task => (
                    <tr key={task.id}>
                      <td className="font-semibold">{task.title}</td>
                      <td>{task.project.name}</td>
                      <td>
                        {task.assignee ? (
                          <div className="table-assignee">
                            <div className="small-avatar">
                              {task.assignee.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-dark">Unassigned</span>
                        )}
                      </td>
                      <td className="text-red font-semibold">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td>
                        <span className={`badge ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                      </td>
                      <td>
                        <Link to={`/projects/${task.projectId}`} className="table-action-link">
                          Go to Board <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .welcome-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          animation: fadeIn 0.3s ease-out;
        }

        .welcome-text h1 {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #fff 40%, var(--text-muted) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .welcome-text p {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-top: 0.25rem;
        }

        .date-widget {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          padding: 0.6rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        /* Metric Cards */
        .metric-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 110px;
        }

        .metric-content {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-value {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.1;
          margin: 0.2rem 0;
          color: #fff;
        }

        .metric-sub {
          font-size: 0.75rem;
          color: var(--text-dark);
        }

        .metric-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-icon-wrapper.cyan {
          background: rgba(6, 182, 212, 0.1);
          color: var(--color-todo);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
        }

        .metric-icon-wrapper.indigo {
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent-primary);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
        }

        .metric-icon-wrapper.red {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-danger);
        }

        /* SVG Circular Chart */
        .svg-ring-container {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .circular-chart {
          display: block;
        }

        .circle-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.04);
          stroke-width: 2.8;
        }

        .circle {
          fill: none;
          stroke-width: 2.8;
          stroke-linecap: round;
          transition: stroke-dasharray 0.35s;
        }

        .ring-center-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--accent-secondary);
        }

        .overdue-glow {
          border-color: rgba(239, 68, 68, 0.2) !important;
        }

        .pulse-alert {
          animation: pulseGlow 2s infinite;
          background: rgba(239, 68, 68, 0.15) !important;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .text-red {
          color: var(--color-danger) !important;
        }

        /* Dashboard Panels */
        .dashboard-panels-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .span-full {
          grid-column: span 2;
        }

        .panel-header {
          margin-bottom: 1.5rem;
        }

        .panel-header h3 {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
        }

        .panel-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Bar Chart SVG styling */
        .chart-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .bar-chart-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .chart-label {
          width: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .bar-track {
          flex: 1;
          height: 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          overflow: hidden;
          position: relative;
        }

        .bar-fill {
          height: 100%;
          border-radius: var(--radius-sm);
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 0.75rem;
          position: relative;
          min-width: 28px;
        }

        .bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
        }

        .todo-grad { background: var(--grad-cyan); }
        .progress-grad { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .review-grad { background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); }
        .completed-grad { background: var(--grad-completed); }

        .bar-count {
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
          z-index: 10;
        }

        /* List panels */
        .list-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 3rem 1rem;
          text-align: center;
          color: var(--text-muted);
        }

        .empty-icon {
          opacity: 0.4;
        }

        .task-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          transition: var(--trans-normal);
        }

        .task-item-row:hover {
          border-color: var(--border-glow);
          background: rgba(99, 102, 241, 0.03);
          transform: translateX(4px);
        }

        .task-item-details {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          margin-right: 1rem;
        }

        .task-item-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .task-item-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.2rem;
        }

        .task-item-project {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .dot {
          color: var(--text-dark);
          font-size: 0.6rem;
        }

        .task-item-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .task-item-due {
          font-size: 0.78rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .task-go-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-light);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--trans-normal);
          text-decoration: none;
        }

        .task-go-btn:hover {
          background: var(--accent-primary);
          color: #fff;
          border-color: var(--accent-primary);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }

        /* Overdue Table styling */
        .alert-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(239, 68, 68, 0.15);
          padding-bottom: 1rem;
        }

        .panel-header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .table-wrapper {
          overflow-x: auto;
          margin-top: 0.5rem;
        }

        .premium-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .premium-table th {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        .premium-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-light);
          font-size: 0.88rem;
        }

        .premium-table tr:hover td {
          background: rgba(255, 255, 255, 0.015);
        }

        .font-semibold {
          font-weight: 600;
          color: #fff;
        }

        .table-assignee {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .small-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent-cyan);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .table-action-link {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          transition: var(--trans-fast);
        }

        .table-action-link:hover {
          color: var(--accent-secondary);
          text-decoration: underline;
        }

        @media (max-width: 992px) {
          .dashboard-panels-layout {
            grid-template-columns: 1fr;
          }
          .span-full {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .welcome-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .date-widget {
            align-self: stretch;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
