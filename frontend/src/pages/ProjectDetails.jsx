import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Plus, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  User, 
  X, 
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Shield,
  Briefcase
} from 'lucide-react';

const ProjectDetails = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { apiFetch, triggerToast, user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]); // List of all users in the system

  // Modals state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Forms state
  const [memberEmail, setMemberEmail] = useState('');
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('TODO');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const res = await apiFetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      } else {
        triggerToast('Could not load project details', 'error');
        navigate('/projects');
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      triggerToast('Server communication failure', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchUsers();
  }, [projectId]);

  const isAdmin = user.role === 'ADMIN';
  const isOwner = project && project.ownerId === user.id;
  const canManage = isAdmin || isOwner;

  // Add Member Handler
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    setMemberSubmitting(true);
    try {
      const res = await apiFetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email: memberEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        triggerToast('Team member added to project successfully!', 'success');
        setMemberEmail('');
        setShowMemberModal(false);
        fetchProjectDetails(); // Reload details
      } else {
        triggerToast(data.message || 'Could not add member', 'error');
      }
    } catch (err) {
      console.error('Add member error:', err);
      triggerToast('Server communication failure', 'error');
    } finally {
      setMemberSubmitting(false);
    }
  };

  // Remove Member Handler
  const handleRemoveMember = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from the project?`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        triggerToast(`Removed ${userName} from project`, 'success');
        fetchProjectDetails();
      } else {
        const data = await res.json();
        triggerToast(data.message || 'Could not remove member', 'error');
      }
    } catch (err) {
      console.error('Remove member error:', err);
      triggerToast('Server communication failure', 'error');
    }
  };

  // Task Form Handlers
  const openCreateTaskModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskStatus('TODO');
    setTaskPriority('MEDIUM');
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTaskDueDate(tomorrow.toISOString().split('T')[0]);
    setTaskAssigneeId('');
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
    setTaskAssigneeId(task.assigneeId || '');
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate) return;

    setTaskSubmitting(true);
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';

      const bodyData = {
        title: taskTitle,
        description: taskDesc,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate,
        projectId,
        assigneeId: taskAssigneeId || null,
      };

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (res.ok) {
        triggerToast(
          `Task "${taskTitle}" ${editingTask ? 'updated' : 'created'} successfully!`,
          'success'
        );
        setShowTaskModal(false);
        fetchProjectDetails();
      } else {
        triggerToast(data.message || 'Operation failed', 'error');
      }
    } catch (err) {
      console.error('Task form submit error:', err);
      triggerToast('Server communication failure', 'error');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleDeleteTask = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the task "${title}"?`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        triggerToast(`Task "${title}" deleted`, 'success');
        fetchProjectDetails();
      } else {
        const data = await res.json();
        triggerToast(data.message || 'Could not delete task', 'error');
      }
    } catch (err) {
      console.error('Delete task error:', err);
      triggerToast('Server communication failure', 'error');
    }
  };

  // Shift status helper (arrows in card)
  const handleShiftStatus = async (task, direction) => {
    const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    const currentIndex = statuses.indexOf(task.status);
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= statuses.length) return;

    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: statuses[nextIndex] }),
      });

      if (res.ok) {
        fetchProjectDetails(); // Reload board
      } else {
        const data = await res.json();
        triggerToast(data.message || 'Failed to update task status', 'error');
      }
    } catch (err) {
      console.error('Task status shift error:', err);
      triggerToast('Server communication failure', 'error');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!project) {
    return <div className="spinner"></div>;
  }

  // Filter tasks into columns
  const getTasksByStatus = (status) => {
    return project.tasks.filter(t => t.status === status);
  };

  const isOverdue = (dueDateStr, status) => {
    if (status === 'COMPLETED') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDateStr) < today;
  };

  const getPriorityClass = (priority) => {
    return priority.toLowerCase();
  };

  // Compile list of possible assignees (owner + all members)
  const assigneesPool = [];
  if (project.owner) {
    assigneesPool.push(project.owner);
  }
  project.members.forEach(member => {
    if (member.user && member.user.id !== project.ownerId) {
      assigneesPool.push(member.user);
    }
  });

  return (
    <div className="project-details-page fade-in">
      {/* Upper Navigation Bar */}
      <div className="board-navbar glass-card">
        <Link to="/projects" className="board-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </Link>

        <div className="board-nav-title-block">
          <div className="board-project-icon">
            <Briefcase size={18} />
          </div>
          <div>
            <h2>{project.name}</h2>
            <p className="description-subtitle">{project.description || 'No description provided.'}</p>
          </div>
        </div>

        <div className="board-nav-actions">
          {canManage && (
            <>
              <button onClick={() => setShowMemberModal(true)} className="btn-secondary">
                <UserPlus size={16} />
                <span>Team</span>
              </button>
              <button onClick={openCreateTaskModal} className="btn-primary">
                <Plus size={16} />
                <span>Add Task</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Team Info Drawer */}
      <div className="board-team-bar glass-card">
        <div className="bar-title">
          <h3>Collaborating Team</h3>
          <span className="members-indicator">({assigneesPool.length} Active)</span>
        </div>
        
        <div className="team-avatars-row">
          <div className="avatar-capsule owner" title={`Project Creator: ${project.owner.name}`}>
            <div className="avatar-initials owner-bg">
              {project.owner.name.charAt(0).toUpperCase()}
            </div>
            <span className="capsule-name">{project.owner.name} (Owner)</span>
            <Shield size={10} className="owner-shield-icon" />
          </div>

          {project.members.map(member => {
            if (member.userId === project.ownerId) return null;
            return (
              <div key={member.id} className="avatar-capsule" title={`${member.user.name} (${member.user.email})`}>
                <div className="avatar-initials">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <span className="capsule-name">{member.user.name}</span>
                {canManage && (
                  <button 
                    onClick={() => handleRemoveMember(member.user.id, member.user.name)} 
                    className="avatar-remove-btn"
                    title="Remove from project"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban Board Row */}
      <div className="kanban-board-container">
        {/* Column: To Do */}
        <div className="kanban-column">
          <div className="column-header border-todo">
            <span className="column-dot dot-todo"></span>
            <h4>To Do</h4>
            <span className="column-count">{getTasksByStatus('TODO').length}</span>
          </div>
          <div className="column-tasks-list">
            {getTasksByStatus('TODO').map(task => renderTaskCard(task))}
          </div>
        </div>

        {/* Column: In Progress */}
        <div className="kanban-column">
          <div className="column-header border-progress">
            <span className="column-dot dot-progress"></span>
            <h4>In Progress</h4>
            <span className="column-count">{getTasksByStatus('IN_PROGRESS').length}</span>
          </div>
          <div className="column-tasks-list">
            {getTasksByStatus('IN_PROGRESS').map(task => renderTaskCard(task))}
          </div>
        </div>

        {/* Column: Review */}
        <div className="kanban-column">
          <div className="column-header border-review">
            <span className="column-dot dot-review"></span>
            <h4>Under Review</h4>
            <span className="column-count">{getTasksByStatus('REVIEW').length}</span>
          </div>
          <div className="column-tasks-list">
            {getTasksByStatus('REVIEW').map(task => renderTaskCard(task))}
          </div>
        </div>

        {/* Column: Completed */}
        <div className="kanban-column">
          <div className="column-header border-completed">
            <span className="column-dot dot-completed"></span>
            <h4>Completed</h4>
            <span className="column-count">{getTasksByStatus('COMPLETED').length}</span>
          </div>
          <div className="column-tasks-list">
            {getTasksByStatus('COMPLETED').map(task => renderTaskCard(task))}
          </div>
        </div>
      </div>

      {/* Modal: Invite Team Member */}
      {showMemberModal && (
        <div className="modal-backdrop" onClick={() => !memberSubmitting && setShowMemberModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="glass-card">
              <div className="modal-header">
                <h2>Invite Team Member</h2>
                <button 
                  onClick={() => setShowMemberModal(false)} 
                  className="modal-close-btn"
                  disabled={memberSubmitting}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddMember} style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="member-email">Select Member by Email</label>
                  <select 
                    id="member-email"
                    className="form-select"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    disabled={memberSubmitting}
                    required
                  >
                    <option value="">-- Choose User to Invite --</option>
                    {usersList.map(u => (
                      <option key={u.id} value={u.email}>
                        {u.name} ({u.email}) - {u.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-footer-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowMemberModal(false)} 
                    className="btn-secondary"
                    disabled={memberSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={memberSubmitting}
                  >
                    {memberSubmitting ? 'Inviting...' : 'Add to Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Task */}
      {showTaskModal && (
        <div className="modal-backdrop" onClick={() => !taskSubmitting && setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="glass-card">
              <div className="modal-header">
                <h2>{editingTask ? 'Edit Task Settings' : 'Create New Task'}</h2>
                <button 
                  onClick={() => setShowTaskModal(false)} 
                  className="modal-close-btn"
                  disabled={taskSubmitting}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleTaskSubmit} style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="task-title">Task Title</label>
                  <input
                    type="text"
                    id="task-title"
                    className="form-input"
                    placeholder="e.g. Design Dashboard Prototypes"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    disabled={taskSubmitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-desc">Task Description</label>
                  <textarea
                    id="task-desc"
                    className="form-input"
                    rows="3"
                    placeholder="Provide details about requirements, context, and expected output..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    disabled={taskSubmitting}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="grid-form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="task-priority">Priority</label>
                    <select
                      id="task-priority"
                      className="form-select"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      disabled={taskSubmitting}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="task-status">Status</label>
                    <select
                      id="task-status"
                      className="form-select"
                      value={taskStatus}
                      onChange={(e) => setTaskStatus(e.target.value)}
                      disabled={taskSubmitting}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Under Review</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid-form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="task-due">Due Date</label>
                    <input
                      type="date"
                      id="task-due"
                      className="form-input"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      disabled={taskSubmitting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="task-assignee">Assignee</label>
                    <select
                      id="task-assignee"
                      className="form-select"
                      value={taskAssigneeId}
                      onChange={(e) => setTaskAssigneeId(e.target.value)}
                      disabled={taskSubmitting}
                    >
                      <option value="">Unassigned</option>
                      {assigneesPool.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowTaskModal(false)} 
                    className="btn-secondary"
                    disabled={taskSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={taskSubmitting}
                  >
                    {taskSubmitting ? 'Saving...' : editingTask ? 'Save Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render a Single Kanban Task Card
  function renderTaskCard(task) {
    const isTaskOverdue = isOverdue(task.dueDate, task.status);
    const assignedUser = task.assignee;
    
    // Check status boundaries for moving
    const canMoveLeft = task.status !== 'TODO';
    const canMoveRight = task.status !== 'COMPLETED';

    // Verify if current user can edit details (requires Admin or project owner)
    const canEditDetails = canManage;
    // Members can move task status if they are project members (all loaded users on board are)
    const canMoveTask = true;

    return (
      <div key={task.id} className={`glass-card task-card ${isTaskOverdue ? 'border-overdue' : ''}`}>
        <div className="task-card-header-row">
          <span className={`badge ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
          {canEditDetails && (
            <div className="task-card-controls">
              <button 
                onClick={() => openEditTaskModal(task)} 
                className="task-action-icon edit" 
                title="Edit Task"
              >
                <Edit3 size={12} />
              </button>
              <button 
                onClick={() => handleDeleteTask(task.id, task.title)} 
                className="task-action-icon delete" 
                title="Delete Task"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="task-card-content">
          <h4 className="task-card-title">{task.title}</h4>
          {task.description && <p className="task-card-desc">{task.description}</p>}
        </div>

        <div className="task-card-footer-row">
          <div className="task-due-block">
            {isTaskOverdue ? (
              <div className="due-warning animate-pulse" title="Task is overdue!">
                <Clock size={12} />
                <span>Overdue!</span>
              </div>
            ) : (
              <div className="due-date">
                <Calendar size={12} />
                <span>
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          <div className="task-card-assignee" title={assignedUser ? `Assigned to: ${assignedUser.name}` : 'Unassigned'}>
            {assignedUser ? (
              <div className="assignee-capsule">
                <div className="assignee-avatar">
                  {assignedUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="assignee-text">{assignedUser.name.split(' ')[0]}</span>
              </div>
            ) : (
              <span className="unassigned-capsule">Unassigned</span>
            )}
          </div>
        </div>

        {/* Shifting Arrows (Interactive Status Progression) */}
        {canMoveTask && (
          <div className="task-move-footer">
            <button 
              onClick={() => handleShiftStatus(task, -1)} 
              className="shift-btn left"
              disabled={!canMoveLeft}
              title="Move backward"
            >
              <ArrowLeftIcon size={12} />
            </button>
            <span className="shift-label">Shift Status</span>
            <button 
              onClick={() => handleShiftStatus(task, 1)} 
              className="shift-btn right"
              disabled={!canMoveRight}
              title="Move forward"
            >
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    );
  }
};

export default ProjectDetails;
