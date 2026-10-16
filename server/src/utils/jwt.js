import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'omnilog_fallback_jwt_secret_key_32chars_min';
};

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
};

