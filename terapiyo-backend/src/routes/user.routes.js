import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  updatePassword
} from '../controllers/user.controller.js';

const router = express.Router();

// Profil işlemleri
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.patch('/profile/avatar', protect, upload.single('avatar'), updateAvatar);
router.patch('/profile/password', protect, updatePassword);

export default router;
