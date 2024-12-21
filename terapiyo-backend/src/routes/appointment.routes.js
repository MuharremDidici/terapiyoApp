import { Router } from 'express';
import { body, query } from 'express-validator';
import appointmentController from '../controllers/appointment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Create new appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentCreate'
 */
router.post(
  '/',
  authenticate,
  [
    body('therapist').isMongoId(),
    body('sessionType.type').isIn(['video', 'chat', 'voice']),
    body('sessionType.duration').isIn([30, 45, 60]),
    body('dateTime').isISO8601().toDate()
  ],
  appointmentController.createAppointment
);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get appointment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/:id',
  authenticate,
  appointmentController.getAppointment
);

/**
 * @swagger
 * /appointments/my:
 *   get:
 *     tags: [Appointments]
 *     summary: Get user appointments
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/my',
  authenticate,
  [
    query('status').optional().isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  appointmentController.getUserAppointments
);

/**
 * @swagger
 * /appointments/therapist/{therapistId}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get therapist appointments
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/therapist/:therapistId',
  authenticate,
  authorize('therapist'),
  [
    query('status').optional().isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  appointmentController.getTherapistAppointments
);

/**
 * @swagger
 * /appointments/{id}/status:
 *   patch:
 *     tags: [Appointments]
 *     summary: Update appointment status
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/status',
  authenticate,
  [
    body('status').isIn(['confirmed', 'completed', 'cancelled', 'no-show']),
    body('notes').optional().isString().isLength({ max: 500 })
  ],
  appointmentController.updateStatus
);

/**
 * @swagger
 * /appointments/{id}/cancel:
 *   post:
 *     tags: [Appointments]
 *     summary: Cancel appointment
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/cancel',
  authenticate,
  [
    body('reason').isString().isLength({ min: 10, max: 500 })
  ],
  appointmentController.cancelAppointment
);

/**
 * @swagger
 * /appointments/{id}/feedback:
 *   post:
 *     tags: [Appointments]
 *     summary: Add feedback for completed appointment
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/feedback',
  authenticate,
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isString().isLength({ max: 500 })
  ],
  appointmentController.addFeedback
);

export default router;
