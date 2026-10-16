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
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (err) {
      console.error('Google Auth Error:', err);
      return res.redirect(`${clientUrl}/?error=${encodeURIComponent(err.message || 'Authentication failed')}`);
    }
    if (!user) {
      const errorMsg = info?.message || 'Your account is deactivated, please contact customer support.';
      return res.redirect(`${clientUrl}/?error=${encodeURIComponent(errorMsg)}`);
    }
    req.user = user;
    return googleCallback(req, res);
  })(req, res, next);
});

// Current user profile
router.get('/me', protect, getMe);

// Logout
router.post('/logout', protect, logout);

export default router;
