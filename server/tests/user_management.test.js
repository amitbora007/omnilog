import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Post from '../src/models/Post.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../src/controllers/userController.js';
import { requireAdmin } from '../src/middleware/auth.js';

describe('User Management & RBAC Tests', () => {
  const adminId = '507f1f77bcf86cd799439001';
  const otherAdminId = '507f1f77bcf86cd799439002';
  const regularUserId = '507f1f77bcf86cd799439003';

  const createMockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = jest.fn().mockImplementation((code) => {
      res.statusCode = code;
      return res;
    });
    res.json = jest.fn().mockImplementation((data) => {
      res.body = data;
      return res;
    });
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Route Protection & requireAdmin Middleware', () => {
    it('GET /api/users without authentication token returns 401', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Not authorized/i);
    });

    it('POST /api/users without authentication token returns 401', async () => {
      const res = await request(app).post('/api/users').send({
        displayName: 'Test User',
        email: 'test@example.com',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('requireAdmin middleware rejects non-admin user with 403', () => {
      const req = { user: { _id: regularUserId, role: 'user', status: 'active' } };
      const res = createMockRes();
      const next = jest.fn();

      requireAdmin(req, res, next);
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Administrator privileges required');
      expect(next).not.toHaveBeenCalled();
    });

    it('requireAdmin middleware rejects suspended admin with 403', () => {
      const req = { user: { _id: adminId, role: 'admin', status: 'suspended' } };
      const res = createMockRes();
      const next = jest.fn();

      requireAdmin(req, res, next);
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('suspended');
      expect(next).not.toHaveBeenCalled();
    });

    it('requireAdmin middleware calls next() for active admin', () => {
      const req = { user: { _id: adminId, role: 'admin', status: 'active' } };
      const res = createMockRes();
      const next = jest.fn();

      requireAdmin(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUsers Controller', () => {
    it('returns paginated users with post counts and system metrics', async () => {
      const mockUsers = [
        {
          _id: adminId,
          displayName: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          toJSON: () => ({ _id: adminId, displayName: 'Admin User', role: 'admin' }),
        },
      ];

      jest.spyOn(User, 'countDocuments')
        .mockResolvedValueOnce(1) // total matching query
        .mockResolvedValueOnce(5) // totalUsers
        .mockResolvedValueOnce(2); // adminCount

      const mockFindQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockUsers),
      };
      jest.spyOn(User, 'find').mockReturnValue(mockFindQuery);

      jest.spyOn(Post, 'aggregate').mockResolvedValue([
        { _id: adminId, total: 3, public: 2, private: 1 },
      ]);

      const req = { query: { page: '1', limit: '10' } };
      const res = createMockRes();
      const next = jest.fn();

      await getUsers(req, res, next);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalUsers).toBe(5);
      expect(res.body.stats.adminCount).toBe(2);
      expect(res.body.stats.userCount).toBe(3);
      expect(res.body.data[0].postsCount).toBe(3);
    });
  });

  describe('getUserById Controller', () => {
    it('returns 404 if user not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      const req = { params: { id: 'nonexistent' } };
      const res = createMockRes();
      const next = jest.fn();

      await getUserById(req, res, next);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('returns user and their posts if user exists', async () => {
      const mockUser = { _id: regularUserId, displayName: 'Regular User', email: 'reg@example.com' };
      const mockPosts = [{ _id: 'post_1', title: 'Post 1' }];

      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      const mockSortQuery = { sort: jest.fn().mockResolvedValue(mockPosts) };
      jest.spyOn(Post, 'find').mockReturnValue(mockSortQuery);

      const req = { params: { id: regularUserId } };
      const res = createMockRes();
      const next = jest.fn();

      await getUserById(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user._id).toBe(regularUserId);
      expect(res.body.data.posts).toEqual(mockPosts);
    });
  });

  describe('createUser Controller', () => {
    it('rejects creation if displayName or email is missing', async () => {
      const req = { body: { displayName: '' } };
      const res = createMockRes();
      const next = jest.fn();

      await createUser(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('display name is required');
    });

    it('rejects creation if email already exists', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ _id: 'existing_id' });

      const req = { body: { displayName: 'John Doe', email: 'john@example.com' } };
      const res = createMockRes();
      const next = jest.fn();

      await createUser(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('already exists');
    });

    it('successfully creates user', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const createdUser = {
        _id: 'new_id',
        displayName: 'New Guy',
        email: 'new@example.com',
        role: 'user',
        status: 'active',
      };
      jest.spyOn(User, 'create').mockResolvedValue(createdUser);

      const req = { body: { displayName: 'New Guy', email: 'new@example.com' } };
      const res = createMockRes();
      const next = jest.fn();

      await createUser(req, res, next);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(createdUser);
    });
  });

  describe('updateUser Controller & Safety Guards', () => {
    it('Safety Guard 1: prevents an admin from demoting themselves', async () => {
      const mockAdmin = {
        _id: adminId,
        role: 'admin',
        save: jest.fn(),
      };
      jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

      const req = {
        params: { id: adminId },
        user: { _id: adminId, role: 'admin' },
        body: { role: 'user' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await updateUser(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('cannot demote your own administrator account');
    });

    it('Safety Guard 2: prevents an admin from suspending themselves', async () => {
      const mockAdmin = {
        _id: adminId,
        role: 'admin',
        status: 'active',
        save: jest.fn(),
      };
      jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

      const req = {
        params: { id: adminId },
        user: { _id: adminId, role: 'admin' },
        body: { status: 'suspended' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await updateUser(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('cannot suspend your own administrator account');
    });

    it('Safety Guard 3: prevents demoting the last active administrator', async () => {
      const mockOtherAdmin = {
        _id: otherAdminId,
        role: 'admin',
        status: 'active',
        save: jest.fn(),
      };
      jest.spyOn(User, 'findById').mockResolvedValue(mockOtherAdmin);
      jest.spyOn(User, 'countDocuments').mockResolvedValue(1); // only 1 active admin left

      const req = {
        params: { id: otherAdminId },
        user: { _id: adminId, role: 'admin' },
        body: { role: 'user' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await updateUser(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('last remaining active administrator');
    });

    it('allows an admin to promote or update another user when constraints pass', async () => {
      const mockTarget = {
        _id: regularUserId,
        displayName: 'Target User',
        email: 'target@example.com',
        role: 'user',
        status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findById').mockResolvedValue(mockTarget);

      const req = {
        params: { id: regularUserId },
        user: { _id: adminId, role: 'admin' },
        body: { role: 'admin' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await updateUser(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockTarget.role).toBe('admin');
      expect(mockTarget.save).toHaveBeenCalled();
    });
  });

  describe('deleteUser Controller & Cascading Deletion', () => {
    it('Safety Guard 1: prevents an admin from deleting their own account', async () => {
      const mockAdmin = { _id: adminId, role: 'admin' };
      jest.spyOn(User, 'findById').mockResolvedValue(mockAdmin);

      const req = {
        params: { id: adminId },
        user: { _id: adminId, role: 'admin' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await deleteUser(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('cannot delete your own account');
    });

    it('Safety Guard 2: prevents deleting the last administrator in the system', async () => {
      const mockTargetAdmin = { _id: otherAdminId, role: 'admin' };
      jest.spyOn(User, 'findById').mockResolvedValue(mockTargetAdmin);
      jest.spyOn(User, 'countDocuments').mockResolvedValue(1); // only 1 admin

      const req = {
        params: { id: otherAdminId },
        user: { _id: adminId, role: 'admin' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await deleteUser(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('last remaining administrator');
    });

    it('deletes user and cascades deletion to their posts', async () => {
      const mockTargetUser = { _id: regularUserId, role: 'user' };
      jest.spyOn(User, 'findById').mockResolvedValue(mockTargetUser);
      jest.spyOn(Post, 'deleteMany').mockResolvedValue({ deletedCount: 4 });
      jest.spyOn(User, 'findByIdAndDelete').mockResolvedValue(mockTargetUser);

      const req = {
        params: { id: regularUserId },
        user: { _id: adminId, role: 'admin' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await deleteUser(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Post.deleteMany).toHaveBeenCalledWith({ author: regularUserId });
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(regularUserId);
      expect(res.body.data.deletedPostsCount).toBe(4);
    });
  });
});
