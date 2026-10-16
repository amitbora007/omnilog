import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Helper to extract JWT token from Authorization header or cookie
 */
export const extractToken = (req) => {
  if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
};

/**
 * Protect routes - requires a valid JWT cookie or Bearer token
 */
export const protect = async (req, res, next) => {
  const token = extractToken(req);

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

    if (user.status === 'suspended' || user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        error: 'Your account is deactivated, please contact customer support.',
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

  if (req.user.status === 'suspended' || req.user.status === 'inactive') {
    return res.status(403).json({
      success: false,
      error: 'Your administrator account has been suspended. Your account is deactivated, please contact customer support.',
    });
  }

  next();
};

/**
 * Optional auth - attaches req.user if a valid token is present, but doesn't block if missing
 */
export const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);

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
