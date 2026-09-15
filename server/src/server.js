import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import vectorStore from './config/qdrant.js';
import ragService from './rag/ragService.js';
import errorHandler from './middleware/errorHandler.js';
import apiLimiter from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import specsRoutes from './routes/specsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Vector Database & RAG Policies
(async () => {
  try {
    await vectorStore.init();
    await ragService.initPolicies();
  } catch (err) {
    logger.warn(`Vector initialization: ${err.message}`);
  }
})();

// Security & Utility Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(apiLimiter);

// Serve uploaded resumes statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AI Recruitment Organization Backend',
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/jobs', jobRoutes);
app.use('/candidates', candidateRoutes);
app.use('/workflow', workflowRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/specs', specsRoutes);

// Centralized Error Handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
