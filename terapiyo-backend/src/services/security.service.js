import {
  AuditLog,
  SecurityAlert,
  SecurityPolicy,
  SecurityConfig
} from '../models/security.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { redis } from '../config/database.js';

class SecurityService {
  /**
   * Denetim günlüğü işlemleri
   */
  async logAudit(data) {
    try {
      const log = new AuditLog(data);
      await log.save();

      // Kritik işlemleri gerçek zamanlı izle
      if (this.isCriticalAction(data.action)) {
        await this.monitorCriticalAction(log);
      }

      return log;
    } catch (error) {
      logger.error('Denetim günlüğü oluşturma hatası:', error);
      throw error;
    }
  }

  async getAuditLogs(filters) {
    try {
      const query = {};

      if (filters.user) query.user = filters.user;
      if (filters.action) query.action = filters.action;
      if (filters.resource) query.resource = filters.resource;
      if (filters.status) query.status = filters.status;
      if (filters.startDate && filters.endDate) {
        query.timestamp = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      return AuditLog.find(query)
        .sort({ timestamp: -1 })
        .populate('user', 'name email')
        .limit(filters.limit || 100);
    } catch (error) {
      logger.error('Denetim günlüğü getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Güvenlik uyarısı işlemleri
   */
  async createAlert(data) {
    try {
      const alert = await SecurityAlert.createAlert(data);

      // Kritik uyarıları bildir
      if (alert.severity === 'high' || alert.severity === 'critical') {
        await this.notifyCriticalAlert(alert);
      }

      return alert;
    } catch (error) {
      logger.error('Güvenlik uyarısı oluşturma hatası:', error);
      throw error;
    }
  }

  async getAlerts(filters) {
    try {
      const query = {};

      if (filters.type) query.type = filters.type;
      if (filters.severity) query.severity = filters.severity;
      if (filters.status) query.status = filters.status;
      if (filters.startDate && filters.endDate) {
        query.timestamp = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      return SecurityAlert.find(query)
        .sort({ timestamp: -1 })
        .populate('affectedUsers', 'name email')
        .limit(filters.limit || 100);
    } catch (error) {
      logger.error('Güvenlik uyarıları getirme hatası:', error);
      throw error;
    }
  }

  async updateAlertStatus(alertId, status, resolution) {
    try {
      const alert = await SecurityAlert.findById(alertId);
      if (!alert) {
        throw new ApiError(404, 'Uyarı bulunamadı');
      }

      alert.status = status;
      if (resolution) {
        alert.resolution = {
          ...resolution,
          timestamp: new Date()
        };
      }

      await alert.save();
      return alert;
    } catch (error) {
      logger.error('Uyarı durumu güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Güvenlik politikası işlemleri
   */
  async getPolicy(name) {
    try {
      // Önbellekten politikayı kontrol et
      const cachedPolicy = await redis.get(`policy:${name}`);
      if (cachedPolicy) {
        return JSON.parse(cachedPolicy);
      }

      const policy = await SecurityPolicy.findOne({ name });
      if (!policy) {
        throw new ApiError(404, 'Politika bulunamadı');
      }

      // Politikayı önbelleğe al
      await redis.setex(
        `policy:${name}`,
        3600, // 1 saat
        JSON.stringify(policy)
      );

      return policy;
    } catch (error) {
      logger.error('Güvenlik politikası getirme hatası:', error);
      throw error;
    }
  }

  async updatePolicy(name, updates) {
    try {
      const policy = await SecurityPolicy.findOne({ name });
      if (!policy) {
        throw new ApiError(404, 'Politika bulunamadı');
      }

      // Versiyon kontrolü
      if (updates.version && updates.version !== policy.version) {
        throw new ApiError(409, 'Politika versiyonu uyuşmuyor');
      }

      // Politikayı güncelle
      Object.assign(policy, updates);
      policy.version += 1;
      policy.lastUpdated = new Date();

      await policy.save();

      // Önbelleği temizle
      await redis.del(`policy:${name}`);

      return policy;
    } catch (error) {
      logger.error('Güvenlik politikası güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Güvenlik yapılandırması işlemleri
   */
  async getConfig(key) {
    try {
      const config = await SecurityConfig.findOne({ key });
      if (!config) {
        throw new ApiError(404, 'Yapılandırma bulunamadı');
      }

      return config;
    } catch (error) {
      logger.error('Güvenlik yapılandırması getirme hatası:', error);
      throw error;
    }
  }

  async updateConfig(key, value, description) {
    try {
      const config = await SecurityConfig.findOneAndUpdate(
        { key },
        {
          value,
          description,
          lastUpdated: new Date()
        },
        { new: true, upsert: true }
      );

      return config;
    } catch (error) {
      logger.error('Güvenlik yapılandırması güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Yardımcı metodlar
   */
  isCriticalAction(action) {
    const criticalActions = [
      'delete',
      'authorize',
      'share',
      'upload'
    ];
    return criticalActions.includes(action);
  }

  async monitorCriticalAction(log) {
    try {
      // Son 5 dakika içindeki başarısız girişimleri kontrol et
      const recentFailures = await AuditLog.countDocuments({
        user: log.user,
        action: log.action,
        status: 'failure',
        timestamp: {
          $gte: new Date(Date.now() - 5 * 60 * 1000)
        }
      });

      if (recentFailures >= 3) {
        await this.createAlert({
          type: 'permission_violation',
          severity: 'high',
          source: 'audit_log',
          description: `Çok sayıda başarısız ${log.action} denemesi tespit edildi`,
          affectedUsers: [log.user]
        });
      }
    } catch (error) {
      logger.error('Kritik işlem izleme hatası:', error);
    }
  }

  async notifyCriticalAlert(alert) {
    try {
      // E-posta bildirimi gönder
      // TODO: E-posta gönderme işlemi

      // Slack bildirimi gönder
      // TODO: Slack entegrasyonu

      // SMS bildirimi gönder
      // TODO: SMS entegrasyonu
    } catch (error) {
      logger.error('Kritik uyarı bildirimi hatası:', error);
    }
  }
}

export default new SecurityService();
