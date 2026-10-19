/**
 * Strips HTML tags from a string
 */
export const stripHtml = (html = '') => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
};

/**
 * Calculates estimated reading time in minutes based on ~200 WPM
 */
export const calculateReadingTime = (content = '') => {
  const plainText = stripHtml(content);
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return minutes > 0 ? minutes : 1;
};

/**
 * Generates a clean plain-text excerpt from rich text HTML
 */
export const generateExcerpt = (content = '', maxLength = 160) => {
  const plainText = stripHtml(content);
  if (plainText.length <= maxLength) {
    return plainText;
  }
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const cleanSnippet = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
  return `${cleanSnippet}...`;
};

/**
 * Cleans and normalizes tag strings into a unique array
 */
export const normalizeTags = (input) => {
  let tags = [];
  if (Array.isArray(input)) {
    tags = input;
  } else if (typeof input === 'string') {
    tags = input.split(',');
  }

  const cleaned = tags
    .map((tag) => tag.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''))
    .filter(Boolean);

  const unique = [...new Set(cleaned)];
  return unique.length > 0 ? unique : ['general'];
};

/**
 * Escapes characters with special meaning in regular expressions
 * Prevents ReDoS and regex syntax errors
 */
export const escapeRegex = (string = '') => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
};

/**
 * Safely extracts and trims a string parameter with maximum length guard
 */
export const cleanString = (val, fallback = '', maxLen = 200) => {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  return trimmed ? trimmed.slice(0, maxLen) : fallback;
};

