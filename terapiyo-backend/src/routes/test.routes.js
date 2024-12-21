import { Router } from 'express';
import { query, param, body } from 'express-validator';
import testController from '../controllers/test.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

/**
 * Test Suite rotaları
 */
router.post(
  '/suites',
  authenticate,
  authorize(['admin', 'qa_engineer']),
  [
    body('name').isString().notEmpty(),
    body('type').isIn([
      'unit',
      'integration',
      'e2e',
      'performance',
      'security',
      'accessibility'
    ]),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('dependencies').optional().isArray(),
    body('configuration').optional().isObject()
  ],
  testController.createTestSuite
);

router.get(
  '/suites/:suiteId',
  authenticate,
  [
    param('suiteId').isMongoId()
  ],
  testController.getTestSuite
);

router.put(
  '/suites/:suiteId',
  authenticate,
  authorize(['admin', 'qa_engineer']),
  [
    param('suiteId').isMongoId(),
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('status').optional().isIn(['active', 'inactive', 'deprecated']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('configuration').optional().isObject()
  ],
  testController.updateTestSuite
);

/**
 * Test Case rotaları
 */
router.post(
  '/cases',
  authenticate,
  authorize(['admin', 'qa_engineer']),
  [
    body('suite').isMongoId(),
    body('name').isString().notEmpty(),
    body('steps').isArray(),
    body('steps.*.name').isString(),
    body('steps.*.action').isString(),
    body('steps.*.expectedResult').isString(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('automated').optional().isBoolean(),
    body('tags').optional().isArray()
  ],
  testController.createTestCase
);

router.get(
  '/cases',
  authenticate,
  [
    query('suite').optional().isMongoId(),
    query('status').optional().isIn(['active', 'inactive', 'blocked']),
    query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('automated').optional().isBoolean(),
    query('tags').optional().isArray()
  ],
  testController.getTestCases
);

router.put(
  '/cases/:caseId',
  authenticate,
  authorize(['admin', 'qa_engineer']),
  [
    param('caseId').isMongoId(),
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('steps').optional().isArray(),
    body('status').optional().isIn(['active', 'inactive', 'blocked']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('automated').optional().isBoolean()
  ],
  testController.updateTestCase
);

/**
 * Test Run rotaları
 */
router.post(
  '/runs/:suiteId',
  authenticate,
  authorize(['admin', 'qa_engineer']),
  [
    param('suiteId').isMongoId(),
    body('environment').isIn(['development', 'staging', 'production'])
  ],
  testController.startTestRun
);

router.get(
  '/runs/:runId',
  authenticate,
  [
    param('runId').isMongoId()
  ],
  testController.getTestRun
);

router.patch(
  '/runs/:runId/status',
  authenticate,
  authorize(['admin', 'qa_engineer']),
  [
    param('runId').isMongoId(),
    body('status').isIn(['queued', 'running', 'completed', 'failed', 'cancelled']),
    body('result').optional().isObject()
  ],
  testController.updateTestRunStatus
);

/**
 * Test Metric rotaları
 */
router.get(
  '/metrics',
  authenticate,
  [
    query('suiteId').optional().isMongoId(),
    query('type').optional().isIn([
      'coverage',
      'performance',
      'reliability',
      'maintainability'
    ]),
    query('period').optional().isNumeric()
  ],
  testController.getTestMetrics
);

/**
 * Test Report rotaları
 */
router.get(
  '/reports/:runId',
  authenticate,
  [
    param('runId').isMongoId(),
    query('format').optional().isIn(['json', 'pdf'])
  ],
  testController.generateTestReport
);

/**
 * Test Dashboard rotası
 */
router.get(
  '/dashboard',
  authenticate,
  testController.getTestDashboard
);

export default router;
