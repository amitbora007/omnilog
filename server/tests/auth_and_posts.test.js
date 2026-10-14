import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import { validatePostPayload } from '../src/middleware/validate.js';

describe('Auth & Validation Middleware Tests', () => {
  it('GET /api/auth/me should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Not authorized/i);
  });

  it('POST /api/posts should reject unauthenticated requests with 401', async () => {
    const res = await request(app).post('/api/posts').send({
      title: 'Unauthorized Post',
      body: '<p>Content</p>',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/posts/my-posts should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/posts/my-posts');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  describe('validatePostPayload Middleware Unit Tests', () => {
    it('should catch missing title on POST', () => {
      const req = { method: 'POST', body: { body: 'Some content' } };
      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };
      const next = jest.fn();

      validatePostPayload(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Post title is required');
      expect(next).not.toHaveBeenCalled();
    });

    it('should catch missing body on POST', () => {
      const req = { method: 'POST', body: { title: 'My Post Title' } };
      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.body = data;
          return this;
        },
      };
      const next = jest.fn();

      validatePostPayload(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Post body content is required');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() for valid post payload', () => {
      const req = {
        method: 'POST',
        body: {
          title: 'Valid Title',
          body: '<p>Valid content</p>',
          status: 'public',
        },
      };
      const res = {};
      const next = jest.fn();

      validatePostPayload(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
