import { Router } from 'express';
import { body, query } from 'express-validator';
import analyticsController from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /analytics/events:
 *   post:
 *     tags: [Analytics]
 *     summary: Track event
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/events',
  authenticate,
  [
    body('type').isString(),
    body('action').isString(),
    body('target').isString(),
    body('targetId').optional().isMongoId(),
    body('value').optional().isNumeric(),
    body('metadata').optional().isObject()
  ],
  analyticsController.trackEvent
);

/**
 * @swagger
 * /analytics/reports:
 *   post:
 *     tags: [Analytics]
 *     summary: Generate report
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/reports',
  authenticate,
  authorize(['admin', 'analyst']),
  [
    body('type').isIn([
      'platform_overview',
      'user_activity',
      'therapist_performance',
      'financial',
      'satisfaction',
      'custom'
    ]),
    body('period.start').isISO8601(),
    body('period.end').isISO8601(),
    body('filters').optional().isObject()
  ],
  analyticsController.generateReport
);

/**
 * @swagger
 * /analytics/reports/{id}:
 *   get:
 *     tags: [Analytics]
 *     summary: Get report
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/reports/:id',
  authenticate,
  authorize(['admin', 'analyst']),
  analyticsController.getReport
);

/**
 * @swagger
 * /analytics/dashboards:
 *   post:
 *     tags: [Analytics]
 *     summary: Create dashboard
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/dashboards',
  authenticate,
  [
    body('name').isString(),
    body('layout').isArray(),
    body('filters').optional().isObject(),
    body('refreshInterval').optional().isInt({ min: 60000 }), // Min 1 minute
    body('isPublic').optional().isBoolean()
  ],
  analyticsController.createDashboard
);

/**
 * @swagger
 * /analytics/dashboards/{id}:
 *   get:
 *     tags: [Analytics]
 *     summary: Get dashboard
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/dashboards/:id',
  authenticate,
  analyticsController.getDashboard
);

/**
 * @swagger
 * /analytics/dashboards/{id}:
 *   patch:
 *     tags: [Analytics]
 *     summary: Update dashboard
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/dashboards/:id',
  authenticate,
  [
    body('name').optional().isString(),
    body('layout').optional().isArray(),
    body('filters').optional().isObject(),
    body('refreshInterval').optional().isInt({ min: 60000 }),
    body('isPublic').optional().isBoolean()
  ],
  analyticsController.updateDashboard
);

/**
 * @swagger
 * /analytics/dashboards/{id}:
 *   delete:
 *     tags: [Analytics]
 *     summary: Delete dashboard
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/dashboards/:id',
  authenticate,
  analyticsController.deleteDashboard
);

/**
 * @swagger
 * /analytics/data:
 *   get:
 *     tags: [Analytics]
 *     summary: Get analytics data
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/data',
  authenticate,
  [
    query('metric').isString(),
    query('start').isISO8601(),
    query('end').isISO8601(),
    query('filters').optional().isString()
  ],
  analyticsController.getAnalyticsData
);

export default router;
