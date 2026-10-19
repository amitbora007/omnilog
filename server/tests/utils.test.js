import { calculateReadingTime, generateExcerpt, normalizeTags, stripHtml, escapeRegex, cleanString } from '../src/utils/helpers.js';
import { generateToken, verifyToken } from '../src/utils/jwt.js';

describe('Utility Functions Unit Tests', () => {
  describe('stripHtml', () => {
    it('should remove HTML tags from markup', () => {
      const html = '<p>Hello <strong>World</strong>! <a href="#">Link</a></p>';
      expect(stripHtml(html)).toBe('Hello World! Link');
    });

    it('should handle empty or null string', () => {
      expect(stripHtml('')).toBe('');
      expect(stripHtml(null)).toBe('');
    });
  });

  describe('calculateReadingTime', () => {
    it('should return at least 1 minute for short content', () => {
      expect(calculateReadingTime('A quick post')).toBe(1);
    });

    it('should estimate reading time based on 200 words per minute', () => {
      const words = Array(600).fill('word').join(' ');
      expect(calculateReadingTime(words)).toBe(3);
    });
  });

  describe('generateExcerpt', () => {
    it('should return the full text if shorter than max length', () => {
      const text = 'Short post excerpt';
      expect(generateExcerpt(text, 50)).toBe('Short post excerpt');
    });

    it('should truncate at clean word boundary with ellipsis', () => {
      const text = 'The quick brown fox jumps over the lazy dog repeatedly';
      const excerpt = generateExcerpt(text, 25);
      expect(excerpt.endsWith('...')).toBe(true);
      expect(excerpt.length).toBeLessThanOrEqual(28);
    });
  });

  describe('normalizeTags', () => {
    it('should lowercase and sanitize tags array', () => {
      const tags = ['Tech', ' Node.js ', 'React#', 'DEVLOG'];
      expect(normalizeTags(tags)).toEqual(['tech', 'nodejs', 'react', 'devlog']);
    });

    it('should handle comma separated string', () => {
      expect(normalizeTags('tech, devlog, personal')).toEqual(['tech', 'devlog', 'personal']);
    });

    it('should default to general if tags are empty', () => {
      expect(normalizeTags([])).toEqual(['general']);
      expect(normalizeTags('')).toEqual(['general']);
    });
  });

  describe('escapeRegex and cleanString Security Helpers', () => {
    it('should escape regex metacharacters to prevent ReDoS and syntax errors', () => {
      expect(escapeRegex('(hello)*+[world]?^$')).toBe('\\(hello\\)\\*\\+\\[world\\]\\?\\^\\$');
      expect(escapeRegex('C++')).toBe('C\\+\\+');
      expect(escapeRegex('Node.js')).toBe('Node\\.js');
      expect(escapeRegex('')).toBe('');
      expect(escapeRegex(null)).toBe('');
    });

    it('should cleanly extract strings and reject non-string types', () => {
      expect(cleanString('  Valid Query  ')).toBe('Valid Query');
      expect(cleanString({ '$ne': 'admin' }, 'all')).toBe('all');
      expect(cleanString(['array'], 'default')).toBe('default');
      expect(cleanString(null, 'fallback')).toBe('fallback');
      expect(cleanString('A'.repeat(300), '', 50).length).toBe(50);
    });
  });

  describe('JWT Utilities', () => {
    it('should sign and verify valid user tokens', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateToken(userId);
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded.id).toBe(userId);
    });

    it('should return null for invalid tokens', () => {
      expect(verifyToken('invalid.malformed.token')).toBeNull();
    });

    it('should throw fatal error in production when JWT_SECRET is missing or insecure default', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalSecret = process.env.JWT_SECRET;

      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;

      expect(() => generateToken('test_user')).toThrow('FATAL: JWT_SECRET');

      process.env.NODE_ENV = originalEnv;
      process.env.JWT_SECRET = originalSecret;
    });
  });
});

