import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  FolderKanban, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  User, 
  CheckSquare, 
  X 
} from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { apiFetch, triggerToast, user } = useAuth();

  const fetchProjects = async () => {
    try {
      const res = await apiFetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      triggerToast('Could not load projects list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setName(proj.name);
    setDescription(proj.description || '');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (res.ok) {
        triggerToast(
          `Project "${name}" ${editingProject ? 'updated' : 'created'} successfully!`,
          'success'
        );
        setShowModal(false);
        fetchProjects(); // Reload list
      } else {
        triggerToast(data.message || 'Operation failed', 'error');
      }
    } catch (err) {
      console.error('Project form submit error:', err);
      triggerToast('Server communication failure', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id, projName) => {
    if (!window.confirm(`Are you absolutely sure you want to delete the project "${projName}"? This will also delete all associated tasks.`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        triggerToast(`Project "${projName}" deleted successfully`, 'success');
        setProjects(prev => prev.filter(p => p.id !== id));
      } else {
        const data = await res.json();
        triggerToast(data.message || 'Could not delete project', 'error');
      }
    } catch (err) {
      console.error('Delete project error:', err);
      triggerToast('Server communication failure', 'error');
    }
  };

  const filteredProjects = projects.filter(proj => 
    proj.name.toLowerCase().includes(search.toLowerCase()) ||
    (proj.description && proj.description.toLowerCase().includes(search.toLowerCase()))
  );

  const isAdmin = user.role === 'ADMIN';

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="projects-page fade-in">
      <div className="projects-header">
        <div className="header-text">
          <h1>Workspace Projects</h1>
          <p>Manage and orchestrate team activities across workspaces</p>
        </div>
        {isAdmin && (
          <button onClick={openCreateModal} className="btn-primary">
            <Plus size={18} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="toolbar-area glass-card">
        <div className="search-box-container">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search projects by name or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="total-projects-indicator">
          <span>Displaying <strong>{filteredProjects.length}</strong> of {projects.length} projects</span>
        </div>
      </div>

      {/* Projects Grid List */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card empty-projects-panel">
          <FolderKanban size={48} className="empty-icon" />
          <h3>No Projects Found</h3>
          <p>
            {search 
              ? 'No projects match your search parameters. Try clearing your filters!'
              : isAdmin 
                ? 'Create your first project to get started!'
                : 'You have not been added to any projects yet. Contact an administrator!'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="btn-secondary" style={{ marginTop: '1rem' }}>
              Clear Search
            </button>
          )}
          {!search && isAdmin && (
            <button onClick={openCreateModal} className="btn-primary" style={{ marginTop: '1rem' }}>
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map(proj => {
            const isProjectCreator = proj.ownerId === user.id;
            const canManage = isAdmin || isProjectCreator;
            
            return (
              <div key={proj.id} className="glass-card project-card interactive">
                <div className="project-card-header">
                  <div className="project-card-icon">
                    <FolderKanban size={20} />
                  </div>
                  {canManage && (
                    <div className="project-card-actions">
                      <button 
                        onClick={() => openEditModal(proj)} 
                        className="card-action-btn edit-btn" 
                        title="Edit Project"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(proj.id, proj.name)} 
                        className="card-action-btn delete-btn" 
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="project-card-body">
                  <h3 className="project-name-title">{proj.name}</h3>
                  <p className="project-desc-text">
                    {proj.description || 'No description provided for this project.'}
                  </p>
                </div>

                <div className="project-card-footer">
                  <div className="project-owner-info" title={`Owned by ${proj.owner.name}`}>
                    <User size={12} className="owner-icon" />
                    <span>{isProjectCreator ? 'Me' : proj.owner.name}</span>
                  </div>
                  
                  <div className="project-metrics">
                    <div className="task-indicator">
                      <CheckSquare size={12} />
                      <span>{proj._count?.tasks || 0} tasks</span>
                    </div>
                    
                    <Link to={`/projects/${proj.id}`} className="open-board-link">
                      <span>Board</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => !submitting && setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="glass-card">
              <div className="modal-header">
                <h2>{editingProject ? 'Edit Project Settings' : 'Create New Project'}</h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="modal-close-btn"
                  disabled={submitting}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-name">Project Title</label>
                  <input
                    type="text"
                    id="proj-name"
                    className="form-input"
                    placeholder="e.g. Q3 Product Launch"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="proj-desc">Project Description (Optional)</label>
                  <textarea
                    id="proj-desc"
                    className="form-input"
                    rows="4"
                    placeholder="Provide a high-level summary of goals, timelines, and deliverables..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitting}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="modal-footer-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : editingProject ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .projects-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-text h1 {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 40%, var(--text-muted) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-text p {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-top: 0.25rem;
        }

        /* Toolbar */
        .toolbar-area {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          gap: 1.5rem;
        }

        .search-box-container {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 500px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-dark);
        }

        .search-input {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          color: var(--text-main);
          padding: 0.6rem 1rem 0.6rem 2.5rem;
          width: 100%;
          font-family: var(--font-body);
          font-size: 0.88rem;
          transition: var(--trans-normal);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-primary-glow);
          background: rgba(255, 255, 255, 0.04);
        }

        .total-projects-indicator {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .total-projects-indicator strong {
          color: #fff;
        }

        /* Empty states */
        .empty-projects-panel {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .empty-projects-panel h3 {
          font-size: 1.25rem;
          color: #fff;
        }

        .empty-projects-panel p {
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 400px;
        }

        /* Grid */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .project-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 220px;
        }

        .project-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .project-card-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background: rgba(99, 102, 241, 0.08);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-glow);
        }

        .project-card-actions {
          display: flex;
          gap: 0.35rem;
        }

        .card-action-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--trans-fast);
        }

        .card-action-btn:hover {
          color: #fff;
        }

        .edit-btn:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: var(--accent-primary);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--color-danger);
          color: var(--color-danger) !important;
        }

        .project-card-body {
          flex: 1;
          margin-bottom: 1.5rem;
        }

        .project-name-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .project-desc-text {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .project-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
          font-size: 0.8rem;
        }

        .project-owner-info {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-dark);
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .owner-icon {
          flex-shrink: 0;
        }

        .project-metrics {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .task-indicator {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--text-muted);
        }

        .open-board-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 600;
          transition: var(--trans-fast);
        }

        .open-board-link:hover {
          color: var(--accent-secondary);
          transform: translateY(-1px);
        }

        /* Modal Details */
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.75rem;
        }

        .modal-header h2 {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 700;
          color: #fff;
        }

        .modal-close-btn {
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

        .modal-close-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .toolbar-area {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .total-projects-indicator {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Projects;
