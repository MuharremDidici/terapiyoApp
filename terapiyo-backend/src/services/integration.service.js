import {
  ApiKey,
  WebhookEvent,
  ApiRequestLog
} from '../models/integration.model.js';
import Integration from '../models/integration.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { redis } from '../config/database.js';
import { generateApiKey, hashApiKey } from '../utils/crypto.js';
import { validateWebhookSignature } from '../utils/webhook.js';
import axios from 'axios';
import crypto from 'crypto';

class IntegrationService {
  /**
   * Integration işlemleri
   */
  async createIntegration(data) {
    try {
      // Hassas bilgileri şifrele
      if (data.credentials) {
        data.credentials = this.encryptCredentials(data.credentials);
      }

      const integration = new Integration(data);
      await integration.save();

      return integration;
    } catch (error) {
      logger.error('Entegrasyon oluşturma hatası:', error);
      throw error;
    }
  }

  async getIntegration(integrationId) {
    try {
      const integration = await Integration.findById(integrationId)
        .populate('createdBy', 'name email');

      if (!integration) {
        throw new ApiError(404, 'Entegrasyon bulunamadı');
      }

      return integration;
    } catch (error) {
      logger.error('Entegrasyon getirme hatası:', error);
      throw error;
    }
  }

  async updateIntegration(integrationId, updates) {
    try {
      // Hassas bilgileri şifrele
      if (updates.credentials) {
        updates.credentials = this.encryptCredentials(updates.credentials);
      }

      const integration = await Integration.findByIdAndUpdate(
        integrationId,
        updates,
        { new: true }
      );

      if (!integration) {
        throw new ApiError(404, 'Entegrasyon bulunamadı');
      }

      // Önbelleği temizle
      await this.clearIntegrationCache(integrationId);

      return integration;
    } catch (error) {
      logger.error('Entegrasyon güncelleme hatası:', error);
      throw error;
    }
  }

  async deleteIntegration(integrationId) {
    try {
      const integration = await Integration.findById(integrationId);
      if (!integration) {
        throw new ApiError(404, 'Entegrasyon bulunamadı');
      }

      // İlgili webhook'ları devre dışı bırak
      for (const webhook of integration.webhooks) {
        await this.deactivateWebhook(integrationId, webhook.url);
      }

      await integration.remove();
      await this.clearIntegrationCache(integrationId);

      return { success: true };
    } catch (error) {
      logger.error('Entegrasyon silme hatası:', error);
      throw error;
    }
  }

  /**
   * API Key işlemleri
   */
  async createApiKey(data) {
    try {
      const key = generateApiKey();
      const hashedKey = hashApiKey(key);

      const apiKey = new ApiKey({
        ...data,
        key: hashedKey
      });

      await apiKey.save();

      // Sadece oluşturma sırasında orijinal anahtarı döndür
      return {
        ...apiKey.toJSON(),
        key: key
      };
    } catch (error) {
      logger.error('API anahtarı oluşturma hatası:', error);
      throw error;
    }
  }

  async validateApiKey(key) {
    try {
      const hashedKey = hashApiKey(key);
      const apiKey = await ApiKey.findOne({
        key: hashedKey,
        status: 'active'
      }).populate('user', 'name email roles');

      if (!apiKey) {
        return null;
      }

      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        await apiKey.revoke();
        return null;
      }

      await apiKey.updateLastUsed();
      return apiKey;
    } catch (error) {
      logger.error('API anahtarı doğrulama hatası:', error);
      throw error;
    }
  }

  async revokeApiKey(keyId) {
    try {
      const apiKey = await ApiKey.findById(keyId);
      if (!apiKey) {
        throw new ApiError(404, 'API anahtarı bulunamadı');
      }

      await apiKey.revoke();
      return { success: true };
    } catch (error) {
      logger.error('API anahtarı iptal hatası:', error);
      throw error;
    }
  }

  /**
   * Webhook işlemleri
   */
  async handleWebhook(integrationId, event, payload, signature) {
    try {
      const integration = await Integration.findById(integrationId);
      if (!integration) {
        throw new ApiError(404, 'Entegrasyon bulunamadı');
      }

      // Webhook imzasını doğrula
      const webhook = integration.webhooks.find(w => 
        w.active && w.events.includes(event)
      );

      if (!webhook) {
        throw new ApiError(400, 'Webhook yapılandırması bulunamadı');
      }

      if (!validateWebhookSignature(payload, signature, webhook.secret)) {
        throw new ApiError(401, 'Geçersiz webhook imzası');
      }

      // Webhook olayını kaydet
      const webhookEvent = new WebhookEvent({
        integration: integrationId,
        event,
        payload
      });

      await webhookEvent.save();

      // Webhook'u asenkron olarak işle
      this.processWebhookEvent(webhookEvent);

      return { success: true };
    } catch (error) {
      logger.error('Webhook işleme hatası:', error);
      throw error;
    }
  }

  async processWebhookEvent(webhookEvent) {
    try {
      const integration = await Integration.findById(webhookEvent.integration);
      const webhook = integration.webhooks.find(w => 
        w.active && w.events.includes(webhookEvent.event)
      );

      if (!webhook) {
        throw new Error('Aktif webhook bulunamadı');
      }

      const attempt = {
        timestamp: new Date(),
        status: 'pending'
      };

      try {
        // Webhook URL'sine POST isteği gönder
        const response = await axios.post(webhook.url, webhookEvent.payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': webhookEvent.event,
            'X-Webhook-Signature': this.generateWebhookSignature(
              webhookEvent.payload,
              webhook.secret
            )
          },
          timeout: 5000
        });

        if (response.status >= 200 && response.status < 300) {
          attempt.status = 'success';
          webhookEvent.status = 'processed';
        } else {
          attempt.status = 'failed';
          attempt.error = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        attempt.status = 'failed';
        attempt.error = error.message;
      }

      await webhookEvent.addAttempt(attempt);

      if (attempt.status === 'failed') {
        // Başarısız webhook'ları yeniden deneme kuyruğuna ekle
        await this.scheduleWebhookRetry(webhookEvent);
      }
    } catch (error) {
      logger.error('Webhook işleme hatası:', error);
      throw error;
    }
  }

  /**
   * API İzleme ve Loglama
   */
  async logApiRequest(data) {
    try {
      const log = new ApiRequestLog(data);
      await log.save();

      // Metrikleri güncelle
      await this.updateApiMetrics(data);

      return log;
    } catch (error) {
      logger.error('API isteği loglama hatası:', error);
      // Loglama hatası kritik değil, sessizce devam et
    }
  }

  async getApiMetrics(filters) {
    try {
      const query = {};

      if (filters.user) query.user = filters.user;
      if (filters.apiKey) query.apiKey = filters.apiKey;
      if (filters.method) query.method = filters.method;
      if (filters.endpoint) query.endpoint = filters.endpoint;

      if (filters.startDate) {
        query.timestamp = { $gte: new Date(filters.startDate) };
      }
      if (filters.endDate) {
        query.timestamp = {
          ...query.timestamp,
          $lte: new Date(filters.endDate)
        };
      }

      const [
        totalRequests,
        averageDuration,
        statusCodes,
        methodDistribution
      ] = await Promise.all([
        ApiRequestLog.countDocuments(query),
        ApiRequestLog.aggregate([
          { $match: query },
          { $group: { _id: null, avg: { $avg: '$duration' } } }
        ]),
        ApiRequestLog.aggregate([
          { $match: query },
          { $group: { _id: '$response.status', count: { $sum: 1 } } }
        ]),
        ApiRequestLog.aggregate([
          { $match: query },
          { $group: { _id: '$method', count: { $sum: 1 } } }
        ])
      ]);

      return {
        totalRequests,
        averageDuration: averageDuration[0]?.avg || 0,
        statusCodes: this.formatMetricResults(statusCodes),
        methodDistribution: this.formatMetricResults(methodDistribution)
      };
    } catch (error) {
      logger.error('API metrikleri getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Yardımcı metodlar
   */
  encryptCredentials(credentials) {
    const encryptedCreds = new Map();
    for (const [key, value] of credentials.entries()) {
      encryptedCreds.set(key, this.encrypt(value));
    }
    return encryptedCreds;
  }

  encrypt(text) {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encrypted) {
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  generateWebhookSignature(payload, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  async clearIntegrationCache(integrationId) {
    const keys = await redis.keys(`integration:${integrationId}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  async scheduleWebhookRetry(webhookEvent) {
    const attempts = webhookEvent.attempts.length;
    if (attempts >= 5) {
      webhookEvent.status = 'failed';
      await webhookEvent.save();
      return;
    }

    // Üstel geri çekilme ile yeniden deneme
    const delay = Math.min(1000 * Math.pow(2, attempts), 3600000);
    setTimeout(() => {
      this.processWebhookEvent(webhookEvent);
    }, delay);
  }

  formatMetricResults(results) {
    return results.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }

  async updateApiMetrics(requestData) {
    const key = `api:metrics:${requestData.endpoint}`;
    const pipeline = redis.pipeline();

    pipeline.hincrby(key, 'total', 1);
    pipeline.hincrby(key, `status:${requestData.response.status}`, 1);
    pipeline.hincrby(key, `method:${requestData.method}`, 1);

    if (requestData.duration) {
      pipeline.hset(key, 'duration', requestData.duration);
    }

    await pipeline.exec();
  }
}

export default new IntegrationService();
