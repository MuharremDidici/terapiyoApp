import { Router } from 'express';
import { body, query, param } from 'express-validator';
import backupController from '../controllers/backup.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

/**
 * Yedekleme Yapılandırması rotaları
 */
router.post(
  '/configs',
  authenticate,
  authorize(['admin']),
  [
    body('name').isString().notEmpty(),
    body('type').isIn(['full', 'incremental', 'differential']),
    body('schedule.frequency').isIn(['hourly', 'daily', 'weekly', 'monthly']),
    body('schedule.dayOfWeek')
      .optional()
      .isInt({ min: 0, max: 6 }),
    body('schedule.dayOfMonth')
      .optional()
      .isInt({ min: 1, max: 31 }),
    body('schedule.hour')
      .optional()
      .isInt({ min: 0, max: 23 }),
    body('schedule.minute')
      .isInt({ min: 0, max: 59 }),
    body('retention.count').isInt({ min: 1 }),
    body('retention.duration').isInt({ min: 1 }),
    body('storage.type').isIn(['local', 's3', 'gcs', 'azure']),
    body('storage.config').isObject(),
    body('compression.enabled').optional().isBoolean(),
    body('compression.algorithm')
      .optional()
      .isIn(['gzip', 'bzip2', 'xz']),
    body('compression.level')
      .optional()
      .isInt({ min: 1, max: 9 }),
    body('encryption.enabled').optional().isBoolean(),
    body('encryption.algorithm')
      .optional()
      .isIn(['aes-256-cbc', 'aes-256-gcm']),
    body('encryption.keyId').optional().isString()
  ],
  backupController.createBackupConfig
);

router.put(
  '/configs/:configId',
  authenticate,
  authorize(['admin']),
  [
    param('configId').isMongoId(),
    body('name').optional().isString(),
    body('type').optional().isIn(['full', 'incremental', 'differential']),
    body('schedule').optional().isObject(),
    body('retention').optional().isObject(),
    body('storage').optional().isObject(),
    body('compression').optional().isObject(),
    body('encryption').optional().isObject(),
    body('status').optional().isIn(['active', 'paused'])
  ],
  backupController.updateBackupConfig
);

router.get(
  '/configs',
  authenticate,
  authorize(['admin']),
  [
    query('status').optional().isIn(['active', 'paused', 'error']),
    query('type').optional().isIn(['full', 'incremental', 'differential'])
  ],
  backupController.getBackupConfigs
);

/**
 * Yedekleme İşleri rotaları
 */
router.post(
  '/jobs/:configId',
  authenticate,
  authorize(['admin']),
  [
    param('configId').isMongoId(),
    body('type').optional().isIn(['scheduled', 'manual', 'auto'])
  ],
  backupController.createBackupJob
);

router.get(
  '/jobs',
  authenticate,
  authorize(['admin']),
  [
    query('status').optional()
      .isIn(['pending', 'running', 'completed', 'failed']),
    query('type').optional().isIn(['scheduled', 'manual', 'auto']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  backupController.getBackupJobs
);

router.get(
  '/jobs/:jobId/status',
  authenticate,
  authorize(['admin']),
  [
    param('jobId').isMongoId()
  ],
  backupController.getBackupJobStatus
);

/**
 * Geri Yükleme İşleri rotaları
 */
router.post(
  '/restore/:backupId',
  authenticate,
  authorize(['admin']),
  [
    param('backupId').isMongoId(),
    body('type').isIn(['full', 'partial']),
    body('scope').optional().isObject(),
    body('scope.collections').optional().isArray(),
    body('scope.query').optional().isObject()
  ],
  backupController.createRestoreJob
);

router.get(
  '/restore',
  authenticate,
  authorize(['admin']),
  [
    query('status').optional()
      .isIn(['pending', 'running', 'completed', 'failed']),
    query('type').optional().isIn(['full', 'partial']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  backupController.getRestoreJobs
);

router.get(
  '/restore/:jobId/status',
  authenticate,
  authorize(['admin']),
  [
    param('jobId').isMongoId()
  ],
  backupController.getRestoreJobStatus
);

/**
 * Yedekleme İstatistikleri rotası
 */
router.get(
  '/stats',
  authenticate,
  authorize(['admin']),
  backupController.getBackupStats
);

export default router;
