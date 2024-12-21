import { validationResult } from 'express-validator';
import reviewService from '../services/review.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class ReviewController {
  /**
   * Create review
   * @route POST /api/v1/reviews
   */
  createReview = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const review = await reviewService.createReview(
      req.user.id,
      req.body.appointmentId,
      {
        ...req.body,
        platform: req.headers['user-agent'],
        device: req.device.type
      }
    );

    res.status(201).json({
      status: 'success',
      data: review
    });
  });

  /**
   * Get review by ID
   * @route GET /api/v1/reviews/:id
   */
  getReview = catchAsync(async (req, res) => {
    const review = await reviewService.getReview(req.params.id);

    res.json({
      status: 'success',
      data: review
    });
  });

  /**
   * Get therapist reviews
   * @route GET /api/v1/reviews/therapist/:id
   */
  getTherapistReviews = catchAsync(async (req, res) => {
    const result = await reviewService.getTherapistReviews(
      req.params.id,
      req.query
    );

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Get therapist statistics
   * @route GET /api/v1/reviews/therapist/:id/stats
   */
  getTherapistStats = catchAsync(async (req, res) => {
    const stats = await reviewService.getTherapistStats(req.params.id);

    res.json({
      status: 'success',
      data: stats
    });
  });

  /**
   * Update review
   * @route PATCH /api/v1/reviews/:id
   */
  updateReview = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const review = await reviewService.updateReview(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: review
    });
  });

  /**
   * Delete review
   * @route DELETE /api/v1/reviews/:id
   */
  deleteReview = catchAsync(async (req, res) => {
    await reviewService.deleteReview(req.params.id, req.user.id);

    res.json({
      status: 'success',
      message: 'Review deleted'
    });
  });

  /**
   * Moderate review
   * @route POST /api/v1/reviews/:id/moderate
   */
  moderateReview = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const review = await reviewService.moderateReview(
      req.params.id,
      req.user.id,
      req.body.action,
      req.body.reason
    );

    res.json({
      status: 'success',
      data: review
    });
  });

  /**
   * Flag review
   * @route POST /api/v1/reviews/:id/flag
   */
  flagReview = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const review = await reviewService.flagReview(
      req.params.id,
      req.user.id,
      req.body.reason,
      req.body.description
    );

    res.json({
      status: 'success',
      data: review
    });
  });

  /**
   * Mark review as helpful
   * @route POST /api/v1/reviews/:id/helpful
   */
  markHelpful = catchAsync(async (req, res) => {
    const review = await reviewService.markHelpful(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      data: review
    });
  });

  /**
   * Reply to review
   * @route POST /api/v1/reviews/:id/reply
   */
  replyToReview = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const review = await reviewService.replyToReview(
      req.params.id,
      req.user.id,
      req.body.text
    );

    res.json({
      status: 'success',
      data: review
    });
  });
}

export default new ReviewController();
