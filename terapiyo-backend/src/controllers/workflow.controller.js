import { validationResult } from 'express-validator';
import workflowService from '../services/workflow.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class WorkflowController {
  /**
   * Workflow endpoint'leri
   */
  createWorkflow = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const workflow = await workflowService.createWorkflow({
      ...req.body,
      creator: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: workflow
    });
  });

  updateWorkflow = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const workflow = await workflowService.updateWorkflow(
      req.params.workflowId,
      req.body
    );

    res.json({
      status: 'success',
      data: workflow
    });
  });

  activateWorkflow = catchAsync(async (req, res) => {
    const workflow = await workflowService.activateWorkflow(
      req.params.workflowId
    );

    res.json({
      status: 'success',
      data: workflow
    });
  });

  getWorkflows = catchAsync(async (req, res) => {
    const workflows = await workflowService.getWorkflows(req.query);

    res.json({
      status: 'success',
      data: workflows
    });
  });

  /**
   * Workflow Instance endpoint'leri
   */
  startWorkflow = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const instance = await workflowService.startWorkflow(
      req.params.workflowId,
      req.body
    );

    res.status(201).json({
      status: 'success',
      data: instance
    });
  });

  getWorkflowInstances = catchAsync(async (req, res) => {
    const instances = await workflowService.getWorkflowInstances(req.query);

    res.json({
      status: 'success',
      data: instances
    });
  });

  getWorkflowInstanceStatus = catchAsync(async (req, res) => {
    const instance = await workflowService.getWorkflowInstanceStatus(
      req.params.instanceId
    );

    res.json({
      status: 'success',
      data: instance
    });
  });

  /**
   * Approval Task endpoint'leri
   */
  handleApproval = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const task = await workflowService.handleApproval(
      req.params.taskId,
      req.user._id,
      req.body.action,
      req.body.comment
    );

    res.json({
      status: 'success',
      data: task
    });
  });

  getApprovalTasks = catchAsync(async (req, res) => {
    const tasks = await workflowService.getApprovalTasks({
      ...req.query,
      user: req.user._id
    });

    res.json({
      status: 'success',
      data: tasks
    });
  });

  /**
   * Workflow İstatistikleri endpoint'i
   */
  getWorkflowStats = catchAsync(async (req, res) => {
    const stats = await workflowService.getWorkflowStats();

    res.json({
      status: 'success',
      data: stats
    });
  });
}

export default new WorkflowController();
