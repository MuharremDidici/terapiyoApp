import Iyzipay from 'iyzipay';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

class PaymentProvider {
  constructor() {
    if (process.env.IYZIPAY_API_KEY && process.env.IYZIPAY_SECRET_KEY && process.env.IYZIPAY_URI) {
      this.iyzipay = new Iyzipay({
        apiKey: process.env.IYZIPAY_API_KEY,
        secretKey: process.env.IYZIPAY_SECRET_KEY,
        uri: process.env.IYZIPAY_URI
      });
    } else {
      logger.warn('Iyzipay credentials not found. Payment features will be disabled.');
    }
  }

  /**
   * Create payment
   */
  async createPayment(data) {
    try {
      if (!this.iyzipay) {
        throw new Error('Payment provider not configured');
      }

      const request = {
        locale: 'tr',
        conversationId: uuidv4(),
        price: data.amount.toString(),
        paidPrice: data.amount.toString(),
        currency: data.currency,
        installment: '1',
        basketId: data.appointmentId,
        paymentChannel: 'WEB',
        paymentGroup: 'PRODUCT',
        paymentCard: {
          cardHolderName: data.card.holderName,
          cardNumber: data.card.number,
          expireMonth: data.card.expireMonth,
          expireYear: data.card.expireYear,
          cvc: data.card.cvc,
          registerCard: data.saveCard ? 1 : 0
        },
        buyer: {
          id: data.user.id,
          name: data.user.firstName,
          surname: data.user.lastName,
          email: data.user.email,
          identityNumber: data.user.identityNumber || '11111111111',
          registrationAddress: data.user.address || 'NA',
          ip: data.ip,
          city: data.user.city || 'NA',
          country: data.user.country || 'Turkey'
        },
        shippingAddress: {
          contactName: `${data.user.firstName} ${data.user.lastName}`,
          city: data.user.city || 'NA',
          country: data.user.country || 'Turkey',
          address: data.user.address || 'NA'
        },
        billingAddress: {
          contactName: `${data.user.firstName} ${data.user.lastName}`,
          city: data.user.city || 'NA',
          country: data.user.country || 'Turkey',
          address: data.user.address || 'NA'
        },
        basketItems: [
          {
            id: data.appointmentId,
            name: 'Terapi Seansı',
            category1: 'Sağlık',
            category2: 'Terapi',
            itemType: 'VIRTUAL',
            price: data.amount.toString()
          }
        ]
      };

      const result = await new Promise((resolve, reject) => {
        this.iyzipay.payment.create(request, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      return result;
    } catch (error) {
      logger.error('Payment creation failed:', error);
      throw error;
    }
  }

  /**
   * Create refund
   */
  async createRefund(data) {
    try {
      if (!this.iyzipay) {
        throw new Error('Payment provider not configured');
      }

      const request = {
        locale: 'tr',
        conversationId: uuidv4(),
        paymentTransactionId: data.transactionId,
        price: data.amount.toString(),
        currency: data.currency,
        ip: data.ip
      };

      const result = await new Promise((resolve, reject) => {
        this.iyzipay.refund.create(request, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      return result;
    } catch (error) {
      logger.error('Refund creation failed:', error);
      throw error;
    }
  }

  /**
   * Create card token
   */
  async createCardToken(data) {
    try {
      if (!this.iyzipay) {
        throw new Error('Payment provider not configured');
      }

      const request = {
        locale: 'tr',
        conversationId: uuidv4(),
        email: data.user.email,
        card: {
          cardAlias: data.card.alias,
          cardHolderName: data.card.holderName,
          cardNumber: data.card.number,
          expireMonth: data.card.expireMonth,
          expireYear: data.card.expireYear
        }
      };

      const result = await new Promise((resolve, reject) => {
        this.iyzipay.card.create(request, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      return result;
    } catch (error) {
      logger.error('Card token creation failed:', error);
      throw error;
    }
  }

  /**
   * Delete card token
   */
  async deleteCardToken(data) {
    try {
      if (!this.iyzipay) {
        throw new Error('Payment provider not configured');
      }

      const request = {
        locale: 'tr',
        conversationId: uuidv4(),
        cardToken: data.cardToken,
        cardUserKey: data.cardUserKey
      };

      const result = await new Promise((resolve, reject) => {
        this.iyzipay.card.delete(request, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      return result;
    } catch (error) {
      logger.error('Card token deletion failed:', error);
      throw error;
    }
  }

  /**
   * Get installment info
   */
  async getInstallmentInfo(data) {
    try {
      if (!this.iyzipay) {
        throw new Error('Payment provider not configured');
      }

      const request = {
        locale: 'tr',
        conversationId: uuidv4(),
        binNumber: data.binNumber,
        price: data.amount.toString()
      };

      const result = await new Promise((resolve, reject) => {
        this.iyzipay.installmentInfo.retrieve(request, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      return result;
    } catch (error) {
      logger.error('Installment info retrieval failed:', error);
      throw error;
    }
  }
}

export default new PaymentProvider();
