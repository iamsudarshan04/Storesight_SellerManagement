import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';

const router = express.Router();

// GET /api/user/profile - Get current user profile
router.get('/profile', authMiddleware, getProfile);

// PATCH /api/user/profile - Update profile
router.patch('/profile', authMiddleware, updateProfile);

// PATCH /api/user/change-password - Change password
router.patch('/change-password', authMiddleware, changePassword);

export default router;
