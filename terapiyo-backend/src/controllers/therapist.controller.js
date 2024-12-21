import { validationResult } from 'express-validator';
import therapistService from '../services/therapist.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class TherapistController {
  /**
   * Create therapist profile
   * @route POST /api/v1/therapists
   */
  createProfile = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const therapist = await therapistService.createProfile(req.user.id, req.body);

    res.status(201).json({
      status: 'success',
      data: therapist
    });
  });

  /**
   * Update therapist profile
   * @route PATCH /api/v1/therapists/:id
   */
  updateProfile = catchAsync(async (req, res) => {
    const therapist = await therapistService.updateProfile(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: therapist
    });
  });

  /**
   * Get therapist profile
   * @route GET /api/v1/therapists/:id
   */
  getProfile = catchAsync(async (req, res) => {
    const therapist = await therapistService.getProfile(req.params.id);

    res.json({
      status: 'success',
      data: therapist
    });
  });

  /**
   * Search therapists
   * @route GET /api/v1/therapists
   */
  searchTherapists = catchAsync(async (req, res) => {
    const result = await therapistService.searchTherapists(req.query);

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Update availability
   * @route PATCH /api/v1/therapists/:id/availability
   */
  updateAvailability = catchAsync(async (req, res) => {
    const therapist = await therapistService.updateAvailability(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: therapist
    });
  });

  /**
   * Upload verification document
   * @route POST /api/v1/therapists/:id/documents
   */
  uploadDocument = catchAsync(async (req, res) => {
    const therapist = await therapistService.uploadDocument(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: therapist
    });
  });
}

export default new TherapistController();
