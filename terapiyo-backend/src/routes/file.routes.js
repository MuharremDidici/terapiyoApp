import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import fileController from '../controllers/file.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * @swagger
 * /files:
 *   post:
 *     tags: [Files]
 *     summary: Upload file
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 */
router.post(
  '/',
  authenticate,
  upload.single('file'),
  [
    body('type').isIn(['profile', 'message', 'document', 'other']),
    body('isPublic').optional().isBoolean()
  ],
  fileController.uploadFile
);

/**
 * @swagger
 * /files/{id}:
 *   get:
 *     tags: [Files]
 *     summary: Get file by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  authenticate,
  fileController.getFile
);

/**
 * @swagger
 * /files:
 *   get:
 *     tags: [Files]
 *     summary: Get user files
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authenticate,
  fileController.getUserFiles
);

/**
 * @swagger
 * /files/{id}/access:
 *   patch:
 *     tags: [Files]
 *     summary: Update file access
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/access',
  authenticate,
  [
    body('isPublic').optional().isBoolean(),
    body('expiresAt').optional().isISO8601(),
    body('password').optional().isString()
  ],
  fileController.updateAccess
);

/**
 * @swagger
 * /files/{id}:
 *   delete:
 *     tags: [Files]
 *     summary: Delete file
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authenticate,
  fileController.deleteFile
);

/**
 * @swagger
 * /files/usage:
 *   get:
 *     tags: [Files]
 *     summary: Get storage usage
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/usage',
  authenticate,
  fileController.getStorageUsage
);

/**
 * @swagger
 * /files/{id}/share:
 *   post:
 *     tags: [Files]
 *     summary: Share file with user
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/share',
  authenticate,
  [
    body('userId').isMongoId(),
    body('permission').isIn(['read', 'write', 'admin'])
  ],
  fileController.shareFile
);

/**
 * @swagger
 * /files/{id}/access/{userId}:
 *   delete:
 *     tags: [Files]
 *     summary: Revoke file access
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id/access/:userId',
  authenticate,
  fileController.revokeAccess
);

export default router;
