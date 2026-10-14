import express from 'express';
import {
  getPublicPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  getUserPublicPosts,
  getPopularTags,
} from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validatePostPayload } from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.get('/', getPublicPosts);
router.get('/tags/popular', getPopularTags);
router.get('/user/:userId', getUserPublicPosts);

// Authenticated user specific routes
router.get('/my-posts', protect, getMyPosts);

// Single post operations
router.get('/:id', optionalAuth, getPostById);
router.post('/', protect, validatePostPayload, createPost);
router.put('/:id', protect, validatePostPayload, updatePost);
router.delete('/:id', protect, deletePost);

export default router;
