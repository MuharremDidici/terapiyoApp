import { Router } from 'express';
import { body, query, param } from 'express-validator';
import performanceController from '../controllers/performance.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

/**
 * Performans Metrik rotaları
 */
router.post(
  '/metrics',
  authenticate,
  [
    body('type').isIn([
      'response_time',
      'cpu_usage',
      'memory_usage',
      'disk_usage',
      'network_io',
      'database_query',
      'cache_hit_ratio',
      'error_rate',
      'concurrent_users'
    ]),
    body('service').isString().notEmpty(),
    body('value').isNumeric(),
    body('unit').isString().notEmpty(),
    body('tags').optional().isArray(),
    body('metadata').optional().isObject()
  ],
  performanceController.recordMetric
);

router.get(
  '/metrics',
  authenticate,
  [
    query('type').optional().isString(),
    query('service').optional().isString(),
    query('endpoint').optional().isString(),
    query('tags').optional().isArray(),
    query('startTime').optional().isISO8601(),
    query('endTime').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 1000 })
  ],
  performanceController.getMetrics
);

/**
 * Resource Usage rotaları
 */
router.post(
  '/resources',
  authenticate,
  authorize(['admin', 'system']),
  performanceController.recordResourceUsage
);

router.get(
  '/resources',
  authenticate,
  [
    query('instanceId').optional().isString(),
    query('type').optional().isString(),
    query('status').optional().isIn(['healthy', 'warning', 'critical']),
    query('startTime').optional().isISO8601(),
    query('endTime').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 1000 })
  ],
  performanceController.getResourceUsage
);

/**
 * Scaling Event rotaları
 */
router.post(
  '/scaling',
  authenticate,
  authorize(['admin', 'system']),
  [
    body('type').isIn(['scale_up', 'scale_down', 'auto_scale']),
    body('service').isString().notEmpty(),
    body('trigger').isIn([
      'cpu_threshold',
      'memory_threshold',
      'request_count',
      'error_rate',
      'manual',
      'scheduled'
    ])
  ],
  performanceController.createScalingEvent
);

router.get(
  '/scaling',
  authenticate,
  [
    query('type').optional().isString(),
    query('service').optional().isString(),
    query('status').optional().isIn(['pending', 'in_progress', 'completed', 'failed']),
    query('trigger').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 1000 })
  ],
  performanceController.getScalingEvents
);

/**
 * Optimization Rule rotaları
 */
router.post(
  '/rules',
  authenticate,
  authorize(['admin']),
  [
    body('name').isString().notEmpty(),
    body('type').isIn([
      'caching',
      'indexing',
      'query_optimization',
      'connection_pooling',
      'load_balancing',
      'auto_scaling'
    ]),
    body('target').isObject(),
    body('conditions').isArray(),
    body('actions').isArray(),
    body('priority').optional().isInt({ min: 0, max: 100 })
  ],
  performanceController.createOptimizationRule
);

router.put(
  '/rules/:ruleId',
  authenticate,
  authorize(['admin']),
  [
    param('ruleId').isMongoId(),
    body('name').optional().isString(),
    body('status').optional().isIn(['active', 'inactive', 'testing']),
    body('conditions').optional().isArray(),
    body('actions').optional().isArray(),
    body('priority').optional().isInt({ min: 0, max: 100 })
  ],
  performanceController.updateOptimizationRule
);

/**
 * Performance Dashboard rotası
 */
router.get(
  '/dashboard',
  authenticate,
  authorize(['admin', 'developer']),
  [
    query('period').optional().isInt({ min: 3600000 }) // Minimum 1 saat
  ],
  performanceController.getPerformanceDashboard
);

/**
 * System Health rotası
 */
router.get(
  '/health',
  authenticate,
  performanceController.getSystemHealth
);

export default router;
