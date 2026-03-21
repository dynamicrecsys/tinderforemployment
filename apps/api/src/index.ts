import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { env } from './config/env';
import { connectStore } from './config/redis';
import { errorMiddleware } from './middleware/error.middleware';
import { initSocketServer } from './modules/chat/chat.gateway';

import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profile/profile.routes';
import jobRoutes from './modules/job/job.routes';
import swipeRoutes from './modules/swipe/swipe.routes';
import chatRoutes from './modules/chat/chat.routes';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : env.FRONTEND_URL || true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1', swipeRoutes);
app.use('/api/v1/chat', chatRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorMiddleware);

// Start
async function start() {
  await connectStore();

  // Init Socket.io
  initSocketServer(httpServer);

  const port = env.PORT || env.API_PORT;
  httpServer.listen(port, () => {
    console.log(`API server running on port ${port}`);
  });
}

start().catch(console.error);
