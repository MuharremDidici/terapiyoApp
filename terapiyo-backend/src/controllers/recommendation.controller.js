import { validationResult } from 'express-validator';
import recommendationService from '../services/recommendation.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class RecommendationController {
  /**
   * Update user preferences
   * @route PATCH /api/v1/recommendations/preferences
   */
  updatePreferences = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const preferences = await recommendationService.updateUserPreferences(
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: preferences
    });
  });

  /**
   * Get user preferences
   * @route GET /api/v1/recommendations/preferences
   */
  getPreferences = catchAsync(async (req, res) => {
    const preferences = await recommendationService.getUserPreferences(
      req.user.id
    );

    res.json({
      status: 'success',
      data: preferences
    });
  });

  /**
   * Generate recommendations
   * @route POST /api/v1/recommendations
   */
  generateRecommendations = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const recommendations = await recommendationService.generateRecommendations(
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: recommendations
    });
  });

  /**
   * Record feedback
   * @route POST /api/v1/recommendations/:id/feedback
   */
  recordFeedback = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const feedback = await recommendationService.recordFeedback(
      req.params.id,
      req.user.id,
      req.body.therapistId,
      req.body.action,
      req.body.position
    );

    res.status(201).json({
      status: 'success',
      data: feedback
    });
  });

  /**
   * Update session outcome
   * @route PATCH /api/v1/recommendations/feedback/:id/outcome
   */
  updateSessionOutcome = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const feedback = await recommendationService.updateSessionOutcome(
      req.params.id,
      req.body
    );

    res.json({
      status: 'success',
      data: feedback
    });
  });
}

export default new RecommendationController();
