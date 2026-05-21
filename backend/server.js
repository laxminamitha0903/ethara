import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Route imports
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Setup environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Production Static Serving
// If running in production (e.g. Railway), serve built React files
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_STATIC_URL || process.env.PORT) {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));

  // Catch-all route to serve React's index.html for client-side routing
  app.get('*', (req, res) => {
    // Avoid intercepting API calls that might be typos
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log(`[Server] Serving production static assets from: ${distPath}`);
} else {
  // Simple welcome root for development
  app.get('/', (req, res) => {
    res.send('Ethara Team Task Manager API is running...');
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});
