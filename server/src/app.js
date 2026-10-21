import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';
import contactRoutes from './routes/contact.js';
import healthRoutes from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// High-performance Gzip/Deflate response compression for API payloads > 1KB
app.use(
  compression({
    threshold: 1024,
    level: 6,
  })
);

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible integration with React client
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://omnilog-one.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or approved origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Health check endpoints (exempt from rate limiting for cloud load balancers & monitors)
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);

// Global API rate limiter (300 requests per 15 minutes per IP)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

app.use(['/api', '/posts', '/users', '/auth', '/contact'], globalApiLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Passport setup
app.use(passport.initialize());
configurePassport();

// Logging in dev
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Mount API routes (support both /api/* and root paths)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/posts', postRoutes);
app.use('/posts', postRoutes);

app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

app.use('/api/contact', contactRoutes);
app.use('/contact', contactRoutes);


// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Listen if not imported by test runner
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 OmniLog API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

export default app;
