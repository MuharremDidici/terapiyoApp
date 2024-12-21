import { Router } from 'express';
import { body, query } from 'express-validator';
import therapistController from '../controllers/therapist.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /therapists:
 *   post:
 *     tags: [Therapists]
 *     summary: Create therapist profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TherapistProfile'
 */
router.post(
  '/',
  authenticate,
  [
    body('specialties').isArray().notEmpty(),
    body('education').isArray().notEmpty(),
    body('about').isString().isLength({ min: 100 }),
    body('languages').isArray().notEmpty(),
    body('sessionTypes').isArray().notEmpty()
  ],
  therapistController.createProfile
);

/**
 * @swagger
 * /therapists/{id}:
 *   patch:
 *     tags: [Therapists]
 *     summary: Update therapist profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch(
  '/:id',
  authenticate,
  authorize('therapist'),
  therapistController.updateProfile
);

/**
 * @swagger
 * /therapists/{id}:
 *   get:
 *     tags: [Therapists]
 *     summary: Get therapist profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', therapistController.getProfile);

/**
 * @swagger
 * /therapists:
 *   get:
 *     tags: [Therapists]
 *     summary: Search therapists
 *     parameters:
 *       - in: query
 *         name: specialties
 *         schema:
 *           type: array
 *       - in: query
 *         name: languages
 *         schema:
 *           type: array
 *       - in: query
 *         name: sessionTypes
 *         schema:
 *           type: array
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('maxPrice').optional().isFloat({ min: 0 })
  ],
  therapistController.searchTherapists
);

/**
 * @swagger
 * /therapists/{id}/availability:
 *   patch:
 *     tags: [Therapists]
 *     summary: Update therapist availability
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/availability',
  authenticate,
  authorize('therapist'),
  [
    body('schedule').isArray(),
    body('schedule.*.day').isIn([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    ]),
    body('schedule.*.slots').isArray()
  ],
  therapistController.updateAvailability
);

/**
 * @swagger
 * /therapists/{id}/documents:
 *   post:
 *     tags: [Therapists]
 *     summary: Upload verification document
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/documents',
  authenticate,
  authorize('therapist'),
  [
    body('type').isIn(['diploma', 'certificate', 'identity', 'other']),
    body('url').isURL()
  ],
  therapistController.uploadDocument
);

export default router;
