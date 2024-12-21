import { Router } from 'express';
import { body, query } from 'express-validator';
import paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create payment
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticate,
  [
    body('appointmentId').isMongoId(),
    body('amount').isFloat({ min: 0 }),
    body('currency').isIn(['TRY', 'USD', 'EUR']),
    body('paymentMethod').isIn(['credit_card', 'wallet']),
    body('card').optional().isObject(),
    body('card.holderName').optional().isString(),
    body('card.number').optional().isCreditCard(),
    body('card.expireMonth').optional().isInt({ min: 1, max: 12 }),
    body('card.expireYear').optional().isInt({ min: 2023 }),
    body('card.cvc').optional().isLength({ min: 3, max: 4 }),
    body('saveCard').optional().isBoolean()
  ],
  paymentController.createPayment
);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  authenticate,
  paymentController.getPayment
);

/**
 * @swagger
 * /payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get user payments
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authenticate,
  [
    query('status').optional().isIn(['pending', 'completed', 'failed', 'refunded']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  paymentController.getUserPayments
);

/**
 * @swagger
 * /payments/{id}/refund:
 *   post:
 *     tags: [Payments]
 *     summary: Refund payment
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/refund',
  authenticate,
  [
    body('amount').isFloat({ min: 0 }),
    body('reason').isString().isLength({ min: 1 })
  ],
  paymentController.refundPayment
);

/**
 * @swagger
 * /payments/cards:
 *   post:
 *     tags: [Payments]
 *     summary: Save card
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/cards',
  authenticate,
  [
    body('alias').isString(),
    body('holderName').isString(),
    body('number').isCreditCard(),
    body('expireMonth').isInt({ min: 1, max: 12 }),
    body('expireYear').isInt({ min: 2023 })
  ],
  paymentController.saveCard
);

/**
 * @swagger
 * /payments/cards/{token}:
 *   delete:
 *     tags: [Payments]
 *     summary: Delete card
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/cards/:token',
  authenticate,
  [
    query('userKey').isString()
  ],
  paymentController.deleteCard
);

export default router;
