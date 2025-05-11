import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
import { logger } from './config/logger';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

let server: any;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info('MongoDB connected');
    server = app.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server?.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close().then(() => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});
