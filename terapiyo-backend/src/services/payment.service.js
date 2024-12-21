import Payment from '../models/payment.model.js';
import Wallet from '../models/wallet.model.js';
import paymentProvider from '../utils/payment.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

class PaymentService {
  /**
   * Create payment
   */
  async createPayment(userId, appointmentId, data) {
    try {
      // Create payment record
      const payment = await Payment.create({
        user: userId,
        appointment: appointmentId,
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        metadata: {
          sessionDuration: data.sessionDuration,
          sessionType: data.sessionType,
          therapistId: data.therapistId
        }
      });

      // Process payment based on method
      switch (data.paymentMethod) {
        case 'credit_card':
          const result = await paymentProvider.createPayment({
            ...data,
            appointmentId,
            user: data.user
          });

          if (result.status === 'success') {
            payment.provider = {
              name: 'iyzipay',
              transactionId: result.paymentId,
              raw: result
            };
            await payment.markAsCompleted();
          } else {
            await payment.markAsFailed({
              code: result.errorCode,
              message: result.errorMessage
            });
          }
          break;

        case 'wallet':
          const wallet = await Wallet.findOne({ user: userId });
          if (!wallet) {
            throw new ApiError(404, 'Wallet not found');
          }

          try {
            await wallet.debit(data.amount, 'Terapi seansı ödemesi', {
              type: 'payment',
              id: payment._id
            });
            await payment.markAsCompleted();
          } catch (error) {
            await payment.markAsFailed({
              code: 'INSUFFICIENT_BALANCE',
              message: error.message
            });
          }
          break;
      }

      return payment;
    } catch (error) {
      logger.error('Payment creation failed:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId, userId) {
    try {
      const payment = await Payment.findOne({
        _id: paymentId,
        user: userId
      });

      if (!payment) {
        throw new ApiError(404, 'Payment not found');
      }

      return payment;
    } catch (error) {
      logger.error('Payment retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Get user payments
   */
  async getUserPayments(userId, filters = {}) {
    try {
      const {
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = filters;

      const query = { user: userId };

      if (status) query.status = status;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Payment.countDocuments(query);

      return {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Payment retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId, userId, data) {
    try {
      const payment = await Payment.findOne({
        _id: paymentId,
        user: userId
      });

      if (!payment) {
        throw new ApiError(404, 'Payment not found');
      }

      if (!payment.isRefundable) {
        throw new ApiError(400, 'Payment is not refundable');
      }

      // Process refund based on payment method
      switch (payment.paymentMethod) {
        case 'credit_card':
          const result = await paymentProvider.createRefund({
            transactionId: payment.provider.transactionId,
            amount: data.amount,
            currency: payment.currency,
            ip: data.ip
          });

          if (result.status === 'success') {
            await payment.initiateRefund(data.amount, data.reason);
            payment.refund.status = 'completed';
            payment.refund.transactionId = result.paymentTransactionId;
            payment.refund.processedAt = new Date();
            await payment.save();
          } else {
            throw new ApiError(400, result.errorMessage);
          }
          break;

        case 'wallet':
          const wallet = await Wallet.findOne({ user: userId });
          if (!wallet) {
            throw new ApiError(404, 'Wallet not found');
          }

          await wallet.credit(data.amount, 'İade', {
            type: 'refund',
            id: payment._id
          });

          await payment.initiateRefund(data.amount, data.reason);
          payment.refund.status = 'completed';
          payment.refund.processedAt = new Date();
          await payment.save();
          break;
      }

      return payment;
    } catch (error) {
      logger.error('Payment refund failed:', error);
      throw error;
    }
  }

  /**
   * Save card
   */
  async saveCard(userId, data) {
    try {
      const result = await paymentProvider.createCardToken({
        user: data.user,
        card: data.card
      });

      if (result.status !== 'success') {
        throw new ApiError(400, result.errorMessage);
      }

      // Save card info in user profile or wallet
      // This part depends on your user/wallet model structure

      return result;
    } catch (error) {
      logger.error('Card save failed:', error);
      throw error;
    }
  }

  /**
   * Delete card
   */
  async deleteCard(userId, cardToken, cardUserKey) {
    try {
      const result = await paymentProvider.deleteCardToken({
        cardToken,
        cardUserKey
      });

      if (result.status !== 'success') {
        throw new ApiError(400, result.errorMessage);
      }

      // Remove card info from user profile or wallet
      // This part depends on your user/wallet model structure

      return result;
    } catch (error) {
      logger.error('Card deletion failed:', error);
      throw error;
    }
  }
}

export default new PaymentService();
