import { validationResult } from 'express-validator';
import paymentService from '../services/payment.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class PaymentController {
  /**
   * Create payment
   * @route POST /api/v1/payments
   */
  createPayment = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const payment = await paymentService.createPayment(
      req.user.id,
      req.body.appointmentId,
      {
        ...req.body,
        user: req.user,
        ip: req.ip
      }
    );

    res.status(201).json({
      status: 'success',
      data: payment
    });
  });

  /**
   * Get payment by ID
   * @route GET /api/v1/payments/:id
   */
  getPayment = catchAsync(async (req, res) => {
    const payment = await paymentService.getPayment(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      data: payment
    });
  });

  /**
   * Get user payments
   * @route GET /api/v1/payments
   */
  getUserPayments = catchAsync(async (req, res) => {
    const result = await paymentService.getUserPayments(
      req.user.id,
      req.query
    );

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Refund payment
   * @route POST /api/v1/payments/:id/refund
   */
  refundPayment = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const payment = await paymentService.refundPayment(
      req.params.id,
      req.user.id,
      {
        ...req.body,
        ip: req.ip
      }
    );

    res.json({
      status: 'success',
      data: payment
    });
  });

  /**
   * Save card
   * @route POST /api/v1/payments/cards
   */
  saveCard = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const result = await paymentService.saveCard(
      req.user.id,
      {
        user: req.user,
        card: req.body
      }
    );

    res.status(201).json({
      status: 'success',
      data: result
    });
  });

  /**
   * Delete card
   * @route DELETE /api/v1/payments/cards/:token
   */
  deleteCard = catchAsync(async (req, res) => {
    await paymentService.deleteCard(
      req.user.id,
      req.params.token,
      req.query.userKey
    );

    res.json({
      status: 'success',
      message: 'Card deleted'
    });
  });
}

export default new PaymentController();
