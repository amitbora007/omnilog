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

  describe('Passport Google Strategy Verify Callback Tests', () => {
    let verifyCallback;

    beforeAll(async () => {
      const passport = (await import('passport')).default;
      const { configurePassport } = await import('../src/config/passport.js');
      process.env.GOOGLE_CLIENT_ID = 'test_client_id';
      process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
      process.env.ADMIN_EMAILS = 'admin@example.com';
      configurePassport();
      const strategy = passport._strategy('google');
      verifyCallback = strategy._verify;
    });

    it('creates a new user when user does not exist in DB without ReferenceError', async () => {
      const User = (await import('../src/models/User.js')).default;
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const createdUser = {
        _id: 'new_google_user_id',
        googleId: 'google_123',
        displayName: 'Google Tester',
        email: 'tester@example.com',
        role: 'user',
      };
      jest.spyOn(User, 'create').mockResolvedValue(createdUser);

      const profile = {
        id: 'google_123',
        displayName: 'Google Tester',
        emails: [{ value: 'tester@example.com' }],
        photos: [{ value: 'https://avatar.google.com/test.jpg' }],
      };

      const done = jest.fn();
      await verifyCallback('access_token', 'refresh_token', profile, done);

      expect(done).toHaveBeenCalledWith(null, createdUser);
    });

    it('updates existing user and promotes if in ADMIN_EMAILS', async () => {
      const User = (await import('../src/models/User.js')).default;
      const existingUser = {
        _id: 'existing_admin_id',
        googleId: 'google_admin_123',
        displayName: 'Old Name',
        email: 'admin@example.com',
        role: 'user',
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(existingUser);

      const profile = {
        id: 'google_admin_123',
        displayName: 'New Admin Name',
        emails: [{ value: 'admin@example.com' }],
        photos: [{ value: 'https://avatar.google.com/admin.jpg' }],
      };

      const done = jest.fn();
      await verifyCallback('access_token', 'refresh_token', profile, done);

      expect(existingUser.role).toBe('admin');
      expect(existingUser.displayName).toBe('New Admin Name');
      expect(existingUser.save).toHaveBeenCalled();
      expect(done).toHaveBeenCalledWith(null, existingUser);
    });
  });
});

