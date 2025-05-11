import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/job-matcher',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',
  openaiApiKey: process.env.OPENAI_API_KEY,
} as const;

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY'] as const;
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
} 