import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        error: 'Your account is deactivated, please contact customer support.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Google OAuth Callback Handler
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleCallback = async (req, res) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (req.user && (req.user.status === 'suspended' || req.user.status === 'inactive')) {
      return res.redirect(
        `${clientUrl}/?error=${encodeURIComponent('Your account is deactivated, please contact customer support.')}`
      );
    }

    const token = generateToken(req.user._id);

    // Set secure cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      partitioned: isProduction,
    });

    // Redirect to frontend dashboard with token in query parameter for client storage
    res.redirect(`${clientUrl}/dashboard?token=${token}`);
  } catch (error) {
    console.error('Google Callback Error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/?error=auth_failed`);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    partitioned: isProduction,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

