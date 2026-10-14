/**
 * Validates post creation and update payloads
 */
export const validatePostPayload = (req, res, next) => {
  const { title, body, status } = req.body;
  const errors = [];

  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Post title is required');
    } else if (title.trim().length > 200) {
      errors.push('Post title cannot exceed 200 characters');
    }

    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      errors.push('Post body content is required');
    }
  }

  if (req.method === 'PUT') {
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Post title cannot be empty');
      } else if (title.trim().length > 200) {
        errors.push('Post title cannot exceed 200 characters');
      }
    }

    if (body !== undefined && (typeof body !== 'string' || body.trim().length === 0)) {
      errors.push('Post body content cannot be empty');
    }
  }

  if (status !== undefined && !['public', 'private'].includes(status)) {
    errors.push('Post status must be either "public" or "private"');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', '),
      errors,
    });
  }

  next();
};
