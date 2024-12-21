import { Router } from 'express';
import { body, query } from 'express-validator';
import notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authenticate,
  [
    query('read').optional().isBoolean(),
    query('type').optional().isString(),
    query('category').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  notificationController.getUserNotifications
);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/read',
  authenticate,
  notificationController.markAsRead
);

/**
 * @swagger
 * /notifications/read-all:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/read-all',
  authenticate,
  notificationController.markAllAsRead
);

/**
 * @swagger
 * /notifications/preferences:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification preferences
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/preferences',
  authenticate,
  notificationController.getPreferences
);

/**
 * @swagger
 * /notifications/preferences:
 *   patch:
 *     tags: [Notifications]
 *     summary: Update notification preferences
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/preferences',
  authenticate,
  [
    body('emailNotifications').optional().isBoolean(),
    body('pushNotifications').optional().isBoolean(),
    body('smsNotifications').optional().isBoolean(),
    body('appointmentReminders').optional().isBoolean(),
    body('messageNotifications').optional().isBoolean(),
    body('systemAnnouncements').optional().isBoolean()
  ],
  notificationController.updatePreferences
);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authenticate,
  notificationController.deleteNotification
);

export default router;
