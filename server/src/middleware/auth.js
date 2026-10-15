import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Protect routes - requires a valid JWT cookie or Bearer token
 */
export const protect = async (req, res, next) => {
  let token;

  // Check Authorization Bearer header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback to HttpOnly cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this resource. Please log in.',
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
  }

  try {
    const user = await User.findById(decoded.id).select('-__v');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User associated with this token no longer exists.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require Super Admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Administrator privileges required.',
    });
  }

  if (req.user.status === 'suspended') {
    return res.status(403).json({
      success: false,
      error: 'Your administrator account has been suspended.',
    });
  }

  next();
};

/**
 * Optional auth - attaches req.user if a valid token is present, but doesn't block if missing
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        const user = await User.findById(decoded.id).select('-__v');
        if (user) {
          req.user = user;
        }
      } catch (err) {
        // Ignore errors in optional auth
      }
    }
  }

  next();
};
