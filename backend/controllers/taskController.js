import prisma from '../config/db.js';
import { z } from 'zod';

const taskCreateSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().transform((str) => new Date(str)),
  projectId: z.string().min(1, 'Project ID is required'),
  assigneeId: z.string().optional().nullable(),
});

const taskUpdateSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
  assigneeId: z.string().optional().nullable(),
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = async (req, res) => {
  try {
    const validatedData = taskCreateSchema.parse(req.body);
    const { title, description, status, priority, dueDate, projectId, assigneeId } = validatedData;

    // Check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // RBAC: Verify user owns project or is Admin
    if (project.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to create tasks in this project' });
    }

    // Check assignee is a member of the project if assignee is provided
    if (assigneeId) {
      const isMember = project.members.some(member => member.userId === assigneeId) || project.ownerId === assigneeId;
      if (!isMember) {
        return res.status(400).json({ message: 'Assignee must be a member of this project' });
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate,
        projectId,
        assigneeId: assigneeId || null,
        creatorId: req.user.id
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        creator: {
          select: { id: true, name: true }
        }
      }
    });

    return res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMsg });
    }
    console.error('Create Task Error:', error);
    return res.status(500).json({ message: 'Internal server error creating task' });
  }
};

// @desc    Update a task (Admin can update all; Members can only update status)
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: { members: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is associated with the project
    const isMember = task.project.members.some(m => m.userId === req.user.id) || task.project.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: 'Access denied. You are not associated with this project' });
    }

    // Schema validation for inputs
    const validatedData = taskUpdateSchema.parse(req.body);

    // RBAC Permissions Logic:
    let updateData = {};

    if (isAdmin || task.project.ownerId === req.user.id) {
      // Admins or project owners can update anything
      if (validatedData.title !== undefined) updateData.title = validatedData.title;
      if (validatedData.description !== undefined) updateData.description = validatedData.description;
      if (validatedData.status !== undefined) updateData.status = validatedData.status;
      if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
      if (validatedData.dueDate !== undefined) updateData.dueDate = validatedData.dueDate;
      
      if (validatedData.assigneeId !== undefined) {
        if (validatedData.assigneeId) {
          // Verify assignee is in project
          const isAssigneeInProject = task.project.members.some(m => m.userId === validatedData.assigneeId) || task.project.ownerId === validatedData.assigneeId;
          if (!isAssigneeInProject) {
            return res.status(400).json({ message: 'Assignee must be a member of this project' });
          }
          updateData.assigneeId = validatedData.assigneeId;
        } else {
          updateData.assigneeId = null;
        }
      }
    } else {
      // Normal members can ONLY update status
      if (
        validatedData.title !== undefined ||
        validatedData.description !== undefined ||
        validatedData.priority !== undefined ||
        validatedData.dueDate !== undefined ||
        validatedData.assigneeId !== undefined
      ) {
        return res.status(403).json({ message: 'Members can only update the task status. Other fields require Administrator permissions' });
      }

      if (validatedData.status !== undefined) {
        // Allow members to update status if they are in the project (already checked isMember)
        updateData.status = validatedData.status;
      }
    }

    // Update Task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        creator: {
          select: { id: true, name: true }
        }
      }
    });

    return res.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMsg });
    }
    console.error('Update Task Error:', error);
    return res.status(500).json({ message: 'Internal server error updating task' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // RBAC: Verify owner or Admin
    if (task.project.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete tasks' });
    }

    await prisma.task.delete({
      where: { id }
    });

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return res.status(500).json({ message: 'Internal server error deleting task' });
  }
};
