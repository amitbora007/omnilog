import DOMPurify from 'dompurify';

/**
 * Sanitizes rich-text HTML string to prevent XSS attacks while preserving
 * formatting, links, and code blocks.
 */
export const sanitizeHtml = (dirtyHtml = '') => {
  if (!dirtyHtml) return '';

  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'b', 'i', 'strong', 'em', 'u', 's',
      'ul', 'ol', 'li', 'blockquote',
      'pre', 'code', 'span', 'div',
      'a', 'img', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'class', 'style'],
  });
};
