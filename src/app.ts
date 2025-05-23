import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { logger } from './config/logger';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import jobRoutes from './routes/job';
import matchingRoutes from './routes/matching';

const app = express();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
// Enable CORS
app.use(cors({
    origin:"*", //['http://localhost:5173', 'https://owow-job-portal.netlify.app'],
    credentials: true
  }));
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);



// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Compression
app.use(compression());

// Request logging
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matches', matchingRoutes);

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

export default app;
