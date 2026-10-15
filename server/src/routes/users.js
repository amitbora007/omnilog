import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All user management routes require valid JWT auth + Super Admin privileges
router.use(protect, requireAdmin);

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
