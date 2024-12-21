import { Router } from 'express';
import { query, param, body } from 'express-validator';
import reportingController from '../controllers/reporting.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

/**
 * Platform genel bakış raporu rotası
 */
router.get(
  '/overview',
  authenticate,
  authorize(['admin']),
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601()
  ],
  reportingController.getPlatformOverview
);

/**
 * Terapist performans raporu rotası
 */
router.get(
  '/therapist/:therapistId',
  authenticate,
  authorize(['admin', 'therapist']),
  [
    param('therapistId').isMongoId(),
    query('startDate').isISO8601(),
    query('endDate').isISO8601()
  ],
  reportingController.getTherapistReport
);

/**
 * Finansal rapor rotası
 */
router.get(
  '/financial',
  authenticate,
  authorize(['admin']),
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601()
  ],
  reportingController.getFinancialReport
);

/**
 * Özel rapor rotası
 */
router.post(
  '/custom',
  authenticate,
  authorize(['admin']),
  [
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('metrics').isArray(),
    body('charts').isArray()
  ],
  reportingController.generateCustomReport
);

/**
 * Dashboard rotaları
 */
router.get(
  '/dashboard',
  authenticate,
  reportingController.getDashboard
);

router.put(
  '/dashboard',
  authenticate,
  [
    body('widgets').isArray(),
    body('layout').optional().isObject()
  ],
  reportingController.updateDashboard
);

/**
 * Rapor indirme rotası
 */
router.get(
  '/download',
  authenticate,
  [
    query('reportId').isMongoId(),
    query('format').isIn(['pdf', 'csv'])
  ],
  reportingController.downloadReport
);

export default router;
