import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Helper to extract JWT token from Authorization header or cookie
 */
export const extractToken = (req) => {
  if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
    return { token: req.headers.authorization.split(' ')[1], isBearer: true };
  }
  if (req.cookies && req.cookies.token) {
    return { token: req.cookies.token, isBearer: false };
  }
  return { token: null, isBearer: false };
};

/**
 * Protect routes - requires a valid JWT cookie or Bearer token
 * Defends against CSRF on state-changing requests using ambient cookies
 */
export const protect = async (req, res, next) => {
  const { token, isBearer } = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this resource. Please log in.',
    });
  }

  // Anti-CSRF Guard: Defend against cross-site form submissions on state-changing requests using ambient cookies
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
  if (isMutation && !isBearer && process.env.NODE_ENV !== 'test') {
    let requestOrigin = req.headers.origin;
    if (!requestOrigin && req.headers.referer) {
      try {
        requestOrigin = new URL(req.headers.referer).origin;
      } catch {
        requestOrigin = null;
      }
    }
    if (requestOrigin) {
      requestOrigin = requestOrigin.replace(/\/+$/, '');
    }

    const allowedOrigins = [
      process.env.CLIENT_URL,
      'https://omnilog-one.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
    ]
      .filter(Boolean)
      .map((o) => o.replace(/\/+$/, ''));

    // If an explicit origin or referer was sent, verify it belongs to allowed origins
    if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
      return res.status(403).json({
        success: false,
        error: 'CSRF validation failed: Request origin is unauthorized.',
      });
    }

    // Guard against simple HTML form CSRF (<form> can only submit urlencoded/multipart/text without custom headers)
    const hasCustomHeader = Boolean(req.headers['x-requested-with'] || req.headers['authorization']);
    const isJsonRequest = Boolean(req.is('json') || req.headers['content-type']?.includes('application/json'));

    if (!requestOrigin && !hasCustomHeader && !isJsonRequest) {
      return res.status(403).json({
        success: false,
        error: 'CSRF validation failed: State-changing form submission requires valid origin or JSON payload.',
      });
    }
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
  const { token } = extractToken(req);

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
