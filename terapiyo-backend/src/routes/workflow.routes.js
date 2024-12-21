import { Router } from 'express';
import { body, query, param } from 'express-validator';
import workflowController from '../controllers/workflow.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

/**
 * Workflow rotaları
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'workflow_manager']),
  [
    body('name').isString().notEmpty(),
    body('type').isIn(['appointment', 'payment', 'review', 'report', 'custom']),
    body('trigger.event').isString().notEmpty(),
    body('trigger.conditions').optional().isArray(),
    body('steps').isArray().notEmpty(),
    body('steps.*.type').isIn([
      'notification',
      'email',
      'sms',
      'webhook',
      'function',
      'delay',
      'condition',
      'parallel',
      'approval'
    ]),
    body('steps.*.config').isObject(),
    body('variables').optional().isObject(),
    body('timeout').optional().isObject()
  ],
  workflowController.createWorkflow
);

router.put(
  '/:workflowId',
  authenticate,
  authorize(['admin', 'workflow_manager']),
  [
    param('workflowId').isMongoId(),
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('trigger').optional().isObject(),
    body('steps').optional().isArray(),
    body('variables').optional().isObject(),
    body('timeout').optional().isObject()
  ],
  workflowController.updateWorkflow
);

router.post(
  '/:workflowId/activate',
  authenticate,
  authorize(['admin', 'workflow_manager']),
  [
    param('workflowId').isMongoId()
  ],
  workflowController.activateWorkflow
);

router.get(
  '/',
  authenticate,
  [
    query('type').optional().isString(),
    query('status').optional().isIn(['active', 'inactive', 'draft']),
    query('version').optional().isInt(),
    query('creator').optional().isMongoId()
  ],
  workflowController.getWorkflows
);

/**
 * Workflow Instance rotaları
 */
router.post(
  '/:workflowId/start',
  authenticate,
  [
    param('workflowId').isMongoId(),
    body('data').optional().isObject()
  ],
  workflowController.startWorkflow
);

router.get(
  '/instances',
  authenticate,
  [
    query('workflow').optional().isMongoId(),
    query('status').optional().isIn([
      'pending',
      'running',
      'completed',
      'failed',
      'cancelled'
    ]),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  workflowController.getWorkflowInstances
);

router.get(
  '/instances/:instanceId/status',
  authenticate,
  [
    param('instanceId').isMongoId()
  ],
  workflowController.getWorkflowInstanceStatus
);

/**
 * Approval Task rotaları
 */
router.post(
  '/approvals/:taskId',
  authenticate,
  [
    param('taskId').isMongoId(),
    body('action').isIn(['approve', 'reject']),
    body('comment').optional().isString()
  ],
  workflowController.handleApproval
);

router.get(
  '/approvals',
  authenticate,
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'expired']),
    query('type').optional().isIn(['single', 'multiple', 'percentage']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  workflowController.getApprovalTasks
);

/**
 * Workflow İstatistikleri rotası
 */
router.get(
  '/stats',
  authenticate,
  authorize(['admin', 'workflow_manager']),
  workflowController.getWorkflowStats
);

export default router;
