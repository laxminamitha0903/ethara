import prisma from '../config/db.js';

// @desc    Get dashboard aggregated analytics
// @route   GET /api/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const now = new Date();

    // 1. Projects Query
    // Admins see all projects, Members see only joined/owned
    const projectFilter = isAdmin 
      ? {} 
      : {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        };

    const projectsCount = await prisma.project.count({
      where: projectFilter
    });

    // 2. Fetch projects to filter tasks properly
    const projects = await prisma.project.findMany({
      where: projectFilter,
      select: { id: true }
    });
    const projectIds = projects.map(p => p.id);

    // 3. Tasks Queries
    // Filter tasks based on projects the user has access to
    const taskFilter = {
      projectId: { in: projectIds }
    };

    const totalTasks = await prisma.task.count({
      where: taskFilter
    });

    const todoCount = await prisma.task.count({
      where: { ...taskFilter, status: 'TODO' }
    });

    const inProgressCount = await prisma.task.count({
      where: { ...taskFilter, status: 'IN_PROGRESS' }
    });

    const reviewCount = await prisma.task.count({
      where: { ...taskFilter, status: 'REVIEW' }
    });

    const completedCount = await prisma.task.count({
      where: { ...taskFilter, status: 'COMPLETED' }
    });

    // Overdue tasks (due date is in the past, and task is not completed)
    const overdueCount = await prisma.task.count({
      where: {
        ...taskFilter,
        dueDate: { lt: now },
        status: { not: 'COMPLETED' }
      }
    });

    // 4. Personal Tasks - tasks specifically assigned to this user that are not completed
    const myTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: 'COMPLETED' }
      },
      include: {
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { priority: 'desc' }, // High priority first? (Implicit order needs care, we'll sort or order by dueDate)
        { dueDate: 'asc' }
      ],
      take: 5 // Limit to 5 tasks
    });

    // 5. High Priority Tasks count (that are not completed)
    const highPriorityCount = await prisma.task.count({
      where: {
        ...taskFilter,
        priority: 'HIGH',
        status: { not: 'COMPLETED' }
      }
    });

    // 6. Overdue details for the widget
    const overdueTasksList = await prisma.task.findMany({
      where: {
        ...taskFilter,
        dueDate: { lt: now },
        status: { not: 'COMPLETED' }
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: 'asc' },
      take: 5
    });

    return res.json({
      summary: {
        projectsCount,
        totalTasks,
        overdueCount,
        highPriorityCount,
        completionRate: totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
      },
      taskStatusBreakdown: {
        todo: todoCount,
        inProgress: inProgressCount,
        review: reviewCount,
        completed: completedCount
      },
      myTasks,
      overdueTasksList
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return res.status(500).json({ message: 'Internal server error compiling dashboard data' });
  }
};
