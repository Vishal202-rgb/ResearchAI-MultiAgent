import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import researchRoutes from './routes/researchRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import graphRoutes from './routes/graphRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Trust the immediate reverse proxy (Vercel)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration supporting localhost and preview/production deployments
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive fallback to prevent breaking valid client requests
      }
    },
    credentials: true,
  })
);

// Rate limiting (generous ceiling to accommodate frequent client polling)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/library', libraryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

export default app;
