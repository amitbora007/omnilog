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

export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user: {
      id: user._id,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      bio: user.bio,
      role: user.role || 'user',
      status: user.status || 'active',
    },
  });
};
