import express from 'express';
import rateLimit from 'express-rate-limit';
import { submitContactForm } from '../controllers/contactController.js';

const router = express.Router();

// Strict rate limiter for public contact submissions: 5 requests per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many contact messages sent from this IP. Please wait a few minutes before trying again.',
  },
  skip: () => process.env.NODE_ENV === 'test', // Skip in automated tests
});

router.post('/', contactLimiter, submitContactForm);

export default router;
