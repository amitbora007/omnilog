import { jest } from '@jest/globals';
import { updatePost, deletePost, getPostById, getMyPosts } from '../src/controllers/postController.js';
import Post from '../src/models/Post.js';

describe('Super Admin CRUD Permissions Unit Tests', () => {
  const authorId = '507f1f77bcf86cd799439011';
  const otherUserId = '507f1f77bcf86cd799439022';
  const adminId = '507f1f77bcf86cd799439033';

  const mockPost = {
    _id: 'post_123',
    title: 'Test Post',
    body: 'Content',
    status: 'public',
    author: authorId,
    save: jest.fn().mockResolvedValue(true),
    populate: jest.fn().mockResolvedValue(true),
  };

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

  describe('updatePost authorization', () => {
    it('should reject modification from non-author non-admin with 403', async () => {
      jest.spyOn(Post, 'findById').mockResolvedValue(mockPost);

      const req = {
        params: { id: 'post_123' },
        user: { _id: otherUserId, role: 'user' },
        body: { title: 'Updated Title' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await updatePost(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Not authorized');
    });

    it('should allow modification from super admin on another user\'s post', async () => {
      jest.spyOn(Post, 'findById').mockResolvedValue({
        ...mockPost,
        author: authorId,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue(true),
      });

      const req = {
        params: { id: 'post_123' },
        user: { _id: adminId, role: 'admin' },
        body: { title: 'Admin Updated Title' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await updatePost(req, res, next);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Post updated successfully');
    });
  });

  describe('deletePost authorization', () => {
    it('should reject deletion from non-author non-admin with 403', async () => {
      jest.spyOn(Post, 'findById').mockResolvedValue(mockPost);

      const req = {
        params: { id: 'post_123' },
        user: { _id: otherUserId, role: 'user' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await deletePost(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Not authorized');
    });

    it('should allow deletion from super admin on another user\'s post', async () => {
      jest.spyOn(Post, 'findById').mockResolvedValue(mockPost);
      jest.spyOn(Post, 'findByIdAndDelete').mockResolvedValue(mockPost);

      const req = {
        params: { id: 'post_123' },
        user: { _id: adminId, role: 'admin' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await deletePost(req, res, next);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Post deleted successfully');
    });
  });

  describe('getPostById authorization for private posts', () => {
    it('should reject viewing private post by non-author non-admin with 403', async () => {
      const privatePost = {
        ...mockPost,
        status: 'private',
        author: { _id: authorId },
      };
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(privatePost),
      };
      jest.spyOn(Post, 'findById').mockReturnValue(mockQuery);

      const req = {
        params: { id: 'post_123' },
        user: { _id: otherUserId, role: 'user' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await getPostById(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('This post is private');
    });

    it('should allow viewing private post by super admin', async () => {
      const privatePost = {
        ...mockPost,
        status: 'private',
        author: { _id: authorId },
      };
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(privatePost),
      };
      jest.spyOn(Post, 'findById').mockReturnValue(mockQuery);

      const req = {
        params: { id: 'post_123' },
        user: { _id: adminId, role: 'admin' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await getPostById(req, res, next);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('private');
    });
  });

  describe('getMyPosts scope filtering for super admin', () => {
    it('should query all posts without author filter for super admin by default', async () => {
      const allPosts = [
        { _id: 'post_1', status: 'public', author: authorId },
        { _id: 'post_2', status: 'private', author: otherUserId },
      ];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(allPosts),
      };
      const findSpy = jest.spyOn(Post, 'find').mockReturnValue(mockQuery);

      const req = {
        query: {},
        user: { _id: adminId, role: 'admin' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await getMyPosts(req, res, next);

      expect(res.statusCode).toBe(200);
      expect(res.body.isAdmin).toBe(true);
      expect(res.body.scope).toBe('all');
      expect(findSpy).toHaveBeenCalledWith({});
    });

    it('should filter by admin author when scope=mine is requested', async () => {
      const adminPosts = [{ _id: 'post_1', status: 'public', author: adminId }];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(adminPosts),
      };
      const findSpy = jest.spyOn(Post, 'find').mockReturnValue(mockQuery);

      const req = {
        query: { scope: 'mine' },
        user: { _id: adminId, role: 'admin' },
      };
      const res = createMockRes();
      const next = jest.fn();

      await getMyPosts(req, res, next);

      expect(res.statusCode).toBe(200);
      expect(res.body.scope).toBe('mine');
      expect(findSpy).toHaveBeenCalledWith({ author: adminId });
    });
  });
});
