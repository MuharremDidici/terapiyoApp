import { Router } from 'express';
import { body, param, query } from 'express-validator';
import documentationController from '../controllers/documentation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

/**
 * API Endpoint rotaları
 */
router.post(
  '/endpoints',
  authenticate,
  authorize(['admin', 'developer']),
  [
    body('path').isString().notEmpty(),
    body('method').isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    body('version').isString().notEmpty(),
    body('summary').isString().notEmpty(),
    body('parameters').optional().isArray(),
    body('requestBody').optional().isObject(),
    body('responses').isObject(),
    body('security').optional().isArray(),
    body('tags').optional().isArray()
  ],
  documentationController.createApiEndpoint
);

router.put(
  '/endpoints/:endpointId',
  authenticate,
  authorize(['admin', 'developer']),
  [
    param('endpointId').isMongoId(),
    body('summary').optional().isString(),
    body('description').optional().isString(),
    body('parameters').optional().isArray(),
    body('responses').optional().isObject(),
    body('security').optional().isArray(),
    body('tags').optional().isArray()
  ],
  documentationController.updateApiEndpoint
);

router.post(
  '/endpoints/:endpointId/deprecate',
  authenticate,
  authorize(['admin', 'developer']),
  [
    param('endpointId').isMongoId(),
    body('newVersion').isString().notEmpty()
  ],
  documentationController.deprecateApiEndpoint
);

/**
 * Documentation rotaları
 */
router.post(
  '/docs',
  authenticate,
  authorize(['admin', 'developer', 'technical_writer']),
  [
    body('title').isString().notEmpty(),
    body('type').isIn(['api', 'guide', 'tutorial', 'reference']),
    body('category').isString().notEmpty(),
    body('content').isString().notEmpty(),
    body('version').isString().notEmpty(),
    body('tags').optional().isArray(),
    body('metadata').optional().isObject()
  ],
  documentationController.createDocumentation
);

router.put(
  '/docs/:docId',
  authenticate,
  authorize(['admin', 'developer', 'technical_writer']),
  [
    param('docId').isMongoId(),
    body('title').optional().isString(),
    body('content').optional().isString(),
    body('status').optional().isIn(['draft', 'review', 'published']),
    body('tags').optional().isArray(),
    body('metadata').optional().isObject()
  ],
  documentationController.updateDocumentation
);

router.post(
  '/docs/:docId/publish',
  authenticate,
  authorize(['admin', 'developer']),
  [
    param('docId').isMongoId()
  ],
  documentationController.publishDocumentation
);

/**
 * Feedback rotaları
 */
router.post(
  '/feedback',
  [
    body('documentId').isMongoId(),
    body('type').isIn(['helpful', 'issue', 'suggestion']),
    body('content').isString().notEmpty()
  ],
  documentationController.createFeedback
);

router.post(
  '/feedback/:feedbackId/resolve',
  authenticate,
  authorize(['admin', 'developer', 'technical_writer']),
  [
    param('feedbackId').isMongoId(),
    body('resolution').isString().notEmpty()
  ],
  documentationController.resolveFeedback
);

/**
 * Changelog rotaları
 */
router.post(
  '/changelogs',
  authenticate,
  authorize(['admin', 'developer']),
  [
    body('version').isString().notEmpty(),
    body('releaseDate').isISO8601(),
    body('type').isIn(['major', 'minor', 'patch']),
    body('changes').isArray(),
    body('changes.*.type').isIn([
      'added',
      'changed',
      'deprecated',
      'removed',
      'fixed',
      'security'
    ]),
    body('changes.*.description').isString().notEmpty()
  ],
  documentationController.createChangelog
);

router.post(
  '/changelogs/:changelogId/publish',
  authenticate,
  authorize(['admin', 'developer']),
  [
    param('changelogId').isMongoId()
  ],
  documentationController.publishChangelog
);

/**
 * Swagger Spec rotası
 */
router.get(
  '/swagger',
  documentationController.getApiSpec
);

/**
 * Dokümantasyon Arama rotası
 */
router.get(
  '/search',
  [
    query('q').isString().notEmpty()
  ],
  documentationController.searchDocumentation
);

export default router;
