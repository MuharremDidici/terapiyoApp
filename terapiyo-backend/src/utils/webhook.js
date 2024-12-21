import axios from 'axios';
import { hmac } from './crypto.js';
import logger from '../config/logger.js';

/**
 * Webhook gönderici
 */
export class WebhookSender {
  constructor(options = {}) {
    this.options = {
      retryCount: options.retryCount || 3,
      retryDelay: options.retryDelay || 1000,
      timeout: options.timeout || 5000,
      signatureHeader: options.signatureHeader || 'X-Webhook-Signature',
      userAgent: options.userAgent || 'Terapiyo-Webhook/1.0'
    };

    this.axios = axios.create({
      timeout: this.options.timeout,
      headers: {
        'User-Agent': this.options.userAgent
      }
    });
  }

  /**
   * Webhook gönder
   */
  async send(url, payload, options = {}) {
    const retryCount = options.retryCount || this.options.retryCount;
    const retryDelay = options.retryDelay || this.options.retryDelay;
    const secret = options.secret || process.env.WEBHOOK_SECRET;

    let lastError;
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        // İmza oluştur
        const signature = this.#generateSignature(payload, secret);

        // İsteği gönder
        const response = await this.axios.post(url, payload, {
          headers: {
            [this.options.signatureHeader]: signature
          }
        });

        // Başarılı yanıt
        return {
          success: true,
          statusCode: response.status,
          data: response.data
        };
      } catch (error) {
        lastError = error;
        logger.warn(`Webhook attempt ${attempt} failed:`, error.message);

        // Son deneme değilse bekle
        if (attempt < retryCount) {
          await this.#sleep(retryDelay * attempt);
        }
      }
    }

    // Tüm denemeler başarısız
    logger.error('All webhook attempts failed:', lastError);
    return {
      success: false,
      error: lastError.message
    };
  }

  /**
   * İmza oluştur
   */
  #generateSignature(payload, secret) {
    const timestamp = Date.now().toString();
    const data = `${timestamp}.${JSON.stringify(payload)}`;
    const signature = hmac(data, secret);
    return `t=${timestamp},s=${signature}`;
  }

  /**
   * Belirli bir süre bekle
   */
  #sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Webhook alıcı
 */
export class WebhookReceiver {
  constructor(options = {}) {
    this.options = {
      signatureHeader: options.signatureHeader || 'X-Webhook-Signature',
      maxBodySize: options.maxBodySize || '100kb',
      toleranceMs: options.toleranceMs || 300000 // 5 dakika
    };
  }

  /**
   * İsteği doğrula
   */
  verify(signature, payload, secret = process.env.WEBHOOK_SECRET) {
    try {
      if (!signature) {
        throw new Error('No signature provided');
      }

      // İmza parçalarını ayır
      const [timestamp, providedSignature] = this.#parseSignature(signature);

      // Zaman damgasını kontrol et
      this.#verifyTimestamp(timestamp);

      // İmzayı doğrula
      const data = `${timestamp}.${JSON.stringify(payload)}`;
      const expectedSignature = hmac(data, secret);

      if (providedSignature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      return true;
    } catch (error) {
      logger.error('Webhook verification failed:', error);
      return false;
    }
  }

  /**
   * İmza parçalarını ayır
   */
  #parseSignature(signature) {
    const matches = signature.match(/t=(\d+),s=([a-f0-9]+)/i);
    if (!matches) {
      throw new Error('Invalid signature format');
    }
    return [matches[1], matches[2]];
  }

  /**
   * Zaman damgasını doğrula
   */
  #verifyTimestamp(timestamp) {
    const now = Date.now();
    const timestampMs = parseInt(timestamp, 10);

    if (isNaN(timestampMs)) {
      throw new Error('Invalid timestamp');
    }

    if (Math.abs(now - timestampMs) > this.options.toleranceMs) {
      throw new Error('Timestamp too old');
    }
  }
}

/**
 * Webhook gönderici ve alıcı örnekleri oluştur
 */
export const webhookSender = new WebhookSender();
export const webhookReceiver = new WebhookReceiver();

export const validateWebhookSignature = (signature, payload, secret) => {
  return webhookReceiver.verify(signature, payload, secret);
};

export default {
  webhookSender,
  webhookReceiver,
  validateWebhookSignature
};
