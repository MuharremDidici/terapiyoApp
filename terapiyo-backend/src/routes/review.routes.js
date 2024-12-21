import { Router } from 'express';
import { body, query } from 'express-validator';
import reviewController from '../controllers/review.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create review
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticate,
  [
    body('appointmentId').isMongoId(),
    body('rating.overall').isInt({ min: 1, max: 5 }),
    body('rating.expertise').isInt({ min: 1, max: 5 }),
    body('rating.communication').isInt({ min: 1, max: 5 }),
    body('rating.professionalism').isInt({ min: 1, max: 5 }),
    body('comment').isString().isLength({ min: 10, max: 1000 }),
    body('language').optional().isString().isLength({ min: 2, max: 2 })
  ],
  reviewController.createReview
);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get review by ID
 */
router.get(
  '/:id',
  reviewController.getReview
);

/**
 * @swagger
 * /reviews/therapist/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get therapist reviews
 */
router.get(
  '/therapist/:id',
  [
    query('rating').optional().isInt({ min: 1, max: 5 }),
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'hidden']),
    query('sortBy').optional().isIn(['createdAt', 'rating.overall']),
    query('order').optional().isIn(['asc', 'desc']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  reviewController.getTherapistReviews
);

/**
 * @swagger
 * /reviews/therapist/{id}/stats:
 *   get:
 *     tags: [Reviews]
 *     summary: Get therapist statistics
 */
router.get(
  '/therapist/:id/stats',
  reviewController.getTherapistStats
);

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     tags: [Reviews]
 *     summary: Update review
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  authenticate,
  [
    body('rating.overall').optional().isInt({ min: 1, max: 5 }),
    body('rating.expertise').optional().isInt({ min: 1, max: 5 }),
    body('rating.communication').optional().isInt({ min: 1, max: 5 }),
    body('rating.professionalism').optional().isInt({ min: 1, max: 5 }),
    body('comment').optional().isString().isLength({ min: 10, max: 1000 })
  ],
  reviewController.updateReview
);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete review
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authenticate,
  reviewController.deleteReview
);

/**
 * @swagger
 * /reviews/{id}/moderate:
 *   post:
 *     tags: [Reviews]
 *     summary: Moderate review
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/moderate',
  authenticate,
  authorize(['admin', 'moderator']),
  [
    body('action').isIn(['approve', 'reject', 'hide']),
    body('reason').optional().isString()
  ],
  reviewController.moderateReview
);

/**
 * @swagger
 * /reviews/{id}/flag:
 *   post:
 *     tags: [Reviews]
 *     summary: Flag review
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/flag',
  authenticate,
  [
    body('reason').isIn(['inappropriate', 'spam', 'offensive', 'other']),
    body('description').optional().isString()
  ],
  reviewController.flagReview
);

/**
 * @swagger
 * /reviews/{id}/helpful:
 *   post:
 *     tags: [Reviews]
 *     summary: Mark review as helpful
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/helpful',
  authenticate,
  reviewController.markHelpful
);

/**
 * @swagger
 * /reviews/{id}/reply:
 *   post:
 *     tags: [Reviews]
 *     summary: Reply to review
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/reply',
  authenticate,
  authorize(['therapist']),
  [
    body('text').isString().isLength({ min: 1, max: 500 })
  ],
  reviewController.replyToReview
);

export default router;
