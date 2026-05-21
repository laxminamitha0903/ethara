import prisma from '../config/db.js';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional().nullable(),
});

const memberAddSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// @desc    Get all projects (Admins see all; Members see only joined/owned)
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'ADMIN') {
      // Admins see all projects
      projects = await prisma.project.findMany({
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          _count: {
            select: { tasks: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Members see projects where they are owner OR listed as a ProjectMember
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { ownerId: req.user.id },
            {
              members: {
                some: { userId: req.user.id }
              }
            }
          ]
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          _count: {
            select: { tasks: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return res.json(projects);
  } catch (error) {
    console.error('Get Projects Error:', error);
    return res.status(500).json({ message: 'Internal server error fetching projects' });
  }
};

// @desc    Get specific project details
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            },
            creator: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // RBAC: Verify user has access to this project
    const isOwner = project.ownerId === req.user.id;
    const isMember = project.members.some(member => member.userId === req.user.id);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isMember && !isAdmin) {
      return res.status(403).json({ message: 'Access denied. You are not associated with this project' });
    }

    return res.json(project);
  } catch (error) {
    console.error('Get Project By ID Error:', error);
    return res.status(500).json({ message: 'Internal server error fetching project' });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req, res) => {
  try {
    const validatedData = projectSchema.parse(req.body);
    const { name, description } = validatedData;

    // Create the project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
      },
    });

    // Automatically add the creator as an Admin member of the project
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: req.user.id,
        role: 'ADMIN',
      }
    });

    const newProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true } } } },
        _count: { select: { tasks: true } }
      }
    });

    return res.status(201).json(newProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMsg });
    }
    console.error('Create Project Error:', error);
    return res.status(500).json({ message: 'Internal server error creating project' });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = async (req, res) => {
  const { id } = req.params;

  try {
    const validatedData = projectSchema.parse(req.body);
    const { name, description } = validatedData;

    // Check project exists
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // RBAC: Verify user owns project or is an Admin
    if (project.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to edit this project' });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { name, description },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true } } } }
      }
    });

    return res.json(updatedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMsg });
    }
    console.error('Update Project Error:', error);
    return res.status(500).json({ message: 'Internal server error updating project' });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // RBAC: Verify user owns project or is an Admin
    if (project.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await prisma.project.delete({
      where: { id }
    });

    return res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete Project Error:', error);
    return res.status(500).json({ message: 'Internal server error deleting project' });
  }
};

// @desc    Add a member to a project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
export const addProjectMember = async (req, res) => {
  const { id: projectId } = req.params;

  try {
    const validatedData = memberAddSchema.parse(req.body);
    const { email } = validatedData;

    // Check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // RBAC: Verify owner or Admin
    if (project.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to manage members' });
    }

    // Find the user to add
    const userToAdd = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!userToAdd) {
      return res.status(404).json({ message: 'No user found with this email address' });
    }

    // Check if user is already in the project
    const isMember = project.members.some(member => member.userId === userToAdd.id);

    if (isMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    // Add member
    const newMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role: userToAdd.role, // Matches global user role
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    return res.status(201).json(newMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMsg });
    }
    console.error('Add Project Member Error:', error);
    return res.status(500).json({ message: 'Internal server error adding member' });
  }
};

// @desc    Remove a member from a project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
export const removeProjectMember = async (req, res) => {
  const { id: projectId, userId } = req.params;

  try {
    // Check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // RBAC: Verify owner or Admin
    if (project.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to manage members' });
    }

    // Prevent removing the owner
    if (project.ownerId === userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner from the project' });
    }

    // Find and delete project member entry
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    return res.json({ message: 'Member removed from project successfully' });
  } catch (error) {
    console.error('Remove Project Member Error:', error);
    return res.status(500).json({ message: 'Internal server error removing member' });
  }
};
