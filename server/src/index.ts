import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initializeSocket } from './config/socket';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { initScheduledTasks } from './utils/scheduler';
import routes from './routes';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET',
  'PORT'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} environment variable is required`);
    process.exit(1);
  }
}

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '20mb' })); // Support for large base64 images
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Home Appliance Maintenance API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      issues: '/api/issues',
      technician: '/api/technician',
      admin: '/api/admin',
      parts: '/api/parts',
      orders: '/api/orders',
      notifications: '/api/notifications'
    },
    documentation: 'https://github.com/yourusername/maintenance-app'
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Initialize scheduled tasks
initScheduledTasks();

// Start server
httpServer.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Home Appliance Maintenance API Server');
  console.log('='.repeat(60));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Socket.IO initialized`);
  console.log(`⏰ Scheduled tasks running`);
  console.log('='.repeat(60));
  console.log('\n✅ Server is ready to accept requests\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
