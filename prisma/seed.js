import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seeder] Starting database seeding...');

  // 1. Clear database (optional, but good for fresh installs)
  // Let's do it safely to avoid deleting existing data if user runs it twice, 
  // or we can check if data already exists first!
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('[Seeder] Database already contains users. Skipping seeding to prevent data duplication.');
    return;
  }

  // 2. Hash default passwords
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('admin123', salt);
  const memberPasswordHash = await bcrypt.hash('member123', salt);

  console.log('[Seeder] Creating sample users...');
  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ethara.com',
      name: 'Sarah Admin (PM)',
      password: defaultPasswordHash,
      role: 'ADMIN',
    },
  });

  const member = await prisma.user.create({
    data: {
      email: 'member@ethara.com',
      name: 'Alex Dev',
      password: memberPasswordHash,
      role: 'MEMBER',
    },
  });

  const alice = await prisma.user.create({
    data: {
      email: 'alice@ethara.com',
      name: 'Alice Designer',
      password: memberPasswordHash,
      role: 'MEMBER',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@ethara.com',
      name: 'Bob QA Tester',
      password: memberPasswordHash,
      role: 'MEMBER',
    },
  });

  console.log('[Seeder] Creating sample projects...');
  // 4. Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: '⚡ Ethara Web Platform Redesign',
      description: 'Overhaul the core web experience to introduce vibrant aesthetics, glassmorphic layout tokens, and robust performance optimization.',
      ownerId: admin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: '📱 Mobile Companion App',
      description: 'Build a compact companion application for Android and iOS using React Native. Focuses on notifications and fast dashboard reviews.',
      ownerId: admin.id,
    },
  });

  console.log('[Seeder] Adding project members...');
  // 5. Associate members with Project 1
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: admin.id, role: 'ADMIN' },
      { projectId: project1.id, userId: member.id, role: 'MEMBER' },
      { projectId: project1.id, userId: alice.id, role: 'MEMBER' },
      { projectId: project1.id, userId: bob.id, role: 'MEMBER' },
    ],
  });

  // Associate members with Project 2 (Sarah and Alex only)
  await prisma.projectMember.createMany({
    data: [
      { projectId: project2.id, userId: admin.id, role: 'ADMIN' },
      { projectId: project2.id, userId: member.id, role: 'MEMBER' },
    ],
  });

  console.log('[Seeder] Creating sample tasks...');
  // 6. Create Tasks for Project 1
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  // An overdue date (3 days ago)
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - 3);

  // Completed task
  await prisma.task.create({
    data: {
      title: 'Palette Design & Typography Spec',
      description: 'Define HSL CSS variables, glassmorphic style parameters, and select modern Google Fonts (Outfit & Inter) for the landing components.',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: overdueDate,
      projectId: project1.id,
      assigneeId: alice.id,
      creatorId: admin.id,
    },
  });

  // In Progress task assigned to the main member
  await prisma.task.create({
    data: {
      title: 'Integrate API Router & Auth Flow',
      description: 'Connect frontend context calls to backend Express endpoints. Secure routes with JWT tokens and implement login/signup screens.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: tomorrow,
      projectId: project1.id,
      assigneeId: member.id,
      creatorId: admin.id,
    },
  });

  // Review task
  await prisma.task.create({
    data: {
      title: 'Seeder Scripts & Migration Guidelines',
      description: 'Write a seed script in Prisma to pre-populate dashboard grids with mock tasks. Validate that user credentials load accurately on fresh installs.',
      status: 'REVIEW',
      priority: 'MEDIUM',
      dueDate: tomorrow,
      projectId: project1.id,
      assigneeId: admin.id,
      creatorId: admin.id,
    },
  });

  // Overdue Task to trigger alert board
  await prisma.task.create({
    data: {
      title: 'Database Schema Audit & Indexing',
      description: 'Audit the foreign key references, cascading deletes, and unique key combinations. Ensure MySQL indexes are configured for high-speed searches.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: overdueDate,
      projectId: project1.id,
      assigneeId: member.id,
      creatorId: admin.id,
    },
  });

  // To Do task (Bob)
  await prisma.task.create({
    data: {
      title: 'Write Jest / Playwright Integration Tests',
      description: 'Build test scenarios covering auth redirects, project creation restrictions for Members, task additions, and board status progression.',
      status: 'TODO',
      priority: 'LOW',
      dueDate: nextWeek,
      projectId: project1.id,
      assigneeId: bob.id,
      creatorId: admin.id,
    },
  });

  // Task for Project 2
  await prisma.task.create({
    data: {
      title: 'Setup Mobile Push Notifications API',
      description: 'Design a Firebase Cloud Messaging bridge to dispatch push alerts when tasks are assigned or status transitions occur.',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: nextWeek,
      projectId: project2.id,
      assigneeId: member.id,
      creatorId: admin.id,
    },
  });

  console.log('[Seeder] Database successfully seeded with rich mock data!');
}

main()
  .catch((e) => {
    console.error('[Seeder] Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
