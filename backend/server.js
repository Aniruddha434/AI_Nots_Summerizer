import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import Logger from './utils/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter, securityHeaders, requestLogger } from './middleware/security.js';
import { authenticate } from './middleware/auth.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(securityHeaders);

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(generalLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Optional auth (does not block anonymous)
app.use(authenticate);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});



// Load routes dynamically after environment is configured
const loadRoutes = async () => {
  const { default: transcriptRoutes } = await import('./routes/transcripts.js');
  const { default: summaryRoutes } = await import('./routes/summaries.js');
  const { default: shareRoutes } = await import('./routes/share.js');
  const { default: authRoutes } = await import('./routes/auth.js');

  // API routes
  app.use('/api/transcripts', transcriptRoutes);
  app.use('/api/summaries', summaryRoutes);
  app.use('/api', summaryRoutes); // For /api/generate endpoint
  app.use('/api/share', shareRoutes);
  app.use('/api/auth', authRoutes);
};





// Start server with async route loading
const startServer = async () => {
  try {
    await loadRoutes();

    // 404 handler for API routes (moved here after routes are loaded)
    app.use('/api/*', notFound);

    // Global error handler
    app.use(errorHandler);

    // 404 handler for all other routes
    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    app.listen(PORT, () => {
      Logger.info(`🚀 Server running on port ${PORT}`);
      Logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      Logger.info(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
