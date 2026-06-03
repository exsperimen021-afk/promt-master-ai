import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, validateConfig } from '@config/env';
import { logger } from '@utils/logger';
import { errorHandler } from '@utils/error-handler';
import { globalLimiter } from '@middlewares/rate-limit';
import authRoutes from '@routes/auth';
import userRoutes from '@routes/user';
import promptRoutes from '@routes/prompts';

validateConfig();

const app: Express = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(globalLimiter);

// Logging
app.use(morgan('combined'));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prompts', promptRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

const PORT = config.PORT;

app.listen(PORT, () => {
  logger.info(`✅ Server running at http://localhost:${PORT}`);
  logger.info(`📍 Environment: ${config.NODE_ENV}`);
  logger.info(`🌍 CORS Origin: ${config.CORS_ORIGIN}`);
});

export default app;
