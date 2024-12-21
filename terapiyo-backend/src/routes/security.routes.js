import { Router } from 'express';
import { query, param, body } from 'express-validator';
import securityController from '../controllers/security.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

/**
 * Denetim günlüğü rotaları
 */
router.get(
  '/audit-logs',
  authenticate,
  authorize(['admin', 'security_analyst']),
  [
    query('user').optional().isMongoId(),
    query('action').optional().isString(),
    query('resource').optional().isString(),
    query('status').optional().isIn(['success', 'failure']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 1000 })
  ],
  securityController.getAuditLogs
);

/**
 * Güvenlik uyarısı rotaları
 */
router.get(
  '/alerts',
  authenticate,
  authorize(['admin', 'security_analyst']),
  [
    query('type').optional().isString(),
    query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('status').optional().isIn(['open', 'investigating', 'resolved', 'false_positive']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 1000 })
  ],
  securityController.getAlerts
);

router.patch(
  '/alerts/:alertId',
  authenticate,
  authorize(['admin', 'security_analyst']),
  [
    param('alertId').isMongoId(),
    body('status').isIn(['open', 'investigating', 'resolved', 'false_positive']),
    body('resolution').optional().isObject()
  ],
  securityController.updateAlertStatus
);

/**
 * Güvenlik politikası rotaları
 */
router.get(
  '/policies/:name',
  authenticate,
  authorize(['admin', 'security_analyst']),
  [
    param('name').isString()
  ],
  securityController.getPolicy
);

router.put(
  '/policies/:name',
  authenticate,
  authorize(['admin']),
  [
    param('name').isString(),
    body('description').optional().isString(),
    body('rules').optional().isArray(),
    body('version').optional().isInt()
  ],
  securityController.updatePolicy
);

/**
 * Güvenlik yapılandırması rotaları
 */
router.get(
  '/config/:key',
  authenticate,
  authorize(['admin', 'security_analyst']),
  [
    param('key').isString()
  ],
  securityController.getConfig
);

router.put(
  '/config/:key',
  authenticate,
  authorize(['admin']),
  [
    param('key').isString(),
    body('value').exists(),
    body('description').optional().isString()
  ],
  securityController.updateConfig
);

/**
 * Güvenlik durumu rotası
 */
router.get(
  '/status',
  authenticate,
  authorize(['admin', 'security_analyst']),
  securityController.getSecurityStatus
);

export default router;
