import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
} from '../controllers/projectController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all project routes
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(requireAdmin, createProject);

router.route('/:id')
  .get(getProjectById)
  .put(requireAdmin, updateProject)
  .delete(requireAdmin, deleteProject);

router.post('/:id/members', requireAdmin, addProjectMember);
router.delete('/:id/members/:userId', requireAdmin, removeProjectMember);

export default router;
