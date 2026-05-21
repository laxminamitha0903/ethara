import express from 'express';
import {
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', requireAdmin, createTask);
router.put('/:id', updateTask);
router.delete('/:id', requireAdmin, deleteTask);

export default router;
