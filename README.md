# Ethara - Premium Full-Stack Team Task Manager ⚡

Ethara is a state-of-the-art, high-end full-stack Team Task Manager. It features a stunning glassmorphic dark-theme user experience, dynamic SVG-based analytics dashboards, role-based access controls, robust relational validations, and unified Express/React single-process architecture for zero-CORS production hosting.

## 🚀 Key Features

- **JWT Authentication & Security**: Secure signups and logins using bcryptjs password hashing and JWT token authorization.
- **Quick Evaluator Logins**: Toggle cards on the login screen to automatically seed and log in with preconfigured **Admin** and **Member** accounts.
- **Workspace Projects**: Admins can create, edit, delete, and search projects, while managing project-specific team members.
- **Collaborative Kanban Boards**: Interactive status boards allowing team members to transition tasks across To Do, In Progress, Review, and Completed columns.
- **Role-Based Task Management**: 
  - **Admins** have full CRUD control over tasks (assignment, priorities, due dates, descriptions).
  - **Members** can exclusively modify task statuses for collaborative progress, preventing unintended schema alterations.
- **Rich Analytics Dashboard**: Visually stunning dashboard detailing circular gradient progress rings, status distributions, overdue task panels, and personalized task lists.
- **Ephemerality & Overdue Alerts**: Interactive alarms highlighting overdue milestones requiring urgent follow-up.

---

## ⚙️ Technology Stack

- **Frontend**: React 18 + Vite, Vanilla CSS Variables, Lucide Icons, Custom Animated SVGs.
- **Backend**: Node.js + Express.js.
- **Database Layer**: MySQL with Prisma ORM.
- **Production Bundler**: Express serving production-compiled static React assets.

---

## 🔑 Seeded Demo Accounts

To make evaluation a seamless experience, a database seeder script is included. When seeded, you can use these quick-access accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ethara.com` | `admin123` | Full CRUD, member management, task assignment |
| **Team Member** | `member@ethara.com` | `member123` | View projects, status progression, personal dashboard |

---

## 🛠️ Local Installation & Setup

Follow these steps to run the application on your local machine:

### 1. Prerequisites
- **Node.js**: Version 18.0.0 or higher.
- **MySQL Database**: A running MySQL instance.

### 2. Clone & Install Dependencies
Navigate to the project root and run:
```bash
# Install root (backend) and nested (frontend) dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or copy the pre-seeded `.env` file) and specify your MySQL connection URL:
```env
# Database Connection String
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://root:yourpassword@localhost:3306/team_task_manager"

# JWT secret key for signing authentication tokens
JWT_SECRET="ethara_team_task_manager_secret_key_2026"

# Port configuration
PORT=5000

# Node Environment
NODE_ENV=development
```

### 4. Database Setup & Seeding
Create the database in MySQL, apply the Prisma migrations, and run the database seeder:
```bash
# Push the schema and create tables in your MySQL database
npm run db:push

# Pre-populate the database with the sample Admin/Member users and tasks
npm run db:seed
```

### 5. Start Development Servers
Run the unified dev script to spin up the Express server and Vite React client simultaneously:
```bash
npm run dev
```
- Frontend will be live at: `http://localhost:5173`
- Backend proxy will run at: `http://localhost:5000`

---

## 🌐 Production Deployment on Railway

The codebase has been specifically designed to compile the React frontend into static assets and serve them through the Node backend. This single-service architecture makes deploying to **Railway** extremely direct and saves hosting resources.

### Step-by-Step Railway Instructions:

1. **Create a Railway Project**:
   - Go to [Railway.app](https://railway.app/) and start a new project.
2. **Add a MySQL Database**:
   - Click **+ New** -> **Database** -> **Add MySQL**.
   - Railway will provision a dedicated MySQL service inside your project.
3. **Connect Your Repository**:
   - Click **+ New** -> **GitHub Repo** and connect your project repository.
4. **Link the Database to Your Service**:
   - Railway automatically injects connection parameters. In your Node Service settings, add the following environment variables:
     - `DATABASE_URL`: Set value to `${{MYSQL_URL}}` (Railway will automatically interpolate the MySQL connection string!).
     - `JWT_SECRET`: Generate a secure random string (e.g. `your-random-secure-string`).
     - `NODE_ENV`: Set to `production`.
5. **Configure Deploy & Build Commands**:
   - Railway reads your root `package.json` scripts.
   - The default build command will automatically execute: `npm run build` (which compiles Vite React into the `frontend/dist` folder).
   - The startup command is: `npm start` (starts the Express server, which serves the built React assets).
6. **Apply Production Migrations**:
   - In your Railway Service, go to the **Deployments** tab and add a deployment trigger or add `npx prisma db push` to your build cycle to ensure tables are always created on fresh databases.
7. **Expose a Public URL**:
   - Under your service's **Settings** tab, click **Generate Domain** to get your live deployment link!
