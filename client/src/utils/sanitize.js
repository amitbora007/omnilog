import DOMPurify from 'dompurify';

// Configure DOMPurify hook to enforce rel="noopener noreferrer" on outbound links to prevent reverse tabnabbing
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    const href = node.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://') || node.getAttribute('target') === '_blank')) {
      node.setAttribute('rel', 'noopener noreferrer');
      node.setAttribute('target', '_blank');
    }
  }
});

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

