import { Router } from 'express';
import { body, param } from 'express-validator';
import videoController from '../controllers/video.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

/**
 * Session routes
 */
router.post(
  '/sessions',
  authenticate,
  authorize(['therapist']),
  [
    body('appointmentId').isMongoId(),
    body('clientId').isMongoId(),
    body('startTime').isISO8601(),
    body('endTime').isISO8601(),
    body('features').optional().isObject(),
    body('settings').optional().isObject(),
    body('platform').optional().isString(),
    body('sdkVersion').optional().isString(),
    body('region').optional().isString()
  ],
  videoController.createSession
);

router.post(
  '/sessions/:id/join',
  authenticate,
  [
    param('id').isMongoId(),
    body('deviceInfo').isObject()
  ],
  videoController.joinSession
);

router.post(
  '/sessions/:id/leave',
  authenticate,
  [
    param('id').isMongoId()
  ],
  videoController.leaveSession
);

/**
 * Recording routes
 */
router.post(
  '/sessions/:id/recording/start',
  authenticate,
  authorize(['therapist']),
  [
    param('id').isMongoId()
  ],
  videoController.startRecording
);

router.post(
  '/sessions/:id/recording/stop',
  authenticate,
  authorize(['therapist']),
  [
    param('id').isMongoId()
  ],
  videoController.stopRecording
);

/**
 * Feature routes
 */
router.post(
  '/sessions/:id/features/:feature',
  authenticate,
  [
    param('id').isMongoId(),
    param('feature').isIn([
      'screenSharing',
      'recording',
      'chat',
      'whiteboard',
      'fileSharing',
      'backgroundBlur'
    ]),
    body('enabled').isBoolean()
  ],
  videoController.toggleFeature
);

/**
 * Settings routes
 */
router.patch(
  '/sessions/:id/settings',
  authenticate,
  authorize(['therapist']),
  [
    param('id').isMongoId(),
    body('settings').isObject(),
    body('settings.maxParticipants').optional().isInt({ min: 2, max: 10 }),
    body('settings.videoQuality').optional().isIn(['low', 'medium', 'high', 'hd']),
    body('settings.audioQuality').optional().isIn(['low', 'medium', 'high']),
    body('settings.layout').optional().isIn(['grid', 'spotlight', 'sidebar']),
    body('settings.autoRecording').optional().isBoolean(),
    body('settings.requireAuthentication').optional().isBoolean(),
    body('settings.waitingRoom').optional().isBoolean(),
    body('settings.notifications').optional().isObject()
  ],
  videoController.updateSettings
);

/**
 * Chat routes
 */
router.post(
  '/sessions/:id/chat',
  authenticate,
  upload.single('file'),
  [
    param('id').isMongoId(),
    body('content').isString().trim().notEmpty(),
    body('type').isIn(['text', 'file'])
  ],
  videoController.sendChatMessage
);

/**
 * Quality routes
 */
router.post(
  '/sessions/:id/quality',
  authenticate,
  [
    param('id').isMongoId(),
    body('metrics').isObject(),
    body('metrics.resolution').optional().isString(),
    body('metrics.frameRate').optional().isNumeric(),
    body('metrics.bitrate').optional().isNumeric(),
    body('metrics.packetLoss').optional().isNumeric(),
    body('metrics.jitter').optional().isNumeric(),
    body('metrics.latency').optional().isNumeric()
  ],
  videoController.updateQualityMetrics
);

/**
 * Query routes
 */
router.get(
  '/sessions/:id',
  authenticate,
  [
    param('id').isMongoId()
  ],
  videoController.getSession
);

router.get(
  '/sessions',
  authenticate,
  videoController.getUserSessions
);

export default router;
