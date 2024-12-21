import { validationResult } from 'express-validator';
import analyticsService from '../services/analytics.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class AnalyticsController {
  /**
   * Track event
   * @route POST /api/v1/analytics/events
   */
  trackEvent = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const event = await analyticsService.trackEvent(
      req.body.type,
      req.user.id,
      req.body.action,
      req.body.target,
      req.body.targetId,
      req.body.value,
      req.body.metadata
    );

    res.status(201).json({
      status: 'success',
      data: event
    });
  });

  /**
   * Generate report
   * @route POST /api/v1/analytics/reports
   */
  generateReport = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const report = await analyticsService.generateReport(
      req.body.type,
      req.body.period,
      req.body.filters
    );

    res.status(201).json({
      status: 'success',
      data: report
    });
  });

  /**
   * Get report
   * @route GET /api/v1/analytics/reports/:id
   */
  getReport = catchAsync(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) {
      throw new ApiError(404, 'Report not found');
    }

    res.json({
      status: 'success',
      data: report
    });
  });

  /**
   * Create dashboard
   * @route POST /api/v1/analytics/dashboards
   */
  createDashboard = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const dashboard = await analyticsService.createDashboard(
      req.user.id,
      req.body
    );

    res.status(201).json({
      status: 'success',
      data: dashboard
    });
  });

  /**
   * Get dashboard
   * @route GET /api/v1/analytics/dashboards/:id
   */
  getDashboard = catchAsync(async (req, res) => {
    const dashboard = await analyticsService.getDashboard(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      data: dashboard
    });
  });

  /**
   * Update dashboard
   * @route PATCH /api/v1/analytics/dashboards/:id
   */
  updateDashboard = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const dashboard = await analyticsService.updateDashboard(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: dashboard
    });
  });

  /**
   * Delete dashboard
   * @route DELETE /api/v1/analytics/dashboards/:id
   */
  deleteDashboard = catchAsync(async (req, res) => {
    const success = await analyticsService.deleteDashboard(
      req.params.id,
      req.user.id
    );

    if (!success) {
      throw new ApiError(404, 'Dashboard not found');
    }

    res.json({
      status: 'success',
      message: 'Dashboard deleted'
    });
  });

  /**
   * Get analytics data
   * @route GET /api/v1/analytics/data
   */
  getAnalyticsData = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const data = await analyticsService.getAnalyticsData(
      req.query.metric,
      {
        start: new Date(req.query.start),
        end: new Date(req.query.end)
      },
      req.query.filters ? JSON.parse(req.query.filters) : {}
    );

    res.json({
      status: 'success',
      data
    });
  });
}

export default new AnalyticsController();
