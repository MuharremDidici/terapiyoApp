import { validationResult } from 'express-validator';
import performanceService from '../services/performance.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class PerformanceController {
  /**
   * Performans Metrik endpoint'leri
   */
  recordMetric = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const metric = await performanceService.recordMetric(req.body);

    res.status(201).json({
      status: 'success',
      data: metric
    });
  });

  getMetrics = catchAsync(async (req, res) => {
    const metrics = await performanceService.getMetrics(req.query);

    res.json({
      status: 'success',
      data: metrics
    });
  });

  /**
   * Resource Usage endpoint'leri
   */
  recordResourceUsage = catchAsync(async (req, res) => {
    const usage = await performanceService.recordResourceUsage();

    res.status(201).json({
      status: 'success',
      data: usage
    });
  });

  getResourceUsage = catchAsync(async (req, res) => {
    const usage = await performanceService.getResourceUsage(req.query);

    res.json({
      status: 'success',
      data: usage
    });
  });

  /**
   * Scaling Event endpoint'leri
   */
  createScalingEvent = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const event = await performanceService.createScalingEvent(req.body);

    res.status(201).json({
      status: 'success',
      data: event
    });
  });

  getScalingEvents = catchAsync(async (req, res) => {
    const events = await performanceService.getScalingEvents(req.query);

    res.json({
      status: 'success',
      data: events
    });
  });

  /**
   * Optimization Rule endpoint'leri
   */
  createOptimizationRule = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const rule = await performanceService.createOptimizationRule(req.body);

    res.status(201).json({
      status: 'success',
      data: rule
    });
  });

  updateOptimizationRule = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const rule = await performanceService.updateOptimizationRule(
      req.params.ruleId,
      req.body
    );

    res.json({
      status: 'success',
      data: rule
    });
  });

  /**
   * Performance Dashboard endpoint'i
   */
  getPerformanceDashboard = catchAsync(async (req, res) => {
    const period = req.query.period ? parseInt(req.query.period) : undefined;
    const dashboard = await performanceService.getPerformanceDashboard(period);

    res.json({
      status: 'success',
      data: dashboard
    });
  });

  /**
   * System Health endpoint'i
   */
  getSystemHealth = catchAsync(async (req, res) => {
    const [
      currentUsage,
      recentMetrics,
      activeScalingEvents
    ] = await Promise.all([
      performanceService.recordResourceUsage(),
      performanceService.getMetrics({
        startTime: new Date(Date.now() - 5 * 60 * 1000), // Son 5 dakika
        limit: 10
      }),
      performanceService.getScalingEvents({
        status: ['pending', 'in_progress'],
        limit: 5
      })
    ]);

    const health = {
      status: currentUsage.status,
      timestamp: new Date(),
      metrics: {
        cpu: currentUsage.metrics.cpu,
        memory: currentUsage.metrics.memory,
        disk: currentUsage.metrics.disk
      },
      recentMetrics,
      activeScalingEvents,
      recommendations: await performanceService.generateRecommendations()
    };

    res.json({
      status: 'success',
      data: health
    });
  });
}

export default new PerformanceController();
