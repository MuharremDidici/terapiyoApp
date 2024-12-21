import { Router } from 'express';
import { body, param, query } from 'express-validator';
import integrationController from '../controllers/integration.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validateApiKey } from '../middleware/api-key.middleware.js';

const router = Router();

/**
 * Integration rotaları
 */
router.post(
  '/integrations',
  authenticate,
  authorize(['admin', 'developer']),
  [
    body('name').isString().notEmpty(),
    body('provider').isIn([
      'google',
      'zoom',
      'stripe',
      'sendgrid',
      'twilio',
      'slack',
      'custom'
    ]),
    body('type').isIn([
      'auth',
      'payment',
      'communication',
      'notification',
      'analytics',
      'storage',
      'other'
    ]),
    body('config').isObject(),
    body('credentials').isObject()
  ],
  integrationController.createIntegration
);

router.get(
  '/integrations/:integrationId',
  authenticate,
  [
    param('integrationId').isMongoId()
  ],
  integrationController.getIntegration
);

router.put(
  '/integrations/:integrationId',
  authenticate,
  authorize(['admin', 'developer']),
  [
    param('integrationId').isMongoId(),
    body('name').optional().isString(),
    body('status').optional().isIn(['active', 'inactive', 'error']),
    body('config').optional().isObject(),
    body('credentials').optional().isObject(),
    body('webhooks').optional().isArray()
  ],
  integrationController.updateIntegration
);

router.delete(
  '/integrations/:integrationId',
  authenticate,
  authorize(['admin']),
  [
    param('integrationId').isMongoId()
  ],
  integrationController.deleteIntegration
);

/**
 * API Key rotaları
 */
router.post(
  '/api-keys',
  authenticate,
  [
    body('name').isString().notEmpty(),
    body('scopes').isArray(),
    body('expiresAt').optional().isISO8601()
  ],
  integrationController.createApiKey
);

router.delete(
  '/api-keys/:keyId',
  authenticate,
  [
    param('keyId').isMongoId()
  ],
  integrationController.revokeApiKey
);

/**
 * Webhook rotaları
 */
router.post(
  '/webhooks/:integrationId',
  [
    param('integrationId').isMongoId(),
    body().isObject()
  ],
  integrationController.handleWebhook
);

/**
 * API Metrics rotaları
 */
router.get(
  '/metrics',
  authenticate,
  authorize(['admin', 'developer']),
  [
    query('user').optional().isMongoId(),
    query('apiKey').optional().isMongoId(),
    query('method').optional().isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    query('endpoint').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  integrationController.getApiMetrics
);

/**
 * Integration Dashboard rotası
 */
router.get(
  '/dashboard',
  authenticate,
  authorize(['admin', 'developer']),
  integrationController.getIntegrationDashboard
);

export default router;
