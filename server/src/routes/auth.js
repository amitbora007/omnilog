import express from 'express';
import passport from 'passport';
import { getMe, googleCallback, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Google OAuth initiate
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`,
    session: false,
  }),
  googleCallback
);

// Current user profile
router.get('/me', protect, getMe);

// Logout
router.post('/logout', protect, logout);

export default router;
