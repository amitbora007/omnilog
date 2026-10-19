/**
 * Global API error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error to console in development
  if (process.env.NODE_ENV !== 'test') {
    console.error('API Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, error: 'Resource not found' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'unique';
    const message = `Duplicate value entered for ${field} field`;
    return res.status(400).json({ success: false, error: message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ success: false, error: message.join(', ') });
  }

  // Fallback to internal server error (mask internal details in production)
  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const safeMessage = (isProduction && statusCode === 500)
    ? 'An unexpected error occurred. Please try again later.'
    : (error.message || 'Internal Server Error');

  res.status(statusCode).json({
    success: false,
    error: safeMessage,
  });
};
