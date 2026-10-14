import User from '../models/User.js';
import { sendTokenResponse, generateToken } from '../utils/jwt.js';

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
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
    const token = generateToken(req.user._id);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Set secure cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    // Redirect to frontend dashboard with token in query parameter for client storage
    res.redirect(`${clientUrl}/dashboard?token=${token}`);
  } catch (error) {
    console.error('Google Callback Error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/login?error=auth_failed`);
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
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

/**
/**
 * @desc    Admin / Developer quick login with Super Admin privileges
 * @route   POST /api/auth/admin-login (or POST /api/auth/dev-login)
 * @access  Public (disabled in production)
 */
export const adminLogin = async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Admin quick login is disabled in production',
    });
  }

  try {
    const {
      email = 'admin@omnilog.local',
      displayName = 'Super Admin',
      role = 'admin',
    } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        googleId: `admin_${Date.now()}`,
        displayName,
        firstName: displayName.split(' ')[0] || 'Super',
        lastName: displayName.split(' ')[1] || 'Admin',
        email,
        role: role || 'admin',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
        bio: 'OmniLog Super Administrator with full CRUD access.',
      });
    } else if (user.role !== 'admin' && role === 'admin') {
      user.role = 'admin';
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const devLogin = adminLogin;
