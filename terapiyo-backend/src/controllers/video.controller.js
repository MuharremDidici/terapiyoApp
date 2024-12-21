import { validationResult } from 'express-validator';
import videoService from '../services/video.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class VideoController {
  /**
   * Create video session
   * @route POST /api/v1/video/sessions
   */
  createSession = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const session = await videoService.createSession(
      req.body.appointmentId,
      req.user.id,
      req.body.clientId,
      {
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        features: req.body.features,
        settings: req.body.settings,
        platform: req.body.platform,
        sdkVersion: req.body.sdkVersion,
        region: req.body.region
      }
    );

    res.status(201).json({
      status: 'success',
      data: session
    });
  });

  /**
   * Join video session
   * @route POST /api/v1/video/sessions/:id/join
   */
  joinSession = catchAsync(async (req, res) => {
    const sessionData = await videoService.joinSession(
      req.params.id,
      req.user.id,
      req.body.deviceInfo
    );

    res.json({
      status: 'success',
      data: sessionData
    });
  });

  /**
   * Leave video session
   * @route POST /api/v1/video/sessions/:id/leave
   */
  leaveSession = catchAsync(async (req, res) => {
    const session = await videoService.leaveSession(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      data: session
    });
  });

  /**
   * Start recording
   * @route POST /api/v1/video/sessions/:id/recording/start
   */
  startRecording = catchAsync(async (req, res) => {
    const session = await videoService.startRecording(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      data: session
    });
  });

  /**
   * Stop recording
   * @route POST /api/v1/video/sessions/:id/recording/stop
   */
  stopRecording = catchAsync(async (req, res) => {
    const session = await videoService.stopRecording(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      data: session
    });
  });

  /**
   * Toggle feature
   * @route POST /api/v1/video/sessions/:id/features/:feature
   */
  toggleFeature = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const session = await videoService.toggleFeature(
      req.params.id,
      req.user.id,
      req.params.feature,
      req.body.enabled
    );

    res.json({
      status: 'success',
      data: session
    });
  });

  /**
   * Update settings
   * @route PATCH /api/v1/video/sessions/:id/settings
   */
  updateSettings = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const session = await videoService.updateSettings(
      req.params.id,
      req.user.id,
      req.body.settings
    );

    res.json({
      status: 'success',
      data: session
    });
  });

  /**
   * Send chat message
   * @route POST /api/v1/video/sessions/:id/chat
   */
  sendChatMessage = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const session = await videoService.sendChatMessage(
      req.params.id,
      req.user.id,
      req.body.content,
      req.body.type,
      req.file
    );

    res.json({
      status: 'success',
      data: session
    });
  });

  /**
   * Update quality metrics
   * @route POST /api/v1/video/sessions/:id/quality
   */
  updateQualityMetrics = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const session = await videoService.updateQualityMetrics(
      req.params.id,
      req.body.metrics
    );

    res.json({
      status: 'success',
      data: session
    });
  });

  /**
   * Get session
   * @route GET /api/v1/video/sessions/:id
   */
  getSession = catchAsync(async (req, res) => {
    const session = await VideoSession.findById(req.params.id)
      .populate('therapist', 'firstName lastName avatar')
      .populate('client', 'firstName lastName avatar')
      .populate('participants.user', 'firstName lastName avatar');

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    if (!session.therapist.equals(req.user.id) && !session.client.equals(req.user.id)) {
      throw new ApiError(403, 'Not authorized to view this session');
    }

    res.json({
      status: 'success',
      data: session
    });
  });

  /**
   * Get user sessions
   * @route GET /api/v1/video/sessions
   */
  getUserSessions = catchAsync(async (req, res) => {
    const sessions = await VideoSession.find({
      $or: [
        { therapist: req.user.id },
        { client: req.user.id }
      ]
    })
      .populate('therapist', 'firstName lastName avatar')
      .populate('client', 'firstName lastName avatar')
      .sort('-startTime');

    res.json({
      status: 'success',
      data: sessions
    });
  });
}

export default new VideoController();
